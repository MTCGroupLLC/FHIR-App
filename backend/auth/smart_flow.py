"""
SMART on FHIR auth flows:

  Standalone (patient-directed):
    build_authorization_url()  → redirect patient to EHR
    exchange_code()            → swap auth code + PKCE verifier for token

  Backend Services (B2B / system-to-system):
    get_backend_services_token()  → signed JWT → client_credentials token
"""

import time
import uuid
import logging
from typing import Optional
from urllib.parse import urlencode

import httpx
import jwt

from auth.keys import KID, get_private_key_pem
from auth.pkce import generate_pkce_pair
from auth.smart_discovery import discover_smart_config
from auth.token_cache import (
    delete_state_and_verifier,
    get_verifier,
    get_state,
    store_state,
    store_token,
    store_verifier,
)
from core.config import settings
from models.endpoint import FHIREndpoint, SmartConfig

logger = logging.getLogger(__name__)

PATIENT_SCOPES = "patient/*.read launch/patient openid fhirUser"
SYSTEM_SCOPES = "system/Patient.read"


# ---------------------------------------------------------------------------
# Standalone (patient-directed) flow
# ---------------------------------------------------------------------------

async def build_authorization_url(
    endpoint: FHIREndpoint,
    redirect_uri: str,
    client_id: str,
    extra_scopes: str = "",
) -> Optional[str]:
    """
    Returns the URL the patient should be redirected to for SMART authorization,
    or None if the endpoint doesn't support SMART.
    """
    smart = await _get_smart_config(endpoint)
    if not smart or not smart.authorization_endpoint:
        return None

    state = str(uuid.uuid4())
    verifier, challenge = generate_pkce_pair()

    await store_state(state, {"endpoint_id": endpoint.id, "redirect_uri": redirect_uri})
    await store_verifier(state, verifier)

    scopes = PATIENT_SCOPES
    if extra_scopes:
        scopes = f"{scopes} {extra_scopes}"

    effective_client_id = endpoint.client_id or client_id

    params = {
        "response_type": "code",
        "client_id": effective_client_id,
        "redirect_uri": redirect_uri,
        "scope": scopes,
        "state": state,
        "aud": endpoint.base_url,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    return f"{smart.authorization_endpoint}?{urlencode(params)}"


async def exchange_code(
    state: str,
    code: str,
    redirect_uri: str,
    client_id: str,
) -> Optional[str]:
    """
    Exchanges an authorization code for an access token.
    Returns the access token, or None on failure.
    Cleans up state/verifier from Redis after use.
    """
    state_data = await get_state(state)
    verifier = await get_verifier(state)

    if not state_data or not verifier:
        logger.warning("Missing state or verifier for state=%s", state)
        return None

    endpoint_id = state_data["endpoint_id"]
    await delete_state_and_verifier(state)

    # We need the endpoint's token URL — re-discover from cached smart config.
    # The endpoint object isn't stored in state; use endpoint_id to look up.
    # For simplicity, re-discover via the endpoint registry.
    from registry.cache import get_all_endpoints

    endpoints = await get_all_endpoints()
    endpoint = next((e for e in endpoints if e.id == endpoint_id), None)
    if not endpoint:
        logger.error("Endpoint %s not found in registry during callback", endpoint_id)
        return None

    smart = await _get_smart_config(endpoint)
    if not smart:
        return None

    effective_client_id = endpoint.client_id or client_id

    token_body: dict = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": effective_client_id,
        "code_verifier": verifier,
    }
    if endpoint.client_secret:
        token_body["client_secret"] = endpoint.client_secret

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                smart.token_endpoint,
                data=token_body,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=15,
            )
            resp.raise_for_status()
            token_data = resp.json()
            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            if access_token:
                await store_token(endpoint_id, access_token, expires_in)
            return access_token
        except Exception as e:
            logger.error("Token exchange failed for endpoint %s: %s", endpoint_id, e)
            return None


# ---------------------------------------------------------------------------
# Backend Services (B2B / system-to-system) flow — SMART v2
# ---------------------------------------------------------------------------

async def get_backend_services_token(
    endpoint: FHIREndpoint,
    client_id: str,
    kid: str = KID,
) -> Optional[str]:
    """
    SMART Backend Services: signs a JWT with the managed private key and
    exchanges it for an access token via the client_credentials grant.
    Returns the access token or None.
    """
    smart = await _get_smart_config(endpoint)
    if not smart:
        logger.debug("No SMART config for %s", endpoint.base_url)
        return None

    private_key_pem = await get_private_key_pem()

    now = int(time.time())
    claims = {
        "iss": client_id,
        "sub": client_id,
        "aud": smart.token_endpoint,
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": now + 300,  # 5 min max per spec
    }

    try:
        signed_jwt = jwt.encode(
            claims,
            private_key_pem,
            algorithm="RS384",
            headers={"kid": kid},
        )
    except Exception as e:
        logger.error("JWT signing failed: %s", e)
        return None

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                smart.token_endpoint,
                data={
                    "grant_type": "client_credentials",
                    "client_assertion_type": (
                        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
                    ),
                    "client_assertion": signed_jwt,
                    "scope": SYSTEM_SCOPES,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=15,
            )
            resp.raise_for_status()
            token_data = resp.json()
            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            if access_token:
                await store_token(endpoint.id, access_token, expires_in)
            return access_token
        except Exception as e:
            logger.error(
                "Backend services token request failed for %s: %s", endpoint.base_url, e
            )
            return None


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

async def _get_smart_config(endpoint: FHIREndpoint) -> Optional[SmartConfig]:
    """Returns SmartConfig from cache/discovery, falling back to static endpoint fields."""
    discovered = await discover_smart_config(endpoint.base_url)
    if discovered:
        return discovered

    # Use statically configured URLs if discovery fails
    if endpoint.token_url:
        return SmartConfig(
            authorization_endpoint=endpoint.authorize_url,
            token_endpoint=endpoint.token_url,
        )
    return None

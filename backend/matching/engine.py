"""
Patient matching against a single FHIR endpoint.

Strategy:
  1. Check Redis token cache — use bearer token if present.
  2. For open endpoints, query directly.
  3. For SMART endpoints without a cached token, auto-discover auth config and
     return the authorization URL so the patient can grant access.
  4. Fetch CapabilityStatement to confirm Patient support.
  5. Try Patient/$match, fall back to demographic search.
"""

import logging
from typing import Optional

import httpx

from auth.smart_discovery import discover_smart_config
from auth.token_cache import get_token
from core.config import settings
from models.endpoint import AuthType, FHIREndpoint, MatchResult
from models.patient import PatientDemographics

logger = logging.getLogger(__name__)


def _build_match_params(demo: PatientDemographics) -> dict:
    params: dict = {
        "family": demo.last_name,
        "given": demo.first_name,
        "birthdate": demo.date_of_birth,
    }
    if demo.gender:
        params["gender"] = demo.gender.value
    if demo.postal_code:
        params["address-postalcode"] = demo.postal_code
    if demo.phone:
        params["telecom"] = demo.phone
    return params


def _build_match_body(demo: PatientDemographics) -> dict:
    name_part: dict = {
        "name": "resource",
        "resource": {
            "resourceType": "Patient",
            "name": [{"family": demo.last_name, "given": [demo.first_name]}],
            "birthDate": demo.date_of_birth,
        },
    }
    if demo.gender:
        name_part["resource"]["gender"] = demo.gender.value
    if demo.postal_code or demo.street:
        addr: dict = {}
        if demo.street:
            addr["line"] = [demo.street]
        if demo.city:
            addr["city"] = demo.city
        if demo.state:
            addr["state"] = demo.state
        if demo.postal_code:
            addr["postalCode"] = demo.postal_code
        name_part["resource"]["address"] = [addr]
    return {"resourceType": "Parameters", "parameter": [name_part]}


async def check_capability(
    client: httpx.AsyncClient, base_url: str, timeout: int
) -> tuple[bool, bool]:
    """Returns (has_patient, has_match_op)."""
    try:
        resp = await client.get(
            f"{base_url}/metadata",
            headers={"Accept": "application/fhir+json"},
            timeout=timeout,
        )
        if resp.status_code != 200:
            return False, False
        cs = resp.json()
        resources = []
        for rest in cs.get("rest", []):
            resources.extend(rest.get("resource", []))
        for res in resources:
            if res.get("type") == "Patient":
                ops = [o.get("name") for o in res.get("operation", [])]
                return True, "match" in ops
        return False, False
    except Exception:
        return False, False


async def match_patient(
    endpoint: FHIREndpoint,
    demo: PatientDemographics,
    timeout: int = 10,
) -> MatchResult:
    # Check if we have a cached token for this endpoint
    cached_token = await get_token(endpoint.id)

    if cached_token:
        headers = {
            "Accept": "application/fhir+json",
            "Authorization": f"Bearer {cached_token}",
        }
        return await _query_endpoint(endpoint, demo, headers, timeout)

    if endpoint.auth_type in (AuthType.open, None):
        headers = {"Accept": "application/fhir+json"}
        return await _query_endpoint(endpoint, demo, headers, timeout)

    # SMART endpoint without a cached token — discover and return auth URL
    if endpoint.auth_type in (AuthType.smart_standalone, AuthType.oauth2):
        return await _return_auth_required(endpoint)

    # Backend Services endpoints require pre-configured credentials; skip automatically
    if endpoint.auth_type == AuthType.smart_backend_services:
        return MatchResult(
            endpoint=endpoint,
            matched=False,
            error="Backend services credentials not configured for this endpoint",
        )

    return MatchResult(endpoint=endpoint, matched=False, error="Unsupported auth type")


async def _return_auth_required(endpoint: FHIREndpoint) -> MatchResult:
    """Discovers SMART config and returns the auth URL the patient should visit."""
    smart = await discover_smart_config(endpoint.base_url)

    auth_url: Optional[str] = None
    if smart and smart.authorization_endpoint:
        from auth.smart_flow import build_authorization_url
        auth_url = await build_authorization_url(
            endpoint, settings.smart_redirect_uri, settings.smart_client_id
        )

    return MatchResult(
        endpoint=endpoint,
        matched=False,
        auth_url=auth_url,
        auth_instructions=(
            "This endpoint requires patient authorization via SMART on FHIR. "
            "Use the provided link to authorize access, then re-run the search."
        ),
        error="Authorization required",
    )


async def _query_endpoint(
    endpoint: FHIREndpoint,
    demo: PatientDemographics,
    headers: dict,
    timeout: int,
) -> MatchResult:
    async with httpx.AsyncClient(follow_redirects=True) as client:
        has_patient, has_match = await check_capability(
            client, endpoint.base_url, timeout
        )
        if not has_patient:
            return MatchResult(endpoint=endpoint, matched=False, error="No Patient resource")

        if has_match:
            return await _try_match_op(client, endpoint, demo, headers, timeout)
        return await _try_search(client, endpoint, demo, headers, timeout)


async def _try_match_op(
    client: httpx.AsyncClient,
    endpoint: FHIREndpoint,
    demo: PatientDemographics,
    headers: dict,
    timeout: int,
) -> MatchResult:
    try:
        resp = await client.post(
            f"{endpoint.base_url}/Patient/$match",
            json=_build_match_body(demo),
            headers={**headers, "Content-Type": "application/fhir+json"},
            timeout=timeout,
        )
        if resp.status_code == 200:
            bundle = resp.json()
            entries = bundle.get("entry", [])
            if entries:
                patient_id = entries[0].get("resource", {}).get("id")
                score = entries[0].get("search", {}).get("score", 1.0)
                return MatchResult(
                    endpoint=endpoint,
                    matched=True,
                    patient_id=patient_id,
                    match_confidence=score,
                    access_url=f"{endpoint.base_url}/Patient/{patient_id}",
                )
        return MatchResult(endpoint=endpoint, matched=False)
    except Exception as e:
        return MatchResult(endpoint=endpoint, matched=False, error=str(e))


async def _try_search(
    client: httpx.AsyncClient,
    endpoint: FHIREndpoint,
    demo: PatientDemographics,
    headers: dict,
    timeout: int,
) -> MatchResult:
    try:
        resp = await client.get(
            f"{endpoint.base_url}/Patient",
            params=_build_match_params(demo),
            headers=headers,
            timeout=timeout,
        )
        if resp.status_code == 200:
            bundle = resp.json()
            entries = bundle.get("entry", [])
            if entries:
                patient_id = entries[0].get("resource", {}).get("id")
                return MatchResult(
                    endpoint=endpoint,
                    matched=True,
                    patient_id=patient_id,
                    match_confidence=0.7,
                    access_url=f"{endpoint.base_url}/Patient/{patient_id}",
                )
        return MatchResult(endpoint=endpoint, matched=False)
    except Exception as e:
        return MatchResult(endpoint=endpoint, matched=False, error=str(e))

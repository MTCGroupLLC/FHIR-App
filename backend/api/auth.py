"""
Auth API routes:

  GET  /api/auth/jwks
       → { keys: [...] }  JWKS — FHIR servers fetch this to verify our JWTs

  GET  /api/auth/authorize?endpoint_id=&redirect_uri=&client_id=
       → { auth_url: "https://..." }  redirect patient here for SMART standalone

  GET  /api/auth/callback?code=&state=&redirect_uri=&client_id=
       → { success: true }

  GET  /api/auth/token/{endpoint_id}
       → { has_token: bool }

  POST /api/auth/backend-services  { endpoint_id, client_id }
       → { success: bool }  B2B JWT flow using managed keypair

  POST /api/auth/rotate-key
       → { kid, n, e, ... }  generates new keypair (invalidates existing B2B tokens)
"""

from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Query
from pydantic import BaseModel

from auth.keys import get_public_jwk, rotate_keypair
from auth.smart_flow import build_authorization_url, exchange_code, get_backend_services_token
from auth.token_cache import get_token
from core.config import settings
from registry.cache import get_all_endpoints

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# JWKS — public key endpoint for FHIR server verification
# ---------------------------------------------------------------------------

@router.get("/jwks")
async def get_jwks():
    """
    JSON Web Key Set. Register this URL with FHIR endpoints that require
    SMART Backend Services: https://<your-host>/api/auth/jwks
    """
    jwk = await get_public_jwk()
    return {"keys": [jwk]}


@router.post("/rotate-key")
async def rotate_key():
    """
    Rotates the RSA keypair. Coordinate with any pre-registered FHIR endpoints
    before rotating — they must re-fetch /jwks before new JWTs will verify.
    """
    new_jwk = await rotate_keypair()
    return {"message": "Keypair rotated. Update JWKS registration at FHIR endpoints.", "jwk": new_jwk}


# ---------------------------------------------------------------------------
# SMART Standalone (patient-directed) flow
# ---------------------------------------------------------------------------

@router.get("/authorize")
async def get_authorization_url(
    endpoint_id: str = Query(...),
    redirect_uri: str = Query(None),
    client_id: str = Query(None),
    x_session_id: Optional[str] = Header(None),
):
    session_id = x_session_id or "default"
    endpoints = await get_all_endpoints()
    endpoint = next((e for e in endpoints if e.id == endpoint_id), None)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    auth_url = await build_authorization_url(
        endpoint,
        redirect_uri or settings.smart_redirect_uri,
        client_id or settings.smart_client_id,
        session_id=session_id,
    )
    if not auth_url:
        raise HTTPException(
            status_code=400,
            detail="Endpoint does not support SMART on FHIR or auth URLs could not be discovered",
        )
    return {"auth_url": auth_url}


@router.get("/callback")
async def oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    redirect_uri: str = Query(None),
    client_id: str = Query(None),
    error: Optional[str] = Query(None),
):
    if error:
        raise HTTPException(status_code=400, detail=f"Authorization denied: {error}")

    token = await exchange_code(
        state,
        code,
        redirect_uri or settings.smart_redirect_uri,
        client_id or settings.smart_client_id,
    )
    if not token:
        raise HTTPException(status_code=400, detail="Token exchange failed")

    return {"success": True, "message": "Authorization complete. You can close this window."}


@router.get("/token/{endpoint_id}")
async def check_token(endpoint_id: str):
    token = await get_token(endpoint_id)
    return {"has_token": token is not None}


# ---------------------------------------------------------------------------
# SMART Backend Services (B2B) flow
# ---------------------------------------------------------------------------

class BackendServicesRequest(BaseModel):
    endpoint_id: str
    client_id: str  # registered with the FHIR endpoint; typically your org's client ID


@router.post("/backend-services")
async def request_backend_services_token(body: BackendServicesRequest):
    endpoints = await get_all_endpoints()
    endpoint = next((e for e in endpoints if e.id == body.endpoint_id), None)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    token = await get_backend_services_token(endpoint, body.client_id)
    if not token:
        raise HTTPException(
            status_code=400,
            detail=(
                "Backend services token request failed. "
                "Ensure client_id is registered at the endpoint and /jwks is reachable."
            ),
        )
    return {"success": True}

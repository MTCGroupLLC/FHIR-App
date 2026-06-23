"""
Pulls FHIR endpoint lists from public directories and caches them in Redis.

Sources:
  - CMS Interoperability Rule payer endpoint list (data.cms.gov)
  - ONC Lantern monitored endpoints
  - Curated list of major EHR open endpoints (Epic, Oracle/Cerner, MEDITECH)
  - Government APIs: CMS Blue Button 2.0, VA Health APIs, DoD MHS Genesis
"""

import hashlib
import json
import logging
from typing import List

import httpx

from models.endpoint import AuthType, EndpointType, FHIREndpoint

logger = logging.getLogger(__name__)

CMS_ENDPOINT_URL = (
    "https://data.cms.gov/resource/2veh-etkm.json?$limit=5000"
)
LANTERN_ENDPOINT_URL = "https://lantern.healthit.gov/api/fhirEndpoints"


def _make_id(source: str, url: str) -> str:
    return hashlib.md5(f"{source}:{url}".encode()).hexdigest()[:12]


async def fetch_cms_endpoints(client: httpx.AsyncClient) -> List[FHIREndpoint]:
    endpoints: List[FHIREndpoint] = []
    try:
        resp = await client.get(CMS_ENDPOINT_URL, timeout=30)
        resp.raise_for_status()
        for row in resp.json():
            url = row.get("fhir_endpoint", "").strip().rstrip("/")
            name = row.get("organization_name") or row.get("plan_name") or url
            if not url:
                continue
            endpoints.append(
                FHIREndpoint(
                    id=_make_id("cms", url),
                    name=name,
                    base_url=url,
                    endpoint_type=EndpointType.payer,
                    auth_type=AuthType.smart_standalone,
                    source="cms",
                )
            )
    except Exception as e:
        logger.warning("CMS endpoint fetch failed: %s", e)
    return endpoints


async def fetch_lantern_endpoints(client: httpx.AsyncClient) -> List[FHIREndpoint]:
    endpoints: List[FHIREndpoint] = []
    try:
        resp = await client.get(LANTERN_ENDPOINT_URL, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        items = data if isinstance(data, list) else data.get("endpoints", [])
        for row in items:
            url = (row.get("url") or row.get("fhirURL") or "").strip().rstrip("/")
            name = row.get("organizationName") or row.get("vendor") or url
            if not url:
                continue
            endpoints.append(
                FHIREndpoint(
                    id=_make_id("lantern", url),
                    name=name,
                    base_url=url,
                    endpoint_type=EndpointType.provider,
                    fhir_version=row.get("fhirVersion"),
                    source="lantern",
                )
            )
    except Exception as e:
        logger.warning("Lantern endpoint fetch failed: %s", e)
    return endpoints


def get_curated_endpoints() -> List[FHIREndpoint]:
    """Well-known endpoints that aren't reliably in automated directories."""
    return [
        FHIREndpoint(
            id="cms-bluebutton",
            name="CMS Blue Button 2.0",
            base_url="https://fhir.bluebutton.cms.gov/v2/fhir",
            endpoint_type=EndpointType.government,
            auth_type=AuthType.smart_standalone,
            authorize_url="https://sandbox.bluebutton.cms.gov/v1/o/authorize/",
            token_url="https://sandbox.bluebutton.cms.gov/v1/o/token/",
            source="manual",
        ),
        FHIREndpoint(
            id="va-health",
            name="VA Health APIs (Lighthouse)",
            base_url="https://sandbox-api.va.gov/services/fhir/v0/r4",
            endpoint_type=EndpointType.government,
            auth_type=AuthType.smart_standalone,
            authorize_url="https://sandbox-api.va.gov/oauth2/health/v1/authorization",
            token_url="https://sandbox-api.va.gov/oauth2/health/v1/token",
            source="manual",
        ),
        FHIREndpoint(
            id="epic-open",
            name="Epic Open FHIR (MyChart)",
            base_url="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_standalone,
            fhir_version="R4",
            source="manual",
        ),
        FHIREndpoint(
            id="cerner-open",
            name="Oracle Cerner Open FHIR",
            base_url="https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_standalone,
            fhir_version="R4",
            source="manual",
        ),
    ]

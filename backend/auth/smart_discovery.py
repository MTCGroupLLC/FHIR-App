"""
Discovers SMART on FHIR configuration for an endpoint.

Checks (in order):
  1. Redis cache (TTL 24h)
  2. .well-known/smart-configuration
  3. CapabilityStatement.rest[].security extensions (FHIR DSTU2/STU3 fallback)
"""

import json
import logging
from typing import Optional

import httpx
import redis.asyncio as aioredis

from core.config import settings
from models.endpoint import SmartConfig

logger = logging.getLogger(__name__)

_SMART_WELL_KNOWN = "/.well-known/smart-configuration"
_CACHE_TTL = 86400  # 24h


def _cache_key(base_url: str) -> str:
    return f"drls:smart:{base_url}"


async def discover_smart_config(
    base_url: str,
    client: Optional[httpx.AsyncClient] = None,
) -> Optional[SmartConfig]:
    r = aioredis.from_url(settings.redis_url)
    try:
        cached = await r.get(_cache_key(base_url))
        if cached:
            return SmartConfig(**json.loads(cached))

        own_client = client is None
        if own_client:
            client = httpx.AsyncClient(follow_redirects=True)

        try:
            config = await _fetch_well_known(client, base_url)
            if config is None:
                config = await _fetch_from_capability(client, base_url)

            if config:
                await r.setex(
                    _cache_key(base_url),
                    _CACHE_TTL,
                    json.dumps(config.model_dump()),
                )
            return config
        finally:
            if own_client:
                await client.aclose()
    finally:
        await r.aclose()


async def _fetch_well_known(
    client: httpx.AsyncClient, base_url: str
) -> Optional[SmartConfig]:
    url = base_url.rstrip("/") + _SMART_WELL_KNOWN
    try:
        resp = await client.get(url, timeout=8, headers={"Accept": "application/json"})
        if resp.status_code == 200:
            data = resp.json()
            token_endpoint = data.get("token_endpoint")
            if not token_endpoint:
                return None
            return SmartConfig(
                issuer=data.get("issuer"),
                authorization_endpoint=data.get("authorization_endpoint"),
                token_endpoint=token_endpoint,
                token_endpoint_auth_methods_supported=data.get(
                    "token_endpoint_auth_methods_supported", []
                ),
                scopes_supported=data.get("scopes_supported", []),
                response_types_supported=data.get("response_types_supported", []),
                capabilities=data.get("capabilities", []),
            )
    except Exception as e:
        logger.debug("Well-known fetch failed for %s: %s", base_url, e)
    return None


async def _fetch_from_capability(
    client: httpx.AsyncClient, base_url: str
) -> Optional[SmartConfig]:
    """Fallback: extract auth URLs from CapabilityStatement security extensions."""
    try:
        resp = await client.get(
            f"{base_url}/metadata",
            timeout=8,
            headers={"Accept": "application/fhir+json"},
        )
        if resp.status_code != 200:
            return None
        cs = resp.json()
        for rest in cs.get("rest", []):
            security = rest.get("security", {})
            for ext in security.get("extension", []):
                if "oauth-uris" in ext.get("url", ""):
                    token_url = None
                    auth_url = None
                    for sub in ext.get("extension", []):
                        if sub.get("url") == "token":
                            token_url = sub.get("valueUri")
                        if sub.get("url") == "authorize":
                            auth_url = sub.get("valueUri")
                    if token_url:
                        return SmartConfig(
                            authorization_endpoint=auth_url,
                            token_endpoint=token_url,
                        )
    except Exception as e:
        logger.debug("Capability SMART fallback failed for %s: %s", base_url, e)
    return None

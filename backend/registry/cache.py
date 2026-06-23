"""
Endpoint registry cache. Fetches from all sources once and stores in Redis
for 24 hours so individual search jobs don't re-fetch the full directory.
"""

import json
import logging
from typing import List

import httpx
import redis.asyncio as aioredis

from core.config import settings
from models.endpoint import FHIREndpoint
from registry.sources import (
    fetch_cms_endpoints,
    fetch_lantern_endpoints,
    get_curated_endpoints,
)

logger = logging.getLogger(__name__)

REGISTRY_KEY = "drls:endpoint_registry"
REGISTRY_TTL = 86400  # 24 hours


async def get_all_endpoints() -> List[FHIREndpoint]:
    r = aioredis.from_url(settings.redis_url)
    try:
        cached = await r.get(REGISTRY_KEY)
        if cached:
            return [FHIREndpoint(**e) for e in json.loads(cached)]

        logger.info("Registry cache miss — fetching from all sources")
        async with httpx.AsyncClient() as client:
            cms = await fetch_cms_endpoints(client)
            lantern = await fetch_lantern_endpoints(client)

        curated = get_curated_endpoints()
        all_endpoints = curated + cms + lantern

        # Deduplicate by base_url
        seen: set[str] = set()
        unique: List[FHIREndpoint] = []
        for ep in all_endpoints:
            if ep.base_url not in seen:
                seen.add(ep.base_url)
                unique.append(ep)

        await r.setex(
            REGISTRY_KEY,
            REGISTRY_TTL,
            json.dumps([e.model_dump() for e in unique]),
        )
        logger.info("Registry cached: %d endpoints", len(unique))
        return unique
    finally:
        await r.aclose()


async def bust_registry_cache() -> None:
    r = aioredis.from_url(settings.redis_url)
    try:
        await r.delete(REGISTRY_KEY)
    finally:
        await r.aclose()

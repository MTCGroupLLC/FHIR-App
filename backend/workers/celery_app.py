import asyncio
import json
import logging
from typing import Any

from celery import Celery

from core.config import settings

celery_app = Celery("drls", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    result_expires=3600,
)

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="drls.search")
def run_search(self, demographics: dict) -> dict[str, Any]:
    """
    Fan out patient matching across all registered endpoints.
    Updates task state with incremental results as endpoints respond.
    """
    return asyncio.get_event_loop().run_until_complete(
        _async_search(self, demographics)
    )


async def _async_search(task: Any, demographics: dict) -> dict[str, Any]:
    import asyncio

    import redis.asyncio as aioredis

    from matching.engine import match_patient
    from models.patient import PatientDemographics
    from registry.cache import get_all_endpoints

    demo = PatientDemographics(**demographics)
    endpoints = await get_all_endpoints()

    results = []
    errors = []
    semaphore = asyncio.Semaphore(settings.max_concurrent_queries)

    async def query_one(ep):
        async with semaphore:
            result = await match_patient(ep, demo, timeout=settings.endpoint_timeout)
            return result.model_dump()

    tasks = [query_one(ep) for ep in endpoints]
    total = len(tasks)

    for i, coro in enumerate(asyncio.as_completed(tasks)):
        result = await coro
        if result.get("matched"):
            results.append(result)
        elif result.get("error") and "authentication" not in (result.get("error") or ""):
            errors.append(result)

        task.update_state(
            state="PROGRESS",
            meta={
                "current": i + 1,
                "total": total,
                "matches": len(results),
                "results": results,
            },
        )

    return {
        "status": "complete",
        "total_queried": total,
        "matches_found": len(results),
        "results": results,
        "errors": errors[:20],  # cap error list
    }

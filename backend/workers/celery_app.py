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
    return asyncio.run(_async_search(self, demographics))


async def _async_search(task: Any, demographics: dict) -> dict[str, Any]:
    import asyncio

    from auth.token_cache import get_token
    from matching.engine import match_patient
    from models.endpoint import AuthType
    from models.patient import PatientDemographics
    from registry.cache import get_all_endpoints

    demo = PatientDemographics(**demographics)
    all_endpoints = await get_all_endpoints()

    needs_auth = {AuthType.smart_standalone, AuthType.oauth2, AuthType.smart_backend_services}

    # Split into queryable (token cached or open) vs not connected
    queryable = []
    not_connected = []
    for ep in all_endpoints:
        if ep.auth_type in needs_auth:
            token = await get_token(ep.id)
            if token:
                queryable.append(ep)
            else:
                not_connected.append(ep)
        else:
            queryable.append(ep)

    confirmed = []
    errors = []
    semaphore = asyncio.Semaphore(settings.max_concurrent_queries)

    async def query_one(ep):
        async with semaphore:
            result = await match_patient(ep, demo, timeout=settings.endpoint_timeout)
            return result.model_dump()

    tasks_list = [query_one(ep) for ep in queryable]
    total = len(tasks_list)

    for i, coro in enumerate(asyncio.as_completed(tasks_list)):
        result = await coro
        if result.get("matched"):
            confirmed.append(result)
        elif result.get("error") and result.get("error") not in ("No Patient resource", "Authorization required"):
            errors.append(result)

        task.update_state(
            state="PROGRESS",
            meta={
                "current": i + 1,
                "total": total,
                "matches": len(confirmed),
                "results": confirmed,
                "not_connected": len(not_connected),
            },
        )

    return {
        "status": "complete",
        "total_queried": total,
        "not_connected": len(not_connected),
        "matches_found": len(confirmed),
        "results": confirmed,
        "errors": errors[:20],
    }

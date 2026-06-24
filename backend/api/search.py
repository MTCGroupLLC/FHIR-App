from fastapi import APIRouter, HTTPException
from celery.result import AsyncResult

from models.patient import PatientDemographics
from workers.celery_app import celery_app, run_search

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("/")
async def start_search(demographics: PatientDemographics):
    task = run_search.delay(demographics.model_dump())
    return {"job_id": task.id}


@router.get("/{job_id}")
async def get_search_status(job_id: str):
    result = AsyncResult(job_id, app=celery_app)

    if result.state == "PENDING":
        return {"state": "pending", "current": 0, "total": 0, "results": []}

    if result.state == "PROGRESS":
        meta = result.info or {}
        return {
            "state": "progress",
            "current": meta.get("current", 0),
            "total": meta.get("total", 0),
            "matches": meta.get("matches", 0),
            "results": meta.get("results", []),
            "not_connected": meta.get("not_connected", 0),
        }

    if result.state == "SUCCESS":
        data = result.result or {}
        return {
            "state": "complete",
            "current": data.get("total_queried", 0),
            "total": data.get("total_queried", 0),
            "matches": data.get("matches_found", 0),
            "results": data.get("results", []),
            "errors": data.get("errors", []),
            "not_connected": data.get("not_connected", 0),
        }

    if result.state == "FAILURE":
        raise HTTPException(status_code=500, detail=str(result.info))

    return {"state": result.state.lower(), "results": []}

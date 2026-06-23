from fastapi import APIRouter
from registry.cache import bust_registry_cache, get_all_endpoints

router = APIRouter(prefix="/api/registry", tags=["registry"])


@router.get("/endpoints")
async def list_endpoints():
    endpoints = await get_all_endpoints()
    return {"count": len(endpoints), "endpoints": [e.model_dump() for e in endpoints]}


@router.post("/refresh")
async def refresh_registry():
    await bust_registry_cache()
    endpoints = await get_all_endpoints()
    return {"message": "Registry refreshed", "count": len(endpoints)}

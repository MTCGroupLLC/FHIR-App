from fastapi import APIRouter
from auth.token_cache import get_token
from models.endpoint import AuthType
from registry.cache import bust_registry_cache, get_all_endpoints

router = APIRouter(prefix="/api/registry", tags=["registry"])


@router.get("/endpoints")
async def list_endpoints():
    endpoints = await get_all_endpoints()
    needs_auth_types = {AuthType.smart_standalone, AuthType.oauth2, AuthType.smart_backend_services}
    result = []
    for ep in endpoints:
        data = ep.model_dump(exclude={"client_secret"})
        if ep.auth_type in needs_auth_types:
            data["connected"] = await get_token(ep.id) is not None
            data["auth_ready"] = ep.registration_status == "registered"
        else:
            data["connected"] = True
            data["auth_ready"] = True
        result.append(data)
    return {"count": len(result), "endpoints": result}


@router.post("/refresh")
async def refresh_registry():
    await bust_registry_cache()
    endpoints = await get_all_endpoints()
    return {"message": "Registry refreshed", "count": len(endpoints)}

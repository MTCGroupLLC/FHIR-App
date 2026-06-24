import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.auth import router as auth_router
from api.registry import router as registry_router
from api.search import router as search_router

app = FastAPI(
    title="FHIR-Based Medical Record Locator Service",
    description="Locates patient records across all active FHIR API endpoints.",
    version="0.1.0",
)

_origins = ["http://localhost:3000"]
for _url in os.getenv("FRONTEND_URLS", os.getenv("FRONTEND_URL", "")).split(","):
    _url = _url.strip()
    if _url:
        _origins.append(_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router)
app.include_router(registry_router)
app.include_router(auth_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

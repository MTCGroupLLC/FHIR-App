"""
Redis-backed stores for:
  - Access tokens (keyed by endpoint_id; TTL = token expiry)
  - OAuth state parameters (keyed by state UUID; TTL = 10 min)
  - PKCE verifiers (keyed by state UUID; TTL = 10 min)
"""

import json
from typing import Optional

import redis.asyncio as aioredis

from core.config import settings

_STATE_TTL = 600  # 10 minutes


def _token_key(endpoint_id: str) -> str:
    return f"drls:token:{endpoint_id}"


def _state_key(state: str) -> str:
    return f"drls:state:{state}"


def _verifier_key(state: str) -> str:
    return f"drls:verifier:{state}"


async def store_token(endpoint_id: str, access_token: str, expires_in: int = 3600) -> None:
    r = aioredis.from_url(settings.redis_url)
    try:
        await r.setex(_token_key(endpoint_id), max(expires_in - 30, 60), access_token)
    finally:
        await r.aclose()


async def get_token(endpoint_id: str) -> Optional[str]:
    r = aioredis.from_url(settings.redis_url)
    try:
        val = await r.get(_token_key(endpoint_id))
        return val.decode() if val else None
    finally:
        await r.aclose()


async def store_state(state: str, payload: dict) -> None:
    r = aioredis.from_url(settings.redis_url)
    try:
        await r.setex(_state_key(state), _STATE_TTL, json.dumps(payload))
    finally:
        await r.aclose()


async def get_state(state: str) -> Optional[dict]:
    r = aioredis.from_url(settings.redis_url)
    try:
        val = await r.get(_state_key(state))
        return json.loads(val) if val else None
    finally:
        await r.aclose()


async def store_verifier(state: str, verifier: str) -> None:
    r = aioredis.from_url(settings.redis_url)
    try:
        await r.setex(_verifier_key(state), _STATE_TTL, verifier)
    finally:
        await r.aclose()


async def get_verifier(state: str) -> Optional[str]:
    r = aioredis.from_url(settings.redis_url)
    try:
        val = await r.get(_verifier_key(state))
        return val.decode() if val else None
    finally:
        await r.aclose()


async def delete_state_and_verifier(state: str) -> None:
    r = aioredis.from_url(settings.redis_url)
    try:
        await r.delete(_state_key(state), _verifier_key(state))
    finally:
        await r.aclose()

"""
Managed RSA keypair for SMART Backend Services JWT signing.

Lifecycle:
  - On first call, generates an RSA-2048 keypair and persists the private key
    in Redis with no TTL (survives restarts as long as Redis volume is intact).
  - Exposes the public key as a JWK so FHIR servers can verify our signed JWTs
    by fetching GET /api/auth/jwks.
  - To rotate: call rotate_keypair(). Old tokens will fail verification immediately,
    so coordinate with any pre-registered endpoints before rotating.
"""

import base64
import json
import logging
from typing import Optional

import redis.asyncio as aioredis
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey

from core.config import settings

logger = logging.getLogger(__name__)

KID = "drls-key-1"
_PRIVATE_KEY_REDIS = "drls:keypair:private"


def _generate_private_key() -> RSAPrivateKey:
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def _private_key_to_pem(key: RSAPrivateKey) -> str:
    return key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()


def _pem_to_private_key(pem: str) -> RSAPrivateKey:
    return serialization.load_pem_private_key(pem.encode(), password=None)  # type: ignore[return-value]


def _int_to_base64url(n: int) -> str:
    byte_length = (n.bit_length() + 7) // 8
    return base64.urlsafe_b64encode(n.to_bytes(byte_length, "big")).rstrip(b"=").decode()


def private_key_to_jwk(key: RSAPrivateKey, kid: str = KID) -> dict:
    pub = key.public_key().public_numbers()
    return {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS384",
        "kid": kid,
        "n": _int_to_base64url(pub.n),
        "e": _int_to_base64url(pub.e),
    }


async def _load_or_create_private_pem() -> str:
    r = aioredis.from_url(settings.redis_url)
    try:
        stored = await r.get(_PRIVATE_KEY_REDIS)
        if stored:
            return stored.decode()

        logger.info("No keypair found in Redis — generating new RSA-2048 keypair")
        key = _generate_private_key()
        pem = _private_key_to_pem(key)
        await r.set(_PRIVATE_KEY_REDIS, pem)  # no TTL — intentionally persistent
        return pem
    finally:
        await r.aclose()


async def get_private_key_pem() -> str:
    """Returns the current private key PEM, generating and persisting it if needed."""
    return await _load_or_create_private_pem()


async def get_public_jwk() -> dict:
    """Returns the public JWK for the current keypair."""
    pem = await _load_or_create_private_pem()
    key = _pem_to_private_key(pem)
    return private_key_to_jwk(key)


async def rotate_keypair() -> dict:
    """
    Generates a new keypair, overwrites the stored private key, and returns
    the new public JWK. Invalidates all previously issued Backend Services tokens.
    """
    key = _generate_private_key()
    pem = _private_key_to_pem(key)
    r = aioredis.from_url(settings.redis_url)
    try:
        await r.set(_PRIVATE_KEY_REDIS, pem)
        logger.warning("Keypair rotated — existing Backend Services tokens are now invalid")
    finally:
        await r.aclose()
    return private_key_to_jwk(key)

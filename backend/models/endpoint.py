from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class EndpointType(str, Enum):
    payer = "payer"
    provider = "provider"
    government = "government"
    hie = "hie"


class AuthType(str, Enum):
    open = "open"
    smart_standalone = "smart_standalone"
    smart_backend_services = "smart_backend_services"
    oauth2 = "oauth2"


class SmartConfig(BaseModel):
    """Discovered from .well-known/smart-configuration."""
    issuer: Optional[str] = None
    authorization_endpoint: Optional[str] = None
    token_endpoint: str
    token_endpoint_auth_methods_supported: List[str] = []
    scopes_supported: List[str] = []
    response_types_supported: List[str] = []
    capabilities: List[str] = []


class FHIREndpoint(BaseModel):
    id: str
    name: str
    base_url: str
    endpoint_type: EndpointType
    fhir_version: Optional[str] = None
    auth_type: Optional[AuthType] = None
    token_url: Optional[str] = None
    authorize_url: Optional[str] = None
    client_id: Optional[str] = None   # per-endpoint OAuth client ID; overrides global setting
    source: str                        # cms, lantern, epic, cerner, manual


class MatchResult(BaseModel):
    endpoint: FHIREndpoint
    matched: bool
    patient_id: Optional[str] = None
    match_confidence: Optional[float] = None
    access_url: Optional[str] = None
    auth_instructions: Optional[str] = None
    auth_url: Optional[str] = None   # populated when patient action is required
    error: Optional[str] = None

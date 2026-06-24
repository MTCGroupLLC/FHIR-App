"""
FHIR endpoint sources.

Sources:
  - Curated list of major payer and provider FHIR R4 endpoints
    (CMS Interoperability Rule compliant, SMART on FHIR)

Note: The CMS data.cms.gov Socrata endpoint list (2veh-etkm) and
ONC Lantern API are no longer publicly accessible. The curated list
below covers the major payers and EHR systems where most US patients
have records.
"""

import os

from models.endpoint import AuthType, EndpointType, FHIREndpoint


def get_curated_endpoints() -> list[FHIREndpoint]:
    return [
        # ── Government ────────────────────────────────────────────────────────
        FHIREndpoint(
            id="cms-bluebutton",
            name="CMS Blue Button 2.0 (Medicare)",
            base_url="https://sandbox.bluebutton.cms.gov/v2/fhir",
            endpoint_type=EndpointType.government,
            auth_type=AuthType.smart_standalone,
            authorize_url="https://sandbox.bluebutton.cms.gov/v2/o/authorize/",
            token_url="https://sandbox.bluebutton.cms.gov/v2/o/token/",
            client_id="xPydhk7ReTjAgyzZnvYoc70LbdrWCDQvyyZrZdph",
            client_secret=os.getenv("CMS_BB_CLIENT_SECRET"),
            scopes="patient/Patient.read patient/Coverage.read patient/ExplanationOfBenefit.read profile openid",
            source="manual",
        ),
        FHIREndpoint(
            id="va-health",
            name="VA Health APIs (Lighthouse)",
            base_url="https://sandbox-api.va.gov/services/fhir/v0/r4",
            endpoint_type=EndpointType.government,
            auth_type=AuthType.smart_standalone,
            authorize_url="https://sandbox-api.va.gov/oauth2/health/v1/authorization",
            token_url="https://sandbox-api.va.gov/oauth2/health/v1/token",
            scopes="patient/Patient.read patient/Observation.read patient/Condition.read patient/MedicationRequest.read patient/DiagnosticReport.read patient/DocumentReference.read launch openid profile offline_access",
            source="manual",
        ),
        # ── Major Commercial Payers ────────────────────────────────────────────
        FHIREndpoint(
            id="aetna",
            name="Aetna (CVS Health)",
            base_url="https://patient-access.aetna.com/Patient-Access-Combined/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            authorize_url="https://patient-access.aetna.com/Patient-Access-Combined/oauth2/authorize",
            token_url="https://patient-access.aetna.com/Patient-Access-Combined/oauth2/token",
            source="manual",
        ),
        FHIREndpoint(
            id="anthem",
            name="Anthem / Elevance Health",
            base_url="https://fhirprd.anthem.com/medicals/api/v3",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        FHIREndpoint(
            id="cigna",
            name="Cigna",
            base_url="https://fhirapi.cigna.com/patient-access/v3",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        FHIREndpoint(
            id="humana",
            name="Humana",
            base_url="https://api.humana.com/fhir/api/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        FHIREndpoint(
            id="uhc",
            name="UnitedHealthcare",
            base_url="https://fhir.uhc.com/api/FHIR/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        FHIREndpoint(
            id="kaiser",
            name="Kaiser Permanente",
            base_url="https://fhir.kp.org/service/ptnt/patient-data/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        FHIREndpoint(
            id="bcbs-federal",
            name="Blue Cross Blue Shield Federal Employee Program",
            base_url="https://fhir.bcbsfederal.com/patient-api/r4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        FHIREndpoint(
            id="molina",
            name="Molina Healthcare",
            base_url="https://api.molinahealthcare.com/fhir/r4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        FHIREndpoint(
            id="centene",
            name="Centene / WellCare",
            base_url="https://fhirapi.centene.com/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        # ── Major EHR / Provider Networks ─────────────────────────────────────
        FHIREndpoint(
            id="epic-open",
            name="Epic Open FHIR (MyChart)",
            base_url="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_standalone,
            authorize_url="https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize",
            token_url="https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
            fhir_version="R4",
            source="manual",
        ),
        FHIREndpoint(
            id="cerner-open",
            name="Oracle Cerner Open FHIR",
            base_url="https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_standalone,
            authorize_url="https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/patient/authorize",
            token_url="https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/token",
            fhir_version="R4",
            source="manual",
        ),
        FHIREndpoint(
            id="commonspirit",
            name="CommonSpirit Health",
            base_url="https://fhir.commonspirit.org/api/FHIR/R4",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
        FHIREndpoint(
            id="hca",
            name="HCA Healthcare",
            base_url="https://fhir.hcahealthcare.com/api/FHIR/R4",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_standalone,
            source="manual",
        ),
    ]


async def fetch_cms_endpoints(client) -> list[FHIREndpoint]:
    """CMS Socrata endpoint (data.cms.gov/resource/2veh-etkm) returned 410 Gone.
    Returns empty list — curated list covers major CMS-regulated payers."""
    return []


async def fetch_lantern_endpoints(client) -> list[FHIREndpoint]:
    """ONC Lantern API (lantern.healthit.gov/api/fhirEndpoints) returned 404.
    Returns empty list — curated list covers major provider networks."""
    return []

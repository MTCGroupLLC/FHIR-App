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
        # ── Open / Public Test Servers (no auth — available for provider search immediately) ──
        FHIREndpoint(
            id="smarthealthit-open",
            name="SMART Health IT Reference Server",
            base_url="https://r4.smarthealthit.org",
            endpoint_type=EndpointType.hie,
            auth_type=AuthType.open,
            fhir_version="R4",
            registration_status="registered",
            sandbox_hint="Public FHIR R4 reference server with synthetic patients. No login required — available for provider demographic search immediately. Try: First Name Camila, Last Name Lopez, DOB 1987-08-20.",
            source="manual",
        ),
        FHIREndpoint(
            id="hapi-open",
            name="HAPI FHIR Public Test Server",
            base_url="https://hapi.fhir.org/baseR4",
            endpoint_type=EndpointType.hie,
            auth_type=AuthType.open,
            fhir_version="R4",
            registration_status="registered",
            sandbox_hint="Public HAPI FHIR R4 test server. No login required. Contains a mix of synthetic and user-contributed test data.",
            source="manual",
        ),
        # ── Backend Services (provider-to-system, no patient login required) ──
        FHIREndpoint(
            id="epic-backend",
            name="Epic FHIR — Backend Services (Provider Access)",
            base_url="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_backend_services,
            token_url="https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
            client_id=os.getenv("EPIC_BACKEND_CLIENT_ID"),
            scopes="system/Patient.read system/Observation.read system/Condition.read system/MedicationRequest.read system/DiagnosticReport.read system/AllergyIntolerance.read system/Immunization.read",
            fhir_version="R4",
            registration_status="required" if not os.getenv("EPIC_BACKEND_CLIENT_ID") else "registered",
            developer_portal="https://fhir.epic.com/Documentation?docId=oauth2&section=BackendOAuth2Guide",
            sandbox_hint="Provider-to-system access. Requires registering a Backend Services app at fhir.epic.com with the JWKS URL of this server. No patient login needed — queries by demographics using a signed JWT.",
            source="manual",
        ),
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
            registration_status="registered",
            developer_portal="https://bluebutton.cms.gov/developers/",
            sandbox_hint="Sandbox only. Login: Username BBUser00000 · Password PW00000! (any number 00000–29999). After connecting, search with the synthetic patient name shown on the CMS consent screen, or try First Name: John, Last Name: Smith as a starting point — CMS assigns random synthetic demographics to each test account.",
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
            client_id="0oa1c1qbh29kOjhrP2p8",
            client_secret=os.getenv("VA_CLIENT_SECRET"),
            scopes="patient/Patient.read patient/Observation.read patient/Condition.read patient/MedicationRequest.read patient/DiagnosticReport.read patient/DocumentReference.read launch/patient openid profile offline_access",
            registration_status="registered",
            developer_portal="https://developer.va.gov/explore/api/fhir/docs",
            sandbox_hint="Sandbox only. VA uses ID.me test accounts — visit developer.va.gov/explore/api/fhir/docs and click 'Test Users' for the current sandbox credentials and synthetic veteran demographics to search.",
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
            registration_status="required",
            developer_portal="https://developerportal.aetna.com",
            source="manual",
        ),
        FHIREndpoint(
            id="anthem",
            name="Anthem / Elevance Health",
            base_url="https://fhirprd.anthem.com/medicals/api/v3",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.anthem.com",
            source="manual",
        ),
        FHIREndpoint(
            id="cigna",
            name="Cigna",
            base_url="https://fhirapi.cigna.com/patient-access/v3",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.cigna.com",
            source="manual",
        ),
        FHIREndpoint(
            id="humana",
            name="Humana",
            base_url="https://api.humana.com/fhir/api/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.humana.com",
            source="manual",
        ),
        FHIREndpoint(
            id="uhc",
            name="UnitedHealthcare",
            base_url="https://fhir.uhc.com/api/FHIR/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.uhc.com",
            source="manual",
        ),
        FHIREndpoint(
            id="kaiser",
            name="Kaiser Permanente",
            base_url="https://fhir.kp.org/service/ptnt/patient-data/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.kp.org",
            source="manual",
        ),
        FHIREndpoint(
            id="bcbs-federal",
            name="Blue Cross Blue Shield Federal Employee Program",
            base_url="https://fhir.bcbsfederal.com/patient-api/r4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.fepblue.org",
            source="manual",
        ),
        FHIREndpoint(
            id="molina",
            name="Molina Healthcare",
            base_url="https://api.molinahealthcare.com/fhir/r4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.molinahealthcare.com",
            source="manual",
        ),
        FHIREndpoint(
            id="centene",
            name="Centene / WellCare",
            base_url="https://fhirapi.centene.com/R4",
            endpoint_type=EndpointType.payer,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.centene.com",
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
            client_id="82028c07-2117-45de-9a82-20d91dc77355",
            scopes="openid fhirUser launch/patient patient/Patient.read patient/Observation.read patient/Condition.read patient/MedicationRequest.read patient/DiagnosticReport.read patient/DocumentReference.read patient/AllergyIntolerance.read patient/Immunization.read",
            fhir_version="R4",
            registration_status="registered",
            developer_portal="https://fhir.epic.com/Documentation",
            sandbox_hint="Sandbox only. Login credentials: Username fhircamila · Password epicepic1 (or fhirjason / fhirenrique, same password). Then search with these demographics — fhircamila: First Camila, Last Lopez, DOB 08/20/1987, Female. fhirjason: First Jason, Last Argonaut, DOB 09/01/1951, Male.",
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
            registration_status="required",
            developer_portal="https://code.cerner.com",
            source="manual",
        ),
        FHIREndpoint(
            id="commonspirit",
            name="CommonSpirit Health",
            base_url="https://fhir.commonspirit.org/api/FHIR/R4",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://fhir.commonspirit.org",
            source="manual",
        ),
        FHIREndpoint(
            id="hca",
            name="HCA Healthcare",
            base_url="https://fhir.hcahealthcare.com/api/FHIR/R4",
            endpoint_type=EndpointType.provider,
            auth_type=AuthType.smart_standalone,
            registration_status="required",
            developer_portal="https://developer.hcahealthcare.com",
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

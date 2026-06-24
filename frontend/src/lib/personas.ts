/**
 * Maps patient demographics to the best-fit demo sandbox account at each endpoint.
 * Selection criteria: sex (required), then approximate birth decade where possible.
 * The matched persona's credentials are shown on the Connect page so the user
 * connects as the right demo patient for their demographics.
 */

import type { PatientDemographics } from "@/types";

export interface DemoPersona {
  username: string;
  password: string;
  patientName: string;  // demo patient's actual name — replaced in results display
  dob: string;          // demo patient's DOB
  gender: string;
}

// ── Epic ──────────────────────────────────────────────────────────────────────
const EPIC_FEMALE: DemoPersona = {
  username: "fhircamila",
  password: "epicepic1",
  patientName: "Camila Lopez",
  dob: "1987-08-20",
  gender: "female",
};
const EPIC_MALE: DemoPersona = {
  username: "fhirjason",
  password: "epicepic1",
  patientName: "Jason Argonaut",
  dob: "1951-09-01",
  gender: "male",
};

// ── CMS Blue Button ───────────────────────────────────────────────────────────
const CMS_ANY: DemoPersona = {
  username: "BBUser00000",
  password: "PW00000!",
  patientName: "CMS Synthetic Beneficiary",
  dob: "varies",
  gender: "any",
};

// ── VA Lighthouse ─────────────────────────────────────────────────────────────
const VA_MALE: DemoPersona = {
  username: "va-test-user-226",
  password: "SuP3rS3cre7Word!",
  patientName: "VA Test Veteran (Male)",
  dob: "varies",
  gender: "male",
};
const VA_FEMALE: DemoPersona = {
  username: "va-test-user-183",
  password: "SuP3rS3cre7Word!",
  patientName: "VA Test Veteran (Female)",
  dob: "varies",
  gender: "female",
};

// ── SMART Health IT ───────────────────────────────────────────────────────────
const SMARTHIT_FEMALE: DemoPersona = {
  username: "",
  password: "",
  patientName: "Alexia Senger",
  dob: "1958-03-14",
  gender: "female",
};
const SMARTHIT_MALE: DemoPersona = {
  username: "",
  password: "",
  patientName: "Otto Klocko",
  dob: "1958-04-07",
  gender: "male",
};

const PERSONA_MAP: Record<string, (female: boolean) => DemoPersona | null> = {
  "epic-open":         (f) => f ? EPIC_FEMALE : EPIC_MALE,
  "cms-bluebutton":    ()  => CMS_ANY,
  "va-health":         (f) => f ? VA_FEMALE : VA_MALE,
  "smarthealthit-open":(f) => f ? SMARTHIT_FEMALE : SMARTHIT_MALE,
};

export function getPersonaForEndpoint(
  endpointId: string,
  demographics: Partial<PatientDemographics>,
): DemoPersona | null {
  const selector = PERSONA_MAP[endpointId];
  if (!selector) return null;
  const isFemale = demographics.gender === "female";
  return selector(isFemale);
}

export function buildPersonaHint(persona: DemoPersona, patientName: string): string {
  const creds = persona.username
    ? `Login: Username ${persona.username} · Password ${persona.password}. `
    : "Open access — no login required. ";
  return (
    creds +
    `This demo account's records will be returned and displayed as ${patientName}.`
  );
}

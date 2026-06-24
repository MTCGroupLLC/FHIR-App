import type { PatientDemographics } from "@/types";

const SESSION_KEY = "drls_session_id";
const PATIENT_KEY = "drls_patient_demographics";

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function setPatientDemographics(demo: Partial<PatientDemographics>): void {
  if (typeof window === "undefined") return;
  const existing = getPatientDemographics();
  // Merge: don't overwrite existing fields with empty values
  const merged = { ...existing };
  for (const [k, v] of Object.entries(demo)) {
    if (v) merged[k as keyof PatientDemographics] = v as string;
  }
  localStorage.setItem(PATIENT_KEY, JSON.stringify(merged));
}

export function getPatientDemographics(): Partial<PatientDemographics> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PATIENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function hasPatientProfile(): boolean {
  const d = getPatientDemographics();
  return !!(d.first_name && d.last_name && d.date_of_birth);
}

export function clearPatientProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PATIENT_KEY);
}

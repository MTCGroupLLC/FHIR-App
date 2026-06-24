import type { PatientDemographics, SearchStatus } from "@/types";
import { getSessionId } from "@/lib/session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function sessionHeaders(): HeadersInit {
  return { "X-Session-ID": getSessionId() };
}

export async function startSearch(demographics: PatientDemographics): Promise<string> {
  const res = await fetch(`${API}/api/search/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders() },
    body: JSON.stringify(demographics),
  });
  if (!res.ok) throw new Error("Failed to start search");
  const data = await res.json();
  return data.job_id;
}

export async function getSearchStatus(jobId: string): Promise<SearchStatus> {
  const res = await fetch(`${API}/api/search/${jobId}`, { headers: sessionHeaders() });
  if (!res.ok) throw new Error("Failed to fetch search status");
  return res.json();
}

export async function fetchEndpoints() {
  const res = await fetch(`${API}/api/registry/endpoints`, { headers: sessionHeaders() });
  if (!res.ok) throw new Error("Failed to fetch endpoints");
  return res.json();
}

import type { PatientDemographics, SearchStatus } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function startSearch(demographics: PatientDemographics): Promise<string> {
  const res = await fetch(`${API}/api/search/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(demographics),
  });
  if (!res.ok) throw new Error("Failed to start search");
  const data = await res.json();
  return data.job_id;
}

export async function getSearchStatus(jobId: string): Promise<SearchStatus> {
  const res = await fetch(`${API}/api/search/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch search status");
  return res.json();
}

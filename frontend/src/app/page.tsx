"use client";

import { useState, useEffect, useRef } from "react";
import SearchForm from "@/components/SearchForm";
import SearchResults from "@/components/SearchResults";
import { startSearch, getSearchStatus } from "@/lib/api";
import type { PatientDemographics, SearchStatus } from "@/types";

export default function PatientPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SearchStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  useEffect(() => stopPolling, []);

  const handleSubmit = async (demographics: PatientDemographics) => {
    setLoading(true);
    setError(null);
    setStatus(null);
    stopPolling();

    try {
      const jobId = await startSearch(demographics);
      pollRef.current = setInterval(async () => {
        try {
          const s = await getSearchStatus(jobId);
          setStatus(s);
          if (s.state === "complete" || s.state === "failure") {
            stopPolling();
            setLoading(false);
          }
        } catch {
          stopPolling();
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      setError("Could not connect to the backend. Is the service running?");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Find Your Medical Records</h2>
        <p className="text-gray-500 mt-1 text-sm">
          We query all known FHIR-enabled health systems to locate your records in real time.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <SearchForm onSubmit={handleSubmit} loading={loading} />

      {status && <SearchResults status={status} />}
    </div>
  );
}

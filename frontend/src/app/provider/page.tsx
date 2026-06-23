"use client";

import { useState, useEffect, useRef } from "react";
import SearchForm from "@/components/SearchForm";
import SearchResults from "@/components/SearchResults";
import { startSearch, getSearchStatus } from "@/lib/api";
import type { PatientDemographics, SearchStatus } from "@/types";

export default function ProviderPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SearchStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  useEffect(() => stopPolling, []);

  const handleSubmit = async (demographics: PatientDemographics) => {
    setLoading(true);
    setStatus(null);
    stopPolling();

    const jobId = await startSearch(demographics);
    pollRef.current = setInterval(async () => {
      const s = await getSearchStatus(jobId);
      setStatus(s);
      if (s.state === "complete" || s.state === "failure") {
        stopPolling();
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <strong>Provider / Staff Mode</strong> — ensure you have patient consent before initiating a record search.
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Patient Record Lookup</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Locate a patient&apos;s records across all active FHIR endpoints.
        </p>
      </div>

      <SearchForm onSubmit={handleSubmit} loading={loading} />
      {status && <SearchResults status={status} />}
    </div>
  );
}

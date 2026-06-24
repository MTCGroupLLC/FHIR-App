"use client";

import { useState, useEffect, useRef } from "react";
import SearchForm from "@/components/SearchForm";
import SearchResults from "@/components/SearchResults";
import { startSearch, getSearchStatus, fetchEndpoints } from "@/lib/api";
import { getPatientDemographics } from "@/lib/session";
import type { PatientDemographics, SearchStatus } from "@/types";

export default function PatientPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SearchStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedCount, setConnectedCount] = useState<number | null>(null);
  const [savedDemo, setSavedDemo] = useState<Partial<PatientDemographics>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  useEffect(() => {
    setSavedDemo(getPatientDemographics());
    fetchEndpoints()
      .then((data) => {
        const connected = (data.endpoints ?? []).filter((e: { connected: boolean }) => e.connected).length;
        setConnectedCount(connected);
      })
      .catch(() => setConnectedCount(0));
    return stopPolling;
  }, []);

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
    } catch {
      setError("Could not connect to the backend. Is the service running?");
      setLoading(false);
    }
  };

  const noConnections = connectedCount !== null && connectedCount === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Find Your Medical Records</h2>
        <p className="text-gray-500 mt-1 text-sm">
          We query all connected FHIR-enabled health systems to locate your records in real time.
        </p>
      </div>

      {noConnections && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-5 py-5 text-center space-y-3">
          <p className="font-semibold text-amber-900">No health accounts connected yet</p>
          <p className="text-sm text-amber-800">
            Connect at least one payer or provider before searching. Your authorizations are
            saved — you only need to connect once.
          </p>
          <a
            href="/connect"
            className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Connect Accounts →
          </a>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {connectedCount !== null && connectedCount > 0 && (
        <p className="text-xs text-gray-400">
          Searching across <span className="font-medium text-gray-600">{connectedCount} connected source{connectedCount !== 1 ? "s" : ""}</span>
        </p>
      )}

      <div className={noConnections ? "opacity-40 pointer-events-none select-none" : ""}>
        <SearchForm onSubmit={handleSubmit} loading={loading} initialValues={savedDemo} />
      </div>

      {status && <SearchResults status={status} />}
    </div>
  );
}

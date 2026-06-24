"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PatientIntakeForm from "@/components/PatientIntakeForm";
import SearchResults from "@/components/SearchResults";
import { startSearch, getSearchStatus, fetchEndpoints } from "@/lib/api";
import { getPatientDemographics, hasPatientProfile, setPatientDemographics, clearPatientProfile } from "@/lib/session";
import type { PatientDemographics, SearchStatus } from "@/types";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);  // hydrated
  const [hasProfile, setHasProfile] = useState(false);
  const [demographics, setDemographics] = useState<Partial<PatientDemographics>>({});
  const [connectedCount, setConnectedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SearchStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoSearchFired, setAutoSearchFired] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  // Hydrate from localStorage after mount
  useEffect(() => {
    const profile = hasPatientProfile();
    const demo = getPatientDemographics();
    setHasProfile(profile);
    setDemographics(demo);
    setReady(true);
  }, []);

  // Once profile confirmed, fetch connected count and auto-search if ready
  useEffect(() => {
    if (!ready || !hasProfile) return;

    fetchEndpoints()
      .then((data) => {
        const connected = (data.endpoints ?? []).filter((e: { connected: boolean }) => e.connected).length;
        setConnectedCount(connected);

        if (connected > 0 && !autoSearchFired) {
          const demo = getPatientDemographics();
          if (demo.first_name && demo.last_name && demo.date_of_birth) {
            setAutoSearchFired(true);
            runSearch(demo as PatientDemographics);
          }
        }
      })
      .catch(() => setConnectedCount(0));

    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hasProfile]);

  const runSearch = async (demo: PatientDemographics) => {
    setLoading(true);
    setError(null);
    setStatus(null);
    stopPolling();

    try {
      const jobId = await startSearch(demo);
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
      setError("Could not connect to the backend.");
      setLoading(false);
    }
  };

  const handleIntakeSubmit = (demo: PatientDemographics) => {
    setPatientDemographics(demo);
    setHasProfile(true);
    setDemographics(demo);
    router.push("/connect");
  };

  const handleReset = () => {
    clearPatientProfile();
    stopPolling();
    setHasProfile(false);
    setDemographics({});
    setConnectedCount(null);
    setStatus(null);
    setAutoSearchFired(false);
  };

  if (!ready) return null;

  // ── Step 1: Intake ─────────────────────────────────────────────────────────
  if (!hasProfile) {
    return <PatientIntakeForm onSubmit={handleIntakeSubmit} />;
  }

  // ── Step 3: Search (after Connect) ─────────────────────────────────────────
  const fullName = `${demographics.first_name ?? ""} ${demographics.last_name ?? ""}`.trim();
  const noConnections = connectedCount !== null && connectedCount === 0;

  return (
    <div className="space-y-6">
      {/* Patient identity banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Search</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Searching for records matching{" "}
            <span className="font-semibold text-gray-800">{fullName}</span>
            {demographics.date_of_birth && (
              <span> · DOB {demographics.date_of_birth}</span>
            )}
            {demographics.gender && (
              <span> · {demographics.gender.charAt(0).toUpperCase() + demographics.gender.slice(1)}</span>
            )}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
        >
          Change patient
        </button>
      </div>

      {/* No connections yet */}
      {noConnections && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-5 py-5 text-center space-y-3">
          <p className="font-semibold text-amber-900">No accounts connected yet</p>
          <p className="text-sm text-amber-800">
            Connect demo endpoints to run the search. The right sandbox credentials
            for <strong>{fullName}</strong> are pre-selected on the Connect page.
          </p>
          <a
            href="/connect"
            className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Connect Accounts →
          </a>
        </div>
      )}

      {/* Connected — search controls */}
      {!noConnections && connectedCount !== null && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => runSearch(demographics as PatientDemographics)}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold rounded-lg transition text-sm"
          >
            {loading ? "Searching…" : "Search All Connected Accounts"}
          </button>
          <span className="text-xs text-gray-400">
            {connectedCount} endpoint{connectedCount !== 1 ? "s" : ""} connected
            {" · "}
            <a href="/connect" className="underline hover:text-gray-600">manage</a>
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Demo data notice */}
      {status && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs text-gray-500">
          <strong className="text-gray-600">Demo:</strong> Records below are synthetic FHIR data from sandbox endpoints.
          Patient demographics have been matched to <strong>{fullName}</strong> for illustration.
          No real health records are accessed or stored.
        </div>
      )}

      {status && <SearchResults status={status} patientName={fullName} />}
    </div>
  );
}

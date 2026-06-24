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
  const [showForm, setShowForm] = useState(false);
  const [autoSearched, setAutoSearched] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const runSearch = async (demographics: PatientDemographics) => {
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

  useEffect(() => {
    const demo = getPatientDemographics();
    setSavedDemo(demo);

    fetchEndpoints()
      .then((data) => {
        const connected = (data.endpoints ?? []).filter((e: { connected: boolean }) => e.connected).length;
        setConnectedCount(connected);

        // Auto-search when demographics are pre-populated from a connected account
        if (connected > 0 && demo.first_name && demo.last_name && demo.date_of_birth && !autoSearched) {
          setAutoSearched(true);
          runSearch(demo as PatientDemographics);
        }
      })
      .catch(() => setConnectedCount(0));

    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const noConnections = connectedCount !== null && connectedCount === 0;
  const hasDemo = !!(savedDemo.first_name && savedDemo.last_name);

  const demoName = hasDemo
    ? `${savedDemo.first_name} ${savedDemo.last_name}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Demo Patient Search</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Searches all connected sandbox endpoints simultaneously using the demo patient&apos;s identity.
          In production, this is the patient&apos;s real name and date of birth queried across every connected payer and provider.
        </p>
      </div>

      {/* No connections yet */}
      {noConnections && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-5 py-5 text-center space-y-3">
          <p className="font-semibold text-amber-900">No sandbox accounts connected yet</p>
          <p className="text-sm text-amber-800">
            Connect at least one demo endpoint first. After connecting, the demo patient&apos;s
            identity is stored and the search runs automatically — no manual entry required.
          </p>
          <a
            href="/connect"
            className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Connect Demo Accounts →
          </a>
        </div>
      )}

      {/* Connected with known demo identity */}
      {!noConnections && hasDemo && !showForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-green-800">
              Searching as demo patient: <span className="font-bold">{demoName}</span>
              {savedDemo.date_of_birth && (
                <span className="font-normal text-green-700"> · DOB {savedDemo.date_of_birth}</span>
              )}
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              {connectedCount} connected account{connectedCount !== 1 ? "s" : ""} will be queried
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-green-700 underline whitespace-nowrap"
          >
            Change criteria
          </button>
        </div>
      )}

      {/* Connected but no stored demographics — show form */}
      {!noConnections && !hasDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          No demo patient identity stored yet. Connect a demo account first — demographics are
          captured automatically during the OAuth flow. Or enter them manually below.
        </div>
      )}

      {/* Demo limitation notice */}
      {!noConnections && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-500">
          <strong className="text-gray-700">Demo note:</strong> Each sandbox endpoint uses a different synthetic test patient.
          In production, a single real patient identity would match records across every connected payer and provider simultaneously.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Manual search form — shown when no demo or user clicks "Change criteria" */}
      {(!noConnections && (!hasDemo || showForm)) && (
        <div>
          {showForm && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Edit search criteria</p>
              <button onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Cancel
              </button>
            </div>
          )}
          <div className={noConnections ? "opacity-40 pointer-events-none select-none" : ""}>
            <SearchForm onSubmit={runSearch} loading={loading} initialValues={savedDemo} />
          </div>
        </div>
      )}

      {/* Running / Re-search button when auto-searched */}
      {!noConnections && hasDemo && !showForm && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => runSearch(savedDemo as PatientDemographics)}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold rounded-lg transition text-sm"
          >
            {loading ? "Searching…" : "Search All Connected Accounts"}
          </button>
          {loading && (
            <span className="text-sm text-gray-500">Querying {connectedCount} endpoint{connectedCount !== 1 ? "s" : ""}…</span>
          )}
        </div>
      )}

      {status && <SearchResults status={status} />}
    </div>
  );
}

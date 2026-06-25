"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PatientIntakeForm from "@/components/PatientIntakeForm";
import SearchResults from "@/components/SearchResults";
import ConsolidatedRecord from "@/components/ConsolidatedRecord";
import { startSearch, getSearchStatus, fetchEndpoints } from "@/lib/api";
import { getPatientDemographics, hasPatientProfile, setPatientDemographics, clearPatientProfile } from "@/lib/session";
import {
  DEMO_MODE,
  DEMO_SOURCES,
  findDemoPatient,
  getDemoConnectedSources,
  clearDemoConnections,
  type SourceId,
  type DemoPatient,
} from "@/lib/demo-data";
import type { PatientDemographics, SearchStatus } from "@/types";

// ── Demo search simulation ────────────────────────────────────────────────────

function useDemoSearch() {
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<DemoPatient | null>(null);
  const [connectedSources, setConnectedSources] = useState<SourceId[]>([]);

  const run = (demo: PatientDemographics) => {
    const sources = getDemoConnectedSources();
    setConnectedSources(sources);
    setResult(null);
    setSearching(true);
    setProgress({ current: 0, total: sources.length });

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setProgress({ current, total: sources.length });
      if (current >= sources.length) {
        clearInterval(interval);
        const patient = findDemoPatient(demo.first_name, demo.gender ?? "female");
        setResult(patient);
        setSearching(false);
      }
    }, 900);

    return () => clearInterval(interval);
  };

  return { searching, progress, result, connectedSources, run };
}

// ── Demo page ─────────────────────────────────────────────────────────────────

function DemoPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [demographics, setDemographics] = useState<Partial<PatientDemographics>>({});
  const [hasConnections, setHasConnections] = useState(false);
  const [autoSearchFired, setAutoSearchFired] = useState(false);
  const { searching, progress, result, connectedSources, run } = useDemoSearch();

  useEffect(() => {
    setHasProfile(hasPatientProfile());
    setDemographics(getPatientDemographics());
    setHasConnections(getDemoConnectedSources().length > 0);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !hasProfile || !hasConnections || autoSearchFired) return;
    const demo = getPatientDemographics();
    if (demo.first_name && demo.last_name && demo.date_of_birth) {
      setAutoSearchFired(true);
      run(demo as PatientDemographics);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hasProfile, hasConnections]);

  const handleIntakeSubmit = (demo: PatientDemographics) => {
    setPatientDemographics(demo);
    setHasProfile(true);
    setDemographics(demo);
    router.push("/connect");
  };

  const handleReset = () => {
    clearPatientProfile();
    clearDemoConnections();
    setHasProfile(false);
    setHasConnections(false);
    setDemographics({});
    setAutoSearchFired(false);
  };

  if (!ready) return null;

  // Step 1: Intake
  if (!hasProfile) {
    return <PatientIntakeForm onSubmit={handleIntakeSubmit} />;
  }

  const fullName = `${demographics.first_name ?? ""} ${demographics.last_name ?? ""}`.trim();
  const sourcesLabel = connectedSources
    .map((id) => DEMO_SOURCES[id]?.shortName ?? id)
    .join(" · ");

  return (
    <div className="space-y-6">
      {/* Patient banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Health Records</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Searching for{" "}
            <span className="font-semibold text-gray-800">{fullName}</span>
            {demographics.date_of_birth && <span> · DOB {demographics.date_of_birth}</span>}
            {sourcesLabel && (
              <span className="text-gray-400"> · {sourcesLabel}</span>
            )}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
        >
          Start over
        </button>
      </div>

      {/* No connections yet */}
      {!hasConnections && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-6 text-center space-y-3">
          <p className="font-semibold text-blue-900">Connect your health accounts to search</p>
          <p className="text-sm text-blue-700">
            Choose the health systems and insurers to include in your record search.
          </p>
          <a
            href="/connect"
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Connect Accounts →
          </a>
        </div>
      )}

      {/* Search in progress */}
      {searching && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Searching connected accounts…</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-700"
              style={{ width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : "0%" }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {connectedSources.map((id, i) => {
              const src = DEMO_SOURCES[id];
              const done = i < progress.current;
              return (
                <div
                  key={id}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition ${
                    done
                      ? `${src.badgeBg} ${src.badgeText} ${src.borderColor}`
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  {done ? (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  {src.shortName}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search button (manual re-run) */}
      {hasConnections && !searching && !result && (
        <button
          onClick={() => run(demographics as PatientDemographics)}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition text-sm"
        >
          Search All Connected Accounts
        </button>
      )}

      {/* Results */}
      {result && !searching && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-700">
              Records found across {connectedSources.length} source{connectedSources.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => run(demographics as PatientDemographics)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Re-run search
            </button>
          </div>
          <ConsolidatedRecord
            patient={result}
            displayName={fullName}
            connectedSources={connectedSources}
          />
        </>
      )}
    </div>
  );
}

// ── Live page (original OAuth flow) ──────────────────────────────────────────

function LivePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
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

  useEffect(() => {
    const profile = hasPatientProfile();
    const demo = getPatientDemographics();
    setHasProfile(profile);
    setDemographics(demo);
    setReady(true);
  }, []);

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

  if (!hasProfile) return <PatientIntakeForm onSubmit={handleIntakeSubmit} />;

  const fullName = `${demographics.first_name ?? ""} ${demographics.last_name ?? ""}`.trim();
  const noConnections = connectedCount !== null && connectedCount === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Search</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Searching for records matching{" "}
            <span className="font-semibold text-gray-800">{fullName}</span>
            {demographics.date_of_birth && <span> · DOB {demographics.date_of_birth}</span>}
          </p>
        </div>
        <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap">
          Change patient
        </button>
      </div>
      {noConnections && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-5 py-5 text-center space-y-3">
          <p className="font-semibold text-amber-900">No accounts connected yet</p>
          <a href="/connect" className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
            Connect Accounts →
          </a>
        </div>
      )}
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
            {" · "}<a href="/connect" className="underline hover:text-gray-600">manage</a>
          </span>
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
      {status && <SearchResults status={status} patientName={fullName} />}
    </div>
  );
}

// ── Page entry ────────────────────────────────────────────────────────────────

export default function Home() {
  return DEMO_MODE ? <DemoPage /> : <LivePage />;
}

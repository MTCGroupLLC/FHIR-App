"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Endpoint } from "@/types";
import { getSessionId, setPatientDemographics, getPatientDemographics } from "@/lib/session";
import {
  DEMO_MODE,
  DEMO_SOURCES,
  getDemoConnectedSources,
  addDemoConnectedSource,
  type SourceId,
} from "@/lib/demo-data";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Demo connect view ─────────────────────────────────────────────────────────

function DemoSourceCard({
  sourceId,
  connected,
  onConnect,
}: {
  sourceId: SourceId;
  connected: boolean;
  onConnect: () => void;
}) {
  const src = DEMO_SOURCES[sourceId];
  return (
    <div
      className={`bg-white border rounded-xl p-5 shadow-sm transition ${
        connected ? "border-green-200 bg-green-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${src.badgeBg} ${src.badgeText}`}
            >
              {src.shortName.slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{src.name}</p>
              <p className="text-xs text-gray-400 capitalize">{src.type}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">{src.description}</p>
        </div>
        <div className="flex-shrink-0">
          {connected ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Connected
            </span>
          ) : (
            <button
              onClick={onConnect}
              className="text-sm font-semibold px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DemoConnectPage() {
  const router = useRouter();
  const [connected, setConnected] = useState<Set<SourceId>>(new Set());

  useEffect(() => {
    setConnected(new Set(getDemoConnectedSources()));
  }, []);

  const handleConnect = (id: SourceId) => {
    addDemoConnectedSource(id);
    setConnected((prev) => new Set([...prev, id]));
  };

  const allConnected = (Object.keys(DEMO_SOURCES) as SourceId[]).every((id) => connected.has(id));
  const anyConnected = connected.size > 0;
  const patientDemo = typeof window !== "undefined" ? getPatientDemographics() : {};
  const patientName = patientDemo.first_name
    ? `${patientDemo.first_name} ${patientDemo.last_name ?? ""}`.trim()
    : "your patient";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connect Your Health Accounts</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Connect each health system below to include their records in your search for{" "}
          <strong className="text-gray-800">{patientName}</strong>. You only need to connect once.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(connected.size / Object.keys(DEMO_SOURCES).length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {connected.size} of {Object.keys(DEMO_SOURCES).length} connected
        </span>
      </div>

      {/* Source cards */}
      <div className="space-y-3">
        {(Object.keys(DEMO_SOURCES) as SourceId[]).map((id) => (
          <DemoSourceCard
            key={id}
            sourceId={id}
            connected={connected.has(id)}
            onConnect={() => handleConnect(id)}
          />
        ))}
      </div>

      {/* CTA */}
      {anyConnected && (
        <button
          onClick={() => router.push("/")}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
            allConnected
              ? "bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {allConnected ? "Search Your Records →" : `Search with ${connected.size} source${connected.size !== 1 ? "s" : ""} →`}
        </button>
      )}

      <p className="text-xs text-gray-400 text-center">
        Demo mode — no real connections or credentials are used.
      </p>
    </div>
  );
}

// ── Live (OAuth) connect view — unchanged from original ───────────────────────

const TYPE_LABEL: Record<string, string> = {
  government: "Government Program",
  payer: "Commercial Payer",
  provider: "Provider / EHR",
  hie: "Health Information Exchange",
};

const NEEDS_AUTH = new Set(["smart_standalone", "oauth2", "smart_backend_services"]);

function getPersonaHint(endpoint: Endpoint, patientDemo: Partial<{ first_name: string; last_name: string; gender: string }>) {
  return endpoint.sandbox_hint ?? null;
}

function StatusBadge({
  endpoint,
  onConnect,
  connecting,
}: {
  endpoint: Endpoint;
  onConnect: (ep: Endpoint) => void;
  connecting: boolean;
}) {
  const requiresAuth = endpoint.auth_type ? NEEDS_AUTH.has(endpoint.auth_type) : false;
  if (!requiresAuth) {
    return (
      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
        Open — no login needed
      </span>
    );
  }
  if (endpoint.connected) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Connected
      </span>
    );
  }
  if (endpoint.auth_ready) {
    return (
      <button
        onClick={() => onConnect(endpoint)}
        disabled={connecting}
        className="text-xs font-semibold px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition"
      >
        {connecting ? "Opening…" : "Connect →"}
      </button>
    );
  }
  if (endpoint.registration_status === "pending") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
        Approval Pending
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 italic">Registration required</span>
      {endpoint.developer_portal && (
        <a href={endpoint.developer_portal} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
          Register →
        </a>
      )}
    </div>
  );
}

function LiveConnectPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const patientDemo = typeof window !== "undefined" ? getPatientDemographics() : {};
  const patientName = patientDemo.first_name
    ? `${patientDemo.first_name} ${patientDemo.last_name ?? ""}`.trim()
    : null;

  const fetchEndpoints = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/registry/endpoints`, {
        headers: { "X-Session-ID": getSessionId() },
      });
      if (!res.ok) throw new Error("Failed to load endpoints");
      const data = await res.json();
      setEndpoints(data.endpoints as Endpoint[]);
    } catch {
      setError("Could not load endpoint list. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "auth-complete") {
        if (e.data.demographics && Object.keys(e.data.demographics).length > 0) {
          setPatientDemographics(e.data.demographics);
        }
        setConnecting(null);
        fetchEndpoints();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [fetchEndpoints]);

  const handleConnect = async (endpoint: Endpoint) => {
    setConnecting(endpoint.id);
    const redirectUri = `${window.location.origin}/auth/callback`;
    try {
      const res = await fetch(
        `${API}/api/auth/authorize?endpoint_id=${encodeURIComponent(endpoint.id)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        { headers: { "X-Session-ID": getSessionId() } }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Cannot connect to ${endpoint.name}: ${body.detail ?? "auth URL could not be built"}`);
        setConnecting(null);
        return;
      }
      const { auth_url } = await res.json();
      if (!auth_url) {
        alert(`${endpoint.name} did not return an authorization URL.`);
        setConnecting(null);
        return;
      }
      const popup = window.open(auth_url, `connect-${endpoint.id}`, "width=640,height=720,toolbar=no,menubar=no,scrollbars=yes");
      if (!popup) window.location.href = auth_url;
    } catch {
      setConnecting(null);
      alert("Could not reach the backend.");
    }
  };

  const connectedList = endpoints.filter((e) => e.connected);
  const readyList = endpoints.filter((e) => !e.connected && e.auth_ready);
  const requiredList = endpoints.filter((e) => !e.connected && !e.auth_ready && e.registration_status === "required");

  const Section = ({ title, eps, accent }: { title: string; eps: Endpoint[]; accent: string }) =>
    eps.length === 0 ? null : (
      <div>
        <h3 className={`text-xs font-semibold uppercase tracking-widest ${accent} mb-3`}>{title}</h3>
        <div className="space-y-2">
          {eps.map((ep) => (
            <div key={ep.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{ep.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{TYPE_LABEL[ep.endpoint_type] ?? ep.endpoint_type}</p>
                </div>
                <StatusBadge endpoint={ep} onConnect={handleConnect} connecting={connecting === ep.id} />
              </div>
              {ep.sandbox_hint && !ep.connected && (
                <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  {ep.sandbox_hint}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connect Health Accounts</h2>
        {patientName && (
          <p className="text-gray-500 mt-1 text-sm">
            Connecting accounts for <strong className="text-gray-800">{patientName}</strong>.
          </p>
        )}
        {!loading && (
          <p className="text-sm mt-2 font-medium text-blue-700">
            {connectedList.length} of {endpoints.length} connected
          </p>
        )}
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading endpoints…</div>
      ) : (
        <>
          <Section title="Connected" eps={connectedList} accent="text-green-600" />
          <Section title="Ready to Connect" eps={readyList} accent="text-blue-600" />
          <Section title="Registration Required" eps={requiredList} accent="text-gray-400" />
        </>
      )}
    </div>
  );
}

// ── Page entry ────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  return DEMO_MODE ? <DemoConnectPage /> : <LiveConnectPage />;
}

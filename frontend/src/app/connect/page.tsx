"use client";

import { useEffect, useState, useCallback } from "react";
import type { Endpoint } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TYPE_LABEL: Record<string, string> = {
  government: "Government Program",
  payer: "Commercial Payer",
  provider: "Provider / EHR",
  hie: "Health Information Exchange",
};

const TYPE_ORDER = ["government", "payer", "provider", "hie"];
const GROUP_LABEL: Record<string, string> = {
  government: "Government Programs",
  payer: "Commercial Payers",
  provider: "Providers & EHR Networks",
  hie: "Health Information Exchanges",
};

const NEEDS_AUTH = new Set(["smart_standalone", "oauth2", "smart_backend_services"]);

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

  // Open endpoint — no OAuth needed
  if (!requiresAuth) {
    return (
      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
        Open — no login needed
      </span>
    );
  }

  // Already connected
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

  // Registered with this provider — show Connect button
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

  // Registration submitted, awaiting credentials
  if (endpoint.registration_status === "pending") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Approval Pending
      </span>
    );
  }

  // Not yet registered — show developer portal link
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 italic">Registration required</span>
      {endpoint.developer_portal && (
        <a
          href={endpoint.developer_portal}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Register →
        </a>
      )}
    </div>
  );
}

function EndpointCard({
  endpoint,
  onConnect,
  connecting,
}: {
  endpoint: Endpoint;
  onConnect: (ep: Endpoint) => void;
  connecting: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">{endpoint.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{TYPE_LABEL[endpoint.endpoint_type] ?? endpoint.endpoint_type}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge endpoint={endpoint} onConnect={onConnect} connecting={connecting} />
        </div>
      </div>
      {endpoint.sandbox_hint && !endpoint.connected && (
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
          </svg>
          <p className="text-xs text-amber-800">{endpoint.sandbox_hint}</p>
        </div>
      )}
    </div>
  );
}

export default function ConnectPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEndpoints = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/registry/endpoints`);
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
        `${API}/api/auth/authorize?endpoint_id=${encodeURIComponent(endpoint.id)}&redirect_uri=${encodeURIComponent(redirectUri)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Cannot connect to ${endpoint.name}: ${body.detail ?? "auth URL could not be built"}`);
        setConnecting(null);
        return;
      }
      const { auth_url } = await res.json();
      if (!auth_url) {
        alert(`${endpoint.name} did not return an authorization URL. The endpoint may be temporarily unavailable.`);
        setConnecting(null);
        return;
      }

      const popup = window.open(
        auth_url,
        `connect-${endpoint.id}`,
        "width=640,height=720,toolbar=no,menubar=no,scrollbars=yes"
      );
      if (!popup) {
        window.location.href = auth_url;
      }
    } catch {
      setConnecting(null);
      alert(`Could not reach the backend.`);
    }
  };

  const grouped = TYPE_ORDER.reduce<Record<string, Endpoint[]>>((acc, type) => {
    acc[type] = endpoints.filter((e) => e.endpoint_type === type);
    return acc;
  }, {});

  const connectedCount = endpoints.filter((e) => {
    if (!NEEDS_AUTH.has(e.auth_type ?? "")) return true;
    return e.connected;
  }).length;

  const registeredCount = endpoints.filter((e) => e.auth_ready || e.registration_status === "registered").length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connect Your Health Accounts</h2>
        <p className="text-gray-500 mt-1 text-sm max-w-2xl">
          Connect each payer or provider <strong>once</strong>. Your authorization is saved — every
          future search automatically queries your connected accounts without asking again.
        </p>
        {!loading && (
          <div className="flex gap-4 mt-2 text-sm">
            <span className="font-medium text-blue-700">{connectedCount} of {endpoints.length} connected</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{registeredCount} registered with app credentials</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-sm">Loading endpoints…</div>
      ) : (
        TYPE_ORDER.filter((type) => grouped[type]?.length > 0).map((type) => (
          <div key={type}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              {GROUP_LABEL[type]}
            </h3>
            <div className="space-y-2">
              {grouped[type].map((ep) => (
                <EndpointCard
                  key={ep.id}
                  endpoint={ep}
                  onConnect={handleConnect}
                  connecting={connecting === ep.id}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">How it works</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>Click <strong>Connect</strong> next to each payer or provider you have coverage with.</li>
          <li>Log in with your existing member portal or patient portal credentials.</li>
          <li>Your authorization is saved. Return to <a href="/" className="underline font-medium">Patient Search</a> and run a search — connected accounts are queried automatically.</li>
        </ol>
        <p className="mt-3 text-blue-600 text-xs">
          Payers showing <em>Registration required</em> require a one-time developer registration
          before this app can connect on your behalf. Click <strong>Register →</strong> next to each
          to complete that process, then return here.
        </p>
      </div>
    </div>
  );
}

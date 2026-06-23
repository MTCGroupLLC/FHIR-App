"use client";

import type { SearchStatus, MatchResult } from "@/types";

const TYPE_LABEL: Record<string, string> = {
  payer: "Payer",
  provider: "Provider / EHR",
  government: "Government",
  hie: "HIE",
};

const CONFIDENCE_COLOR = (c?: number) => {
  if (!c) return "text-gray-500";
  if (c >= 0.9) return "text-green-600";
  if (c >= 0.7) return "text-yellow-600";
  return "text-red-500";
};

function AuthRequiredCard({ result }: { result: MatchResult }) {
  const { endpoint, auth_url, auth_instructions } = result;
  return (
    <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-800">{endpoint.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {TYPE_LABEL[endpoint.endpoint_type] ?? endpoint.endpoint_type} &mdash; Authorization required
          </p>
        </div>
        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          SMART on FHIR
        </span>
      </div>
      {auth_instructions && (
        <p className="text-xs text-gray-600 mt-2">{auth_instructions}</p>
      )}
      {auth_url && (
        <a
          href={auth_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition"
        >
          Authorize access →
        </a>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: MatchResult }) {
  const { endpoint, patient_id, match_confidence, access_url, auth_instructions } = result;
  return (
    <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-800">{endpoint.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABEL[endpoint.endpoint_type] ?? endpoint.endpoint_type}</p>
        </div>
        {match_confidence !== undefined && (
          <span className={`text-sm font-medium ${CONFIDENCE_COLOR(match_confidence)}`}>
            {Math.round(match_confidence * 100)}% match
          </span>
        )}
      </div>

      {patient_id && (
        <p className="text-xs text-gray-600 mt-2">
          Patient ID: <code className="bg-gray-100 px-1 rounded">{patient_id}</code>
        </p>
      )}

      {access_url && (
        <p className="text-xs mt-1">
          <span className="text-gray-500">Access URL: </span>
          <code className="text-blue-700 break-all">{access_url}</code>
        </p>
      )}

      {auth_instructions && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2">
          {auth_instructions}
        </p>
      )}
    </div>
  );
}

export default function SearchResults({ status }: { status: SearchStatus }) {
  const pct = status.total > 0 ? Math.round((status.current / status.total) * 100) : 0;
  const isRunning = status.state === "progress" || status.state === "pending";

  const confirmed = status.results.filter((r) => r.matched);
  const authRequired = status.results.filter((r) => !r.matched && r.auth_url);

  return (
    <div className="mt-6 space-y-4">
      {/* Progress bar */}
      {isRunning && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Querying endpoints…</span>
            <span>{status.current} / {status.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Confirmed matches */}
      {confirmed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-green-700 mb-2">
            {confirmed.length} record location{confirmed.length !== 1 ? "s" : ""} found
            {status.state === "complete" ? ` across ${status.total} endpoints` : ""}
          </p>
          <div className="space-y-3">
            {confirmed.map((r) => (
              <ResultCard key={r.endpoint.id} result={r} />
            ))}
          </div>
        </div>
      )}

      {/* Endpoints needing patient authorization */}
      {authRequired.length > 0 && (
        <div>
          <p className="text-sm font-medium text-amber-700 mb-2">
            {authRequired.length} endpoint{authRequired.length !== 1 ? "s" : ""} require your authorization to check
          </p>
          <div className="space-y-3">
            {authRequired.map((r) => (
              <AuthRequiredCard key={r.endpoint.id} result={r} />
            ))}
          </div>
        </div>
      )}

      {status.state === "complete" && confirmed.length === 0 && authRequired.length === 0 && (
        <p className="text-sm text-gray-500">
          No matching records found across {status.total} queried endpoints.
        </p>
      )}
    </div>
  );
}

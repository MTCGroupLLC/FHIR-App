"use client";

import type { SearchStatus, MatchResult } from "@/types";

const CONFIDENCE_COLOR = (c?: number) => {
  if (!c) return "text-gray-500";
  if (c >= 0.9) return "text-green-600";
  if (c >= 0.7) return "text-yellow-600";
  return "text-red-500";
};

const TYPE_LABEL: Record<string, string> = {
  payer: "Payer",
  provider: "Provider / EHR",
  government: "Government",
  hie: "HIE",
};

function MatchCard({ result }: { result: MatchResult }) {
  const { endpoint, patient_id, match_confidence, access_url } = result;
  return (
    <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-800">{endpoint.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABEL[endpoint.endpoint_type] ?? endpoint.endpoint_type}</p>
        </div>
        {match_confidence !== undefined && (
          <span className={`text-sm font-semibold ${CONFIDENCE_COLOR(match_confidence)}`}>
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
        <p className="text-xs mt-1 break-all">
          <span className="text-gray-500">Record URL: </span>
          <code className="text-blue-700">{access_url}</code>
        </p>
      )}
    </div>
  );
}

export default function SearchResults({ status, mode = "patient" }: { status: SearchStatus; mode?: "patient" | "provider" }) {
  const pct = status.total > 0 ? Math.round((status.current / status.total) * 100) : 0;
  const isRunning = status.state === "progress" || status.state === "pending";
  const confirmed = status.results.filter((r) => r.matched);
  const notConnected = status.not_connected ?? 0;

  return (
    <div className="mt-6 space-y-4">
      {/* Progress */}
      {isRunning && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Querying connected accounts…</span>
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
          <p className="text-sm font-semibold text-green-700 mb-2">
            {confirmed.length} record location{confirmed.length !== 1 ? "s" : ""} found
            {status.state === "complete" ? ` across ${status.total} connected endpoint${status.total !== 1 ? "s" : ""}` : ""}
          </p>
          <div className="space-y-3">
            {confirmed.map((r) => (
              <MatchCard key={r.endpoint.id} result={r} />
            ))}
          </div>
        </div>
      )}

      {/* Not-connected accounts */}
      {status.state === "complete" && notConnected > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          {mode === "provider" ? (
            <p className="text-sm text-amber-800">
              <strong>{notConnected} endpoint{notConnected !== 1 ? "s" : ""}</strong> skipped —
              backend service credentials not yet configured for these payers.
            </p>
          ) : (
            <p className="text-sm text-amber-800">
              <strong>{notConnected} account{notConnected !== 1 ? "s" : ""}</strong> not searched — not yet connected.
            </p>
          )}
          {mode === "patient" && (
            <a
              href="/connect"
              className="text-xs font-semibold px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition whitespace-nowrap"
            >
              Connect accounts →
            </a>
          )}
        </div>
      )}

      {/* No matches at all */}
      {status.state === "complete" && confirmed.length === 0 && notConnected === 0 && (
        <p className="text-sm text-gray-500">
          No matching records found across {status.total} queried endpoint{status.total !== 1 ? "s" : ""}.
        </p>
      )}

      {/* Ran no queries */}
      {status.state === "complete" && status.total === 0 && notConnected > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-center">
          {mode === "provider" ? (
            <p className="text-sm text-gray-600">
              No endpoints could be queried. Backend service credentials are required for provider-mode
              searches. <a href="/connect" className="text-blue-600 underline">View credential status →</a>
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">No accounts connected yet. Connect your health accounts to search for your records.</p>
              <a
                href="/connect"
                className="inline-block text-sm font-semibold px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Connect your accounts →
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

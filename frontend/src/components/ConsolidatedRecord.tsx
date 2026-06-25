"use client";

import { useState } from "react";
import type { DemoPatient, DemoCondition, DemoMedication, DemoLab, DemoDocument, SourceId } from "@/lib/demo-data";
import { DEMO_SOURCES } from "@/lib/demo-data";

// ── Source badge ──────────────────────────────────────────────────────────────

function SourceBadge({ sourceId }: { sourceId: SourceId }) {
  const src = DEMO_SOURCES[sourceId];
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${src.badgeBg} ${src.badgeText} ${src.borderColor}`}
    >
      {src.shortName}
    </span>
  );
}

// ── Flag indicator ────────────────────────────────────────────────────────────

function FlagBadge({ flag }: { flag: DemoLab["flag"] }) {
  if (flag === "normal") return null;
  return (
    <span
      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
        flag === "high"
          ? "bg-red-100 text-red-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {flag === "high" ? "H" : "L"}
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DemoCondition["status"] }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {status === "active" ? "Active" : "Resolved"}
    </span>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ patient }: { patient: DemoPatient }) {
  const activeConditions = patient.conditions.filter((c) => c.status === "active");
  const flaggedLabs = patient.labs.filter((l) => l.flag !== "normal");
  const latestDoc = [...patient.documents].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Conditions", value: patient.conditions.length, sub: `${activeConditions.length} active` },
          { label: "Medications", value: patient.medications.length, sub: "current" },
          { label: "Lab Results", value: patient.labs.length, sub: `${flaggedLabs.length} flagged` },
          { label: "Documents", value: patient.documents.length, sub: "on file" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Active conditions summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Conditions</h4>
        <div className="space-y-2">
          {activeConditions.map((c) => (
            <div key={c.icd10} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-800 truncate">{c.name}</span>
                <span className="text-xs text-gray-400 hidden sm:inline">{c.icd10}</span>
              </div>
              <SourceBadge sourceId={c.source} />
            </div>
          ))}
        </div>
      </div>

      {/* Flagged labs */}
      {flaggedLabs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-amber-800 mb-3">Lab Values Needing Attention</h4>
          <div className="space-y-2">
            {flaggedLabs.map((l) => (
              <div key={l.test + l.date} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FlagBadge flag={l.flag} />
                  <span className="text-sm text-gray-800 truncate">{l.test}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700">
                    {l.value} {l.unit}
                  </span>
                  <SourceBadge sourceId={l.source} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last updated */}
      {latestDoc && (
        <p className="text-xs text-gray-400 text-center">
          Most recent record: {latestDoc.title} · {latestDoc.date} · via {DEMO_SOURCES[latestDoc.source].name}
        </p>
      )}
    </div>
  );
}

// ── Conditions tab ────────────────────────────────────────────────────────────

function ConditionsTab({ conditions }: { conditions: DemoCondition[] }) {
  const active = conditions.filter((c) => c.status === "active");
  const resolved = conditions.filter((c) => c.status === "resolved");

  const ConditionRow = ({ c }: { c: DemoCondition }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800">{c.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{c.icd10}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={c.status} />
          <SourceBadge sourceId={c.source} />
        </div>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span>Onset: {c.onsetDate}</span>
        <span>Last reviewed: {c.lastReviewed}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {active.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Active ({active.length})</h4>
          {active.map((c) => <ConditionRow key={c.icd10} c={c} />)}
        </div>
      )}
      {resolved.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Resolved ({resolved.length})</h4>
          {resolved.map((c) => <ConditionRow key={c.icd10} c={c} />)}
        </div>
      )}
    </div>
  );
}

// ── Medications tab ───────────────────────────────────────────────────────────

function MedicationsTab({ medications }: { medications: DemoMedication[] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Current Medications ({medications.length})
      </h4>
      {medications.map((m, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-800">{m.name}</p>
              <p className="text-sm text-gray-600 mt-0.5">
                {m.dose} · {m.frequency}
              </p>
              {m.indication && (
                <p className="text-xs text-gray-400 mt-1">For: {m.indication}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <SourceBadge sourceId={m.source} />
              <span className="text-xs text-gray-400">Since {m.startDate}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Labs tab ──────────────────────────────────────────────────────────────────

function LabsTab({ labs }: { labs: DemoLab[] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Lab Results ({labs.length})
      </h4>
      {labs.map((l, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FlagBadge flag={l.flag} />
                <p className="font-semibold text-gray-800">{l.test}</p>
              </div>
              <p className="text-sm mt-1">
                <span className={`font-semibold ${l.flag !== "normal" ? "text-red-700" : "text-gray-800"}`}>
                  {l.value}
                </span>
                {l.unit && <span className="text-gray-500"> {l.unit}</span>}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Reference: {l.referenceRange}</p>
              {l.note && (
                <p className="text-xs text-amber-700 mt-1.5 bg-amber-50 rounded px-2 py-1">{l.note}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <SourceBadge sourceId={l.source} />
              <span className="text-xs text-gray-400">{l.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Documents tab ─────────────────────────────────────────────────────────────

function DocumentsTab({ documents }: { documents: DemoDocument[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Clinical Documents ({documents.length})
      </h4>
      {documents.map((doc, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition"
          >
            <div className="min-w-0">
              <p className="font-semibold text-gray-800">{doc.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{doc.docType}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <SourceBadge sourceId={doc.source} />
              <span className="text-xs text-gray-400">{doc.date}</span>
            </div>
          </button>
          {expanded === i && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-line">
                {doc.summary}
              </p>
            </div>
          )}
          <div className="px-4 pb-3 flex items-center justify-between">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {expanded === i ? "Collapse ↑" : "Read document ↓"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = "overview" | "conditions" | "medications" | "labs" | "documents";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "conditions", label: "Conditions" },
  { id: "medications", label: "Medications" },
  { id: "labs", label: "Labs" },
  { id: "documents", label: "Documents" },
];

interface Props {
  patient: DemoPatient;
  displayName: string;
  connectedSources: SourceId[];
}

export default function ConsolidatedRecord({ patient, displayName, connectedSources }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const visibleConditions = patient.conditions.filter((c) => connectedSources.includes(c.source));
  const visibleMeds = patient.medications.filter((m) => connectedSources.includes(m.source));
  const visibleLabs = patient.labs.filter((l) => connectedSources.includes(l.source));
  const visibleDocs = patient.documents.filter((d) => connectedSources.includes(d.source));

  const filteredPatient: DemoPatient = {
    ...patient,
    conditions: visibleConditions,
    medications: visibleMeds,
    labs: visibleLabs,
    documents: visibleDocs,
  };

  return (
    <div className="space-y-5">
      {/* Record header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Health Record — {displayName}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Consolidated from {connectedSources.length} connected source{connectedSources.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedSources.map((id) => (
              <SourceBadge key={id} sourceId={id} />
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-5 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && <OverviewTab patient={filteredPatient} />}
        {activeTab === "conditions" && <ConditionsTab conditions={filteredPatient.conditions} />}
        {activeTab === "medications" && <MedicationsTab medications={filteredPatient.medications} />}
        {activeTab === "labs" && <LabsTab labs={filteredPatient.labs} />}
        {activeTab === "documents" && <DocumentsTab documents={filteredPatient.documents} />}
      </div>

      <p className="text-xs text-gray-400 text-center pb-2">
        Demo: All records are synthetic. No real patient data is stored or transmitted.
      </p>
    </div>
  );
}

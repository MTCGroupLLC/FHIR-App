"use client";

import { useState, useRef } from "react";
import SearchForm from "@/components/SearchForm";
import SearchResults from "@/components/SearchResults";
import { startSearch, getSearchStatus } from "@/lib/api";
import type { PatientDemographics, SearchStatus } from "@/types";

export default function ProviderPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SearchStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const handleSubmit = async (demographics: PatientDemographics) => {
    setLoading(true);
    setStatus(null);
    setError(null);
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
      setError("Could not reach the backend. Is the service running?");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HIPAA notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
        <p className="font-semibold text-blue-900">Provider / Staff Mode — HIPAA TPO Applies</p>
        <p className="text-blue-800 mt-1">
          Under HIPAA 45 CFR §164.506, covered entities may use and disclose PHI for{" "}
          <strong>Treatment, Payment, and Operations (TPO)</strong> without patient authorization.
          Querying another covered entity for records to treat a patient in your care is a
          permitted TPO disclosure — no patient consent form required.
        </p>
        <p className="text-blue-700 text-xs mt-2">
          Exceptions: substance use disorder records (42 CFR Part 2), certain mental health and
          reproductive health records under applicable state law — these require explicit patient
          authorization even between covered entities.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Provider Search — Patient Record Lookup</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Enter the patient&apos;s demographics. All reachable FHIR endpoints are queried simultaneously —
          no patient login is required for endpoints where backend credentials are configured.
        </p>
      </div>

      {/* Credential tier explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-4 text-sm">
        <p className="font-semibold text-blue-900 mb-2">What this search can reach</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-800">Open endpoints</span>
              <span className="text-gray-500"> — no authentication required, queried immediately</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-800">OAuth-connected endpoints</span>
              <span className="text-gray-500"> — uses patient-authorized tokens already in this session (demo only)</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-800">Backend service endpoints</span>
              <span className="text-gray-500"> — requires org-level server-to-server credentials (not yet configured)</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-blue-700 text-xs border-t border-blue-200 pt-3">
          In production, provider mode uses <strong>SMART Backend Services</strong> credentials — a
          separate application registration from patient OAuth that allows querying any patient given
          their demographics, without requiring the patient to connect first. Backend credentials
          from CMS and VA are the next step for this app. Broad commercial payer coverage requires{" "}
          <strong>TEFCA / QHIN participation</strong>.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <SearchForm onSubmit={handleSubmit} loading={loading} />

      {status && <SearchResults status={status} mode="provider" />}
    </div>
  );
}

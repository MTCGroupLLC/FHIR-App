"use client";

import { useState } from "react";
import type { PatientDemographics } from "@/types";

interface Props {
  onSubmit: (demographics: PatientDemographics) => void;
  loading: boolean;
  initialValues?: Partial<PatientDemographics>;
}

export default function SearchForm({ onSubmit, loading, initialValues }: Props) {
  const [form, setForm] = useState<PatientDemographics>({
    first_name: initialValues?.first_name ?? "",
    last_name: initialValues?.last_name ?? "",
    date_of_birth: initialValues?.date_of_birth ?? "",
    gender: initialValues?.gender ?? "",
    street: initialValues?.street ?? "",
    city: initialValues?.city ?? "",
    state: initialValues?.state ?? "",
    postal_code: initialValues?.postal_code ?? "",
    phone: initialValues?.phone ?? "",
    member_id: initialValues?.member_id ?? "",
    ssn_last4: initialValues?.ssn_last4 ?? "",
  });

  const set = (field: keyof PatientDemographics) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputCls =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Patient Information</h2>
        {initialValues?.first_name ? (
          <p className="text-sm text-green-700 mt-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Pre-filled from your connected account — review and search.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            Enter the patient&apos;s details to search all connected FHIR endpoints for matching records.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>First Name *</label>
          <input required className={inputCls} value={form.first_name} onChange={set("first_name")} placeholder="Jane" />
        </div>
        <div>
          <label className={labelCls}>Last Name *</label>
          <input required className={inputCls} value={form.last_name} onChange={set("last_name")} placeholder="Smith" />
        </div>
        <div>
          <label className={labelCls}>Date of Birth *</label>
          <input required type="date" className={inputCls} value={form.date_of_birth} onChange={set("date_of_birth")} />
        </div>
        <div>
          <label className={labelCls}>Gender</label>
          <select className={inputCls} value={form.gender || ""} onChange={set("gender")}>
            <option value="">-- select --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm text-blue-600 hover:underline list-none">
          + Additional identifiers (improves match accuracy)
        </summary>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Street Address</label>
            <input className={inputCls} value={form.street || ""} onChange={set("street")} placeholder="123 Main St" />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input className={inputCls} value={form.city || ""} onChange={set("city")} />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input className={inputCls} value={form.state || ""} onChange={set("state")} placeholder="TX" maxLength={2} />
          </div>
          <div>
            <label className={labelCls}>ZIP Code</label>
            <input className={inputCls} value={form.postal_code || ""} onChange={set("postal_code")} placeholder="78701" />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} type="tel" value={form.phone || ""} onChange={set("phone")} placeholder="512-555-0100" />
          </div>
          <div>
            <label className={labelCls}>Insurance Member ID</label>
            <input className={inputCls} value={form.member_id || ""} onChange={set("member_id")} />
          </div>
          <div>
            <label className={labelCls}>SSN (last 4)</label>
            <input className={inputCls} value={form.ssn_last4 || ""} onChange={set("ssn_last4")} maxLength={4} placeholder="1234" />
          </div>
        </div>
      </details>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition"
      >
        {loading ? "Searching endpoints…" : "Search All FHIR Endpoints"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import type { PatientDemographics } from "@/types";
import { DEMO_MODE, DEMO_PATIENTS } from "@/lib/demo-data";

interface Props {
  onSubmit: (demographics: PatientDemographics) => void;
}

export default function PatientIntakeForm({ onSubmit }: Props) {
  const [form, setForm] = useState<PatientDemographics>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
  });

  const set = (field: keyof PatientDemographics) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const inputCls =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  const selectPersona = (persona: typeof DEMO_PATIENTS[0]) => {
    const filled: PatientDemographics = {
      first_name: persona.firstName,
      last_name: persona.lastName,
      date_of_birth: persona.dateOfBirth,
      gender: persona.gender,
    };
    onSubmit(filled);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Find Your Health Records</h2>
        <p className="text-gray-500 text-sm">
          Enter your name and date of birth to search for your records across connected health systems.
        </p>
      </div>

      {/* Demo persona quick-select */}
      {DEMO_MODE && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Try a demo patient
          </p>
          <div className="grid grid-cols-3 gap-3">
            {DEMO_PATIENTS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPersona(p)}
                className="text-left border border-gray-200 rounded-xl p-3 hover:border-blue-400 hover:bg-blue-50 transition group shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold mb-2 group-hover:bg-blue-200 transition">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="font-semibold text-gray-800 text-sm">
                  {p.firstName} {p.lastName}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {p.age} · {p.gender}
                </div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">{p.tagline}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">or enter your own</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>
        </div>
      )}

      {/* Manual entry form */}
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
        className="bg-white rounded-xl shadow p-6 space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First Name *</label>
            <input
              required
              className={inputCls}
              value={form.first_name}
              onChange={set("first_name")}
              placeholder="Jane"
            />
          </div>
          <div>
            <label className={labelCls}>Last Name *</label>
            <input
              required
              className={inputCls}
              value={form.last_name}
              onChange={set("last_name")}
              placeholder="Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date of Birth *</label>
            <input
              required
              type="date"
              className={inputCls}
              value={form.date_of_birth}
              onChange={set("date_of_birth")}
            />
          </div>
          <div>
            <label className={labelCls}>Sex *</label>
            <select required className={inputCls} value={form.gender || ""} onChange={set("gender")}>
              <option value="">-- select --</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition"
        >
          Continue →
        </button>
      </form>
    </div>
  );
}

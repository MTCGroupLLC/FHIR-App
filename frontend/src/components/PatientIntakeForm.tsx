"use client";

import { useState } from "react";
import type { PatientDemographics } from "@/types";

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

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Who is the patient?</h2>
        <p className="text-gray-500 text-sm">
          Enter the patient&apos;s identifying information. This is used to select the best-matching
          demo account at each connected endpoint and to label the records returned.
        </p>
      </div>

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

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800">
          Sex is used to select the closest-matching demo patient at each sandbox endpoint.
          The records returned will be displayed under the name you entered above.
        </div>

        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition"
        >
          Continue to Connect Accounts →
        </button>
      </form>
    </div>
  );
}

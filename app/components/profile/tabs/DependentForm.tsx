"use client";

import { useEffect } from "react";
import { useMySetups } from "@/app/context/SetupContext";

interface Dependent {
  name: string;
  relation: string;
  countryOfOrigin: string;
  dob?: string;
  gender?: string;
}

interface DependentFormProps {
  form: Dependent;
  onChange: (field: keyof Dependent, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DependentForm({
  form,
  onChange,
  onSave,
  onCancel,
  loading = false,
}: DependentFormProps) {
  const { genders, countries, fetchSetups } = useMySetups();

  useEffect(() => {
    fetchSetups(["genders", "countries"]);
  }, [fetchSetups]);

  return (
    <div className="px-1">
      <div className="mb-3">
        <label>Name</label>
        <input
          type="text"
          className="form-control"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Relationship</label>
        <input
          type="text"
          className="form-control"
          value={form.relation}
          onChange={(e) => onChange("relation", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Date of Birth</label>
        <input
          type="date"
          className="form-control"
          value={form.dob ?? ""}
          onChange={(e) => onChange("dob", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Gender</label>
        <select
          className="form-select"
          value={form.gender ?? ""}
          onChange={(e) => onChange("gender", e.target.value)}
        >
          <option value="">Select Gender</option>
          {genders?.map((g) => (
            <option key={g.code} value={g.code}>
              {g.description}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label>Nationality</label>
        <select
          className="form-select"
          value={form.countryOfOrigin}
          onChange={(e) => onChange("countryOfOrigin", e.target.value)}
        >
          <option value="">Select Country</option>
          {countries?.map((c) => (
            <option key={c.code} value={c.code}>
              {c.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-secondary me-2" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save Dependent"}
        </button>
      </div>
    </div>
  );
}

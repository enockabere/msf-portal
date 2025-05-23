"use client";

import { useEffect } from "react";
import { useMySetups } from "@/app/context/SetupContext";
import { Save, XCircle } from "lucide-react";

interface Dependant {
  name: string;
  relation: string;
  countryOfOrigin: string;
  dob?: string;
  gender?: string;
}

interface DependantFormProps {
  form: Dependant;
  onChange: (field: keyof Dependant, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DependantForm({
  form,
  onChange,
  onSave,
  onCancel,
  loading = false,
}: DependantFormProps) {
  const { genders, countries, fetchSetups } = useMySetups();

  useEffect(() => {
    fetchSetups(["genders", "countries"]);
  }, [fetchSetups]);

  return (
    <div className="px-1">
      <div className="row">
        <div className="mb-3 col-md-12">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        <div className="mb-3 col-md-6">
          <label className="form-label">Relationship</label>
          <select
            className="form-select"
            value={form.relation}
            onChange={(e) => onChange("relation", e.target.value)}
          >
            <option value="">Select Relationship</option>
            <option value="Spouse">Spouse</option>
            <option value="Child">Child</option>
          </select>
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            className="form-control"
            value={form.dob ?? ""}
            onChange={(e) => onChange("dob", e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        <div className="mb-3 col-md-6">
          <label className="form-label">Gender</label>
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

        <div className="mb-3 col-md-6">
          <label className="form-label">Nationality</label>
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
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button
          className="btn btn-secondary me-2 d-flex align-items-center gap-1"
          onClick={onCancel}
        >
          <XCircle size={16} /> Cancel
        </button>
        <button
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={onSave}
          disabled={loading}
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save Dependant"}
        </button>
      </div>
    </div>
  );
}

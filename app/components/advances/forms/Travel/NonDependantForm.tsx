"use client";

import { useEffect } from "react";
import { useMySetups } from "@/app/context/SetupContext";
import { Save, XCircle } from "lucide-react";
import {NonDependant} from "@/app/types/NonDependant";


interface NonDependantFormProps {
  index: number;
  form: NonDependant;
  onChange: (field: keyof NonDependant, value: string) => void;
  onSave: () => void;
  loading?: boolean;
  onRemove: (index: number) => void;
}

export default function NonDependantForm({
  form,
  onChange,
  onSave,
  onRemove,
  loading = false,
  index,
}: NonDependantFormProps) {
  const { countries, fetchSetups } = useMySetups();

  useEffect(() => {
    fetchSetups(["countries"]);
  }, [fetchSetups]);

  return (
    <div className="px-1">
      <div className="row">
        <div className="mb-3 col-md-12">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            value={form.travellerName}
            onChange={(e) => onChange("travellerName", e.target.value)}
          />
        </div>
      </div>

      <div className="row">
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
          onClick={() => onRemove(index)}
        >
          <XCircle size={16} /> Cancel
        </button>
        <button
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={onSave}
          disabled={loading}
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save NonDependant"}
        </button>
      </div>
    </div>
  );
}

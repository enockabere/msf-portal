"use client";

import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, Save } from "lucide-react";

interface ExpenseItem {
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
  project: string;
  otherCategory?: string;
}

interface OperationalLineFormProps {
  expenses: ExpenseItem[];
  handleChange: <K extends keyof ExpenseItem>(
    index: number,
    field: K,
    value: ExpenseItem[K]
  ) => void;
  handleFileChange: (index: number, file: File | null) => void;
  removeExpenseLine: (index: number) => void;
  addExpenseLine: () => void;
  onSaveLine?: (index: number, item: ExpenseItem) => void;
}

const COST_CENTERS = {
  ICT: ["Network Upgrade", "Helpdesk Support", "Software Projects"],
  Finance: ["Audit", "Budget Planning"],
  HR: ["Recruitment", "Training Programs"],
  Programs: ["Water Sanitation", "Food Relief"],
};

export default function OperationalLineForm({
  expenses,
  handleChange,
  handleFileChange,
  removeExpenseLine,
  addExpenseLine,
  onSaveLine,
}: OperationalLineFormProps) {
  const showMileageColumn = expenses.some((e) => e.category === "Transport");
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);

  useEffect(() => {
    if (expenses.length === 0) {
      addExpenseLine();
    }
  }, [expenses, addExpenseLine]);

  const handleCostCenterChange = (index: number, value: string) => {
    handleChange(index, "costCenter", value);
    handleChange(index, "project", ""); 
    if (value && COST_CENTERS[value as keyof typeof COST_CENTERS]) {
      setAvailableProjects(COST_CENTERS[value as keyof typeof COST_CENTERS]);
    } else {
      setAvailableProjects([]);
    }
  };

  return (
    <div>
      <table className="table table-bordered mb-3 align-middle">
        <thead className="table-light">
          <tr>
            <th>Category</th>
            <th>Amount (KES)</th>
            {showMileageColumn && <th>Mileage</th>}
            <th>Cost Center</th>
            <th>Project</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={idx}>
              <td>
                <select
                  className="form-select"
                  value={exp.category}
                  onChange={(e) => {
                    const selected = e.target.value;
                    handleChange(idx, "category", selected);
                  }}
                >
                  <option value="">-- Select Category --</option>
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Meals">Meals</option>
                  <option value="Stationery">Stationery</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={isNaN(exp.amount) ? "" : exp.amount}
                  onChange={(e) =>
                    handleChange(idx, "amount", Number(e.target.value))
                  }
                  placeholder="Enter Amount"
                />
              </td>
              {showMileageColumn && (
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={exp.mileage}
                    onChange={(e) =>
                      handleChange(idx, "mileage", e.target.value)
                    }
                    placeholder="Mileage"
                  />
                </td>
              )}
              <td>
                <select
                  className="form-select"
                  value={exp.costCenter}
                  onChange={(e) => handleCostCenterChange(idx, e.target.value)}
                >
                  <option value="">-- Select Cost Center --</option>
                  {Object.keys(COST_CENTERS).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className="form-select"
                  value={exp.project}
                  onChange={(e) => handleChange(idx, "project", e.target.value)}
                  disabled={!exp.costCenter}
                >
                  <option value="">-- Select Project --</option>
                  {exp.costCenter && COST_CENTERS[exp.costCenter as keyof typeof COST_CENTERS]?.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </td>
              <td className="text-center d-flex gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => onSaveLine?.(idx, exp)}
                >
                  <Save size={14} /> save
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeExpenseLine(idx)}
                >
                  <Trash2 size={14} /> delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-3 d-flex justify-content-start">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
          onClick={addExpenseLine}
        >
          <PlusCircle size={16} /> Add Advance Line
        </button>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { UploadCloud, Save } from "lucide-react";

interface ExpenseItem {
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
  project: string;
  surrenderedAmount?: number;
}

interface Props {
  expenses: ExpenseItem[];
  setExpenses: (expenses: ExpenseItem[]) => void;
  balance: number;
}

export default function SettlementExpenseForm({
  expenses,
  setExpenses,
  balance,
}: Props) {
  const handleChange = <K extends keyof ExpenseItem>(
    index: number,
    field: K,
    value: ExpenseItem[K]
  ) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...expenses];
    updated[index].receipt = file;
    setExpenses(updated);
  };

  return (
    <>
      <table className="table table-bordered mb-3 align-middle">
        <thead className="table-light">
          <tr>
            <th>Category</th>
            <th>Amount Given</th>
            <th>Cost Center</th>
            <th>Project</th>
            <th>Upload Receipt</th>
            <th>Amount Surrendered</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={idx}>
              <td>{exp.category}</td>
              <td>KES {exp.amount.toLocaleString()}</td>
              <td>{exp.costCenter}</td>
              <td>{exp.project}</td>
              <td>
                <label className="btn btn-sm btn-outline-secondary w-100">
                  <UploadCloud size={14} className="me-1" /> Upload
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    hidden
                    onChange={(e) =>
                      handleFileChange(idx, e.target.files?.[0] || null)
                    }
                  />
                </label>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={exp.surrenderedAmount ?? ""}
                  onChange={(e) =>
                    handleChange(
                      idx,
                      "surrenderedAmount",
                      parseFloat(e.target.value)
                    )
                  }
                  placeholder="Enter amount"
                />
              </td>
              <td className="text-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => console.log("Save row", idx)}
                >
                  <Save size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

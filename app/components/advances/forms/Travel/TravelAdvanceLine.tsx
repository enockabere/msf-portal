"use client";

import React from "react";
import { Save, Trash2, Send, ChevronLeft } from "lucide-react";

interface LineItem {
  category: string;
  amount: number;
}

interface Props {
  lines: LineItem[];
  setLines: (lines: LineItem[]) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function TravelAdvanceLine({
  lines,
  setLines,
  onSubmit,
  onBack,
}: Props) {
  const updateLine = <K extends keyof LineItem>(
    index: number,
    field: K,
    value: LineItem[K]
  ) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const removeLine = (index: number) => {
    const updated = [...lines];
    updated.splice(index, 1);
    setLines(updated);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-primary-subtle">
        <h5 className="mb-0 text-dark">Step 2: Advance Breakdown</h5>
      </div>
      <div className="card-body">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Expense Category</th>
              <th>Amount (KES)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx}>
                <td>
                  <select
                    className="form-select"
                    value={line.category}
                    onChange={(e) =>
                      updateLine(idx, "category", e.target.value)
                    }
                  >
                    <option value="">-- Select --</option>
                    <option value="Visa">Visa Money</option>
                    <option value="Perdiem">Perdiem</option>
                    <option value="Security">Security</option>
                    <option value="Ticket">Ticket</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={line.amount}
                    onChange={(e) =>
                      updateLine(idx, "amount", Number(e.target.value))
                    }
                  />
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeLine(idx)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={onBack}
          >
            <ChevronLeft size={16} />
            Previous Step
          </button>

          <button
            type="button"
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={onSubmit}
          >
            <Send size={16} />
            Submit Advance
          </button>
        </div>
      </div>
    </div>
  );
}

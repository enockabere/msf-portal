"use client";

import React, { useState } from "react";
import { Trash2, UploadCloud, PlusCircle } from "lucide-react";
import { Modal } from "react-bootstrap";

interface ExpenseItem {
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
  otherCategory?: string;
}

interface Props {
  expenses: ExpenseItem[];
  setExpenses: (expenses: ExpenseItem[]) => void;
  balance: number;
}

const COST_CENTERS: Record<string, string[]> = {
  ICT: ["Network Upgrade", "Helpdesk Support", "Software Projects"],
  Finance: ["Audit", "Budget Planning"],
  HR: ["Recruitment", "Training Programs"],
  Programs: ["Water Sanitation", "Food Relief"],
};

export default function SettlementExpenseForm({
  expenses,
  setExpenses,
  balance,
}: Props) {
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [currentOtherIdx, setCurrentOtherIdx] = useState<number | null>(null);
  const [otherInput, setOtherInput] = useState("");

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

  const addExpenseLine = () => {
    setExpenses([
      ...expenses,
      {
        category: "",
        amount: NaN,
        receipt: null,
        mileage: "",
        costCenter: "",
        otherCategory: "",
      },
    ]);
  };

  const removeExpenseLine = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };
  const showMileageColumn = expenses.some((e) => e.category === "Transport");

  const openOtherModal = (idx: number) => {
    setCurrentOtherIdx(idx);
    setOtherInput("");
    setShowOtherModal(true);
  };

  const saveOtherCategory = () => {
    if (currentOtherIdx !== null && otherInput.trim() !== "") {
      handleChange(currentOtherIdx, "otherCategory", otherInput.trim());
    }
    setShowOtherModal(false);
  };

  return (
    <>
      {/* Expense Table */}
      <table className="table table-bordered mb-3 align-middle">
        <thead className="table-light">
          <tr>
            <th>Receipt</th>
            <th>Category</th>
            <th>Amount (KES)</th>
            {showMileageColumn && <th>Mileage</th>}
            <th>Cost Center</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={idx}>
              {/* Receipt Upload */}
              <td>
                <label className="btn btn-sm btn-outline-secondary w-100">
                  <UploadCloud size={14} className="me-1" />
                  Upload
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

              {/* Category */}
              <td>
                <select
                  className="form-select"
                  value={exp.category}
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected === "Others") {
                      openOtherModal(idx);
                    }
                    handleChange(idx, "category", selected);
                  }}
                >
                  <option value="">-- Select Category --</option>
                  <option>Transport</option>
                  <option>Accommodation</option>
                  <option>Meals</option>
                  <option>Stationery</option>
                  <option>Others</option>
                </select>
                {exp.category === "Others" && exp.otherCategory && (
                  <div className="small text-muted mt-1">
                    Other: {exp.otherCategory}
                  </div>
                )}
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={isNaN(exp.amount) ? "" : exp.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange(idx, "amount", val ? Number(val) : NaN);
                  }}
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

              {/* Cost Center */}
              <td>
                <select
                  className="form-select"
                  value={exp.costCenter}
                  onChange={(e) =>
                    handleChange(idx, "costCenter", e.target.value)
                  }
                >
                  <option value="">-- Select Cost Center --</option>
                  {Object.entries(COST_CENTERS).map(([dept, projects]) => (
                    <optgroup key={dept} label={dept}>
                      <option value={dept}>{dept} (Department Only)</option>
                      {projects.map((proj) => (
                        <option key={proj} value={`${dept} - ${proj}`}>
                          {proj}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </td>
              <td className="text-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeExpenseLine(idx)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Line + Amount Summary */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <button
          type="button"
          className="btn btn-sm btn-outline-success d-flex align-items-center gap-2"
          onClick={addExpenseLine}
        >
          <PlusCircle size={16} /> Add Expense Line
        </button>
      </div>

      {/* Other Category Modal */}
      <Modal
        show={showOtherModal}
        onHide={() => setShowOtherModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-danger">
          <Modal.Title>Specify Other Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Other Category"
            value={otherInput}
            onChange={(e) => setOtherInput(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowOtherModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={saveOtherCategory}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

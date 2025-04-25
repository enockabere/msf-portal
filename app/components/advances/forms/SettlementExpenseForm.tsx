"use client";

import React from "react";
import { Trash2, UploadCloud } from "lucide-react";

interface ExpenseItem {
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
  deliverer: string;
}

interface Props {
  expenses: ExpenseItem[];
  setExpenses: (expenses: ExpenseItem[]) => void;
  balance: number;
}

const USER_LIST = [
  "John Doe",
  "Jane Smith",
  "Michael Johnson",
  "Sarah Williams",
  "David Brown",
];

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

  const addExpenseLine = () => {
    setExpenses([
      ...expenses,
      {
        category: "",
        amount: 0,
        receipt: null,
        mileage: "",
        costCenter: "ICT",       // default
        deliverer: USER_LIST[0], // default first user
      },
    ]);
  };

  const removeExpenseLine = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const totalJustified = expenses.reduce((sum, item) => sum + item.amount, 0);
  const showMileageColumn = expenses.some((e) => e.category === "Transport");

  return (
    <>
      <table className="table table-bordered mb-3 align-middle">
        <thead className="table-light">
          <tr>
            <th>Receipt</th>
            <th>Category</th>
            <th>Amount (KES)</th>
            {showMileageColumn && <th>Mileage</th>}
            <th>Cost Center</th>
            <th>Deliverer</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={idx}>
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
              <td>
                <select
                  className="form-select"
                  value={exp.category}
                  onChange={(e) =>
                    handleChange(idx, "category", e.target.value)
                  }
                >
                  <option value="">-- Select --</option>
                  <option>Transport</option>
                  <option>Accommodation</option>
                  <option>Meals</option>
                  <option>Stationery</option>
                  <option>Others</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={exp.amount}
                  onChange={(e) =>
                    handleChange(idx, "amount", Number(e.target.value))
                  }
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
                  />
                </td>
              )}
              <td>
                <select
                  className="form-select"
                  value={exp.costCenter}
                  onChange={(e) =>
                    handleChange(idx, "costCenter", e.target.value)
                  }
                >
                  {/* ICT is default */}
                  <option value="ICT">ICT</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Programs">Programs</option>
                </select>
              </td>
              <td>
                <select
                  className="form-select"
                  value={exp.deliverer}
                  onChange={(e) =>
                    handleChange(idx, "deliverer", e.target.value)
                  }
                >
                  {USER_LIST.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
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

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          onClick={addExpenseLine}
        >
          + Add Expense Line
        </button>
        <div className="fw-semibold text-end">
          Justified:{" "}
          <span className="text-success">
            KES {totalJustified.toLocaleString()}
          </span>
          <br />
          Remaining Balance:{" "}
          <span className="text-danger">
            KES {(balance - totalJustified).toLocaleString()}
          </span>
        </div>
      </div>
    </>
  );
}

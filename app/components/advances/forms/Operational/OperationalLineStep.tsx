"use client";

import React from "react";
import { Check, Undo2, Save, Trash2, Plus, ArrowUp } from "lucide-react";
import { ExpenseItem } from "@/app/types/advance";
import { useMySetups } from "@/app/context/SetupContext";
import { findObjectFromArray } from "@/app/utils/helpers";

interface OperationalLineStepProps {
  expenses: ExpenseItem[];
  onExpenseChange: <K extends keyof ExpenseItem>(
    index: number,
    field: K,
    value: ExpenseItem[K]
  ) => void;
  onFileChange: (index: number, file: File | null) => void;
  onRemoveExpense: (index: number) => void;
  onAddExpense: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onSurrender: () => void;
  onSaveLine?: (index: number, item: ExpenseItem) => void;
  currency: string,
}

export default function OperationalLineStep({
  expenses,
  onExpenseChange,
  onRemoveExpense,
  onAddExpense,
  onSubmit,
  onCancel,
  onSurrender,
  onSaveLine,
  currency,
}: OperationalLineStepProps) {
  const { expenseCodes, currencies } = useMySetups();
  const showMileageColumn = expenses.some((e) => e.category === "Transport");

  const selectedCurrency = findObjectFromArray(currencies, 'code', currency)?.description as string;

  return (
    <>
      <div className="card mb-4">
        <div
          className="card-header bg-light d-flex justify-content-between align-items-center"
          style={{ background: "#f43434" }}
        >
          <h5 className="mb-0 text-dark">Step 2: Expense Details</h5>
          <button
            type="button"
            className="btn btn-success d-flex align-items-center gap-1"
            onClick={onAddExpense}
          >
            <Plus size={16} />
            Add Expense Line
          </button>
        </div>
        <div className="card-body">
          <table className="table table-bordered mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Category</th>
                <th>Amount ({selectedCurrency})</th>
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
                        onExpenseChange(idx, "category", e.target.value);
                      }}
                    >
                      <option defaultValue="-- Select Category--">-- Select Category --</option>
                      {
                        expenseCodes.map((expenseCode: Record<string, any>) => {
                          return (
                            <option key={expenseCode.code} value={expenseCode.code}> {expenseCode.description}</option>
                          )
                        })
                      }
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={isNaN(exp.amount) ? "" : exp.amount}
                      onChange={(e) =>
                        onExpenseChange(idx, "amount", Number(e.target.value))
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
                          onExpenseChange(idx, "mileage", e.target.value)
                        }
                        placeholder="Mileage"
                      />
                    </td>
                  )}
                  <td>
                    <select
                      className="form-select"
                      value={exp.costCenter}
                      onChange={(e) =>
                        onExpenseChange(idx, "costCenter", e.target.value)
                      }
                    >
                      <option value="">-- Select Cost Center --</option>
                      <option value="ICT">ICT</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Programs">Programs</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={exp.project}
                      onChange={(e) =>
                        onExpenseChange(idx, "project", e.target.value)
                      }
                    >
                      <option value="">-- Select Project --</option>
                      {exp.costCenter === "ICT" && (
                        <>
                          <option value="Network Upgrade">
                            Network Upgrade
                          </option>
                          <option value="Helpdesk Support">
                            Helpdesk Support
                          </option>
                          <option value="Software Projects">
                            Software Projects
                          </option>
                        </>
                      )}
                      {exp.costCenter === "Finance" && (
                        <>
                          <option value="Audit">Audit</option>
                          <option value="Budget Planning">
                            Budget Planning
                          </option>
                        </>
                      )}
                      {exp.costCenter === "HR" && (
                        <>
                          <option value="Recruitment">Recruitment</option>
                          <option value="Training Programs">
                            Training Programs
                          </option>
                        </>
                      )}
                      {exp.costCenter === "Programs" && (
                        <>
                          <option value="Water Sanitation">
                            Water Sanitation
                          </option>
                          <option value="Food Relief">Food Relief</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td className="text-center d-flex gap-1 justify-content-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() => onSaveLine?.(idx, exp)}
                    >
                      <Save size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onRemoveExpense(idx)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row mb-4">
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary  d-flex align-items-center gap-2"
            onClick={onCancel}
          >
            <ArrowUp size={16} />
            Previous Step
          </button>
          <button
            type="button"
            className="btn btn-success  d-flex align-items-center gap-2"
            onClick={onSubmit}
          >
            <Check size={16} />
            Submit Advance
          </button>

          <button
            type="button"
            className="btn btn-outline-warning  d-flex align-items-center gap-2"
            onClick={onSurrender}
          >
            <Undo2 size={16} />
            Surrender Advance
          </button>
        </div>
      </div>
    </>
  );
}

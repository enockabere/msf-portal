"use client";

import React, { useState } from "react";
import {
  FileText,
  LogOut,
  CheckCircle,
  CircleXIcon,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
} from "lucide-react";
import SettlementExpenseForm from "./SettlementExpenseForm";

type ExpenseItem = {
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
};

const totalAdvanceAmount = 58300;

const RECIPIENTS = [
  "John Doe",
  "Jane Smith",
  "Michael Johnson",
  "Sarah Williams",
  "David Brown",
];

export default function AdvanceSettlementForm() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      category: "",
      amount: 0,
      receipt: null,
      mileage: "",
      costCenter: "",
    },
  ]);

  const [claimOverspent, setClaimOverspent] = useState<string>("Yes");
  const [returnAdvanceBalance, setReturnAdvanceBalance] =
    useState<string>("No");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedDeliverer, setSelectedDeliverer] = useState<string>("");

  const totalJustified = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balanceToBeAccounted = totalAdvanceAmount - totalJustified;

  const overspent = balanceToBeAccounted < 0;
  const fullyAccounted = balanceToBeAccounted === 0;
  const underspent = balanceToBeAccounted > 0;

  return (
    <form className="p-2 pt-3">
      {/* Alert Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          {/* Summary Section */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Amount Advanced</span>
                  <ArrowUp size={16} className="text-success" />
                </div>
                <h5 className="mt-2 mb-0 text-success fw-bold">
                  KES {totalAdvanceAmount.toLocaleString()}
                </h5>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Amount Justified</span>
                  <ArrowDown size={16} className="text-primary" />
                </div>
                <h5 className="mt-2 mb-0 text-primary fw-bold">
                  KES {totalJustified.toLocaleString()}
                </h5>
              </div>
            </div>
          </div>
          <div
            className={`toast d-flex align-items-center w-100 text-white border-0 show ${
              overspent
                ? "bg-danger"
                : fullyAccounted
                ? "bg-success"
                : "bg-warning"
            }`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-body d-flex align-items-center gap-2">
              {overspent ? (
                <>
                  <AlertTriangle size={20} />
                  <div>
                    <strong>Claim:</strong>{" "}
                    <strong>
                      KES {Math.abs(balanceToBeAccounted).toLocaleString()}
                    </strong>{" "}
                    overspent amount
                  </div>
                </>
              ) : fullyAccounted ? (
                <>
                  <Check size={20} />
                  <div>
                    <strong>Perfect!</strong> Advance fully accounted for.
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle size={20} />
                  <div>
                    <strong>Surrender:</strong> Remaining balance of{" "}
                    <strong>KES {balanceToBeAccounted.toLocaleString()}</strong>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white ms-auto me-2"
              aria-label="Close"
              onClick={() => {}}
            ></button>
          </div>
          {overspent && (
            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Claim Overspent Amount?
                </label>
                <select
                  className="form-select"
                  value={claimOverspent}
                  onChange={(e) => setClaimOverspent(e.target.value)}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No, Convert to a donation</option>
                </select>
              </div>

              {claimOverspent === "Yes" && (
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Give the money to:
                  </label>
                  <select
                    className="form-select"
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                  >
                    <option value="">-- Select Recipient --</option>
                    {RECIPIENTS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {underspent && (
            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Return Advance Balance?
                </label>
                <select
                  className="form-select"
                  value={returnAdvanceBalance}
                  onChange={(e) => setReturnAdvanceBalance(e.target.value)}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {returnAdvanceBalance === "Yes" && (
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Deliverer to Return Balance
                  </label>
                  <select
                    className="form-select"
                    value={selectedDeliverer}
                    onChange={(e) => setSelectedDeliverer(e.target.value)}
                  >
                    <option value="">-- Select Deliverer --</option>
                    {RECIPIENTS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {fullyAccounted && (
            <div className="row mt-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Deliverer of Settlement
                </label>
                <select
                  className="form-select"
                  value={selectedDeliverer}
                  onChange={(e) => setSelectedDeliverer(e.target.value)}
                >
                  <option value="">-- Select Deliverer --</option>
                  {RECIPIENTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      <SettlementExpenseForm
        expenses={expenses}
        setExpenses={setExpenses}
        balance={totalAdvanceAmount}
      />
      <div className="mt-4 d-flex flex-wrap gap-2">
        <button
          type="submit"
          className="btn btn-success d-flex align-items-center gap-2"
        >
          <CheckCircle size={16} /> Submit Settlement
        </button>

        <button
          type="button"
          className="btn btn-danger d-flex align-items-center gap-2"
        >
          <CircleXIcon size={16} /> Cancel
        </button>

        <button
          type="button"
          className="btn btn-outline-primary d-flex align-items-center gap-2"
        >
          <FileText size={16} /> Preview Report
        </button>

        <button
          type="button"
          className="btn btn-secondary d-flex align-items-center gap-2"
        >
          <LogOut size={16} /> Exit
        </button>
      </div>
    </form>
  );
}

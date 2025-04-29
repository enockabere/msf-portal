"use client";

import React, { useState, useEffect } from "react";
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

export type ExpenseItem = {
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
  project: string;
  surrenderedAmount?: number;
};

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
      category: "Accommodation",
      amount: 0,
      receipt: null,
      mileage: "",
      costCenter: "Finance",
      project: "Audit",
    },
    {
      category: "Meals",
      amount: 0,
      receipt: null,
      mileage: "",
      costCenter: "HR",
      project: "Training Programs",
    },
  ]);

  const [selectedAdvance, setSelectedAdvance] = useState<number | null>(null);
  const [claimOverspent, setClaimOverspent] = useState<string>("Yes");
  const [returnAdvanceBalance, setReturnAdvanceBalance] =
    useState<string>("No");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedDeliverer, setSelectedDeliverer] = useState<string>("");

  const totalJustified = expenses.reduce(
    (sum, item) => sum + (item.surrenderedAmount ?? 0),
    0
  );
  const totalAdvanceAmount = selectedAdvance || 0;
  const balanceToBeAccounted = totalAdvanceAmount - totalJustified;

  const overspent = balanceToBeAccounted < 0;
  const fullyAccounted = balanceToBeAccounted === 0;
  const underspent = balanceToBeAccounted > 0;
  const hasStartedJustifying = expenses.some(
    (item) => item.surrenderedAmount && item.surrenderedAmount > 0
  );

  return (
    <form className="p-2 pt-3">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <label className="form-label fw-medium">
            Select Advance to Settle
          </label>
          <select
            className="form-select"
            value={selectedAdvance || ""}
            onChange={(e) => setSelectedAdvance(Number(e.target.value))}
          >
            <option value="">-- Choose Advance --</option>
            <option value="58300">Operational Advance - KES 58,300</option>
            <option value="45000">Travel Advance - KES 45,000</option>
            <option value="12000">Fuel Advance - KES 12,000</option>
          </select>
        </div>
      </div>

      {selectedAdvance && (
        <>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
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

              {hasStartedJustifying && (
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
                            KES{" "}
                            {Math.abs(balanceToBeAccounted).toLocaleString()}
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
                          <strong>
                            KES {balanceToBeAccounted.toLocaleString()}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-auto me-2"
                    aria-label="Close"
                  ></button>
                </div>
              )}
            </div>
          </div>

          <SettlementExpenseForm
            expenses={expenses}
            setExpenses={setExpenses}
            balance={totalAdvanceAmount}
          />
        </>
      )}
    </form>
  );
}

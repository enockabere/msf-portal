"use client";

import React, { useState, useEffect } from "react";
import AdvanceSettlementHeaderStep from "./Settlement/AdvanceSettlementHeaderStep";
import SettlementExpenseForm from "./SettlementExpenseForm";
import ProgressIndicator from "./Operational/ProgressIndicator";
import { ExpenseItem } from "@/app/types/advance";
import { AlertTriangle, ArrowDown, ArrowUp, Check } from "lucide-react";

interface Props {
  advanceNo?: string | null;
}

export default function AdvanceSettlementForm({ advanceNo }: Props) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string>("");
  const [totalAdvanceAmount, setSelectedAmount] = useState<number>(0);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [claimOverspent, setClaimOverspent] = useState<string>("No");
  const [returnAdvanceBalance, setReturnAdvanceBalance] =
    useState<string>("No");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedDeliverer, setSelectedDeliverer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSurrendered = expenses.reduce(
    (sum, item) => sum + (item.surrenderedAmount || 0),
    0
  );

  const balanceToBeAccounted = totalAdvanceAmount - totalSurrendered;
  const overspent = totalSurrendered > totalAdvanceAmount;
  const fullyAccounted = totalSurrendered === totalAdvanceAmount;
  const underspent = totalSurrendered < totalAdvanceAmount;

  useEffect(() => {
    if (advanceNo) {
      // Load advance data using advanceNo
    } else {
      // Setup blank form
    }
  }, [advanceNo]);

  useEffect(() => {
    if (totalSurrendered > 0 && underspent) {
      setReturnAdvanceBalance("Yes");
    } else {
      setReturnAdvanceBalance("No");
    }

    if (overspent) {
      setClaimOverspent("Yes");
    } else {
      setClaimOverspent("No");
    }
  }, [totalSurrendered, overspent, underspent]);

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row flex-grow-1">
        <div className="col-md-9">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary-subtle">
              <h5 className="mb-0 fw-semibold text-dark">
                {currentStep === 1
                  ? "Step 1: Select Advance To Settle"
                  : "Step 2: Add Expense Lines"}
              </h5>
            </div>
            <div className="card-body">
              {currentStep === 1 ? (
                <AdvanceSettlementHeaderStep
                  selectedAdvanceId={selectedAdvanceId}
                  setSelectedAdvanceId={setSelectedAdvanceId}
                  setSelectedAmount={setSelectedAmount}
                  advanceNo={advanceNo}
                />
              ) : (
                <>
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
                          KES {totalSurrendered.toLocaleString()}
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
                            overspent
                          </div>
                        </>
                      ) : fullyAccounted ? (
                        <>
                          <Check size={20} />
                          <div>
                            <strong>Perfect!</strong> Advance fully accounted
                            for.
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
                  </div>
                  <SettlementExpenseForm
                    expenses={expenses}
                    setExpenses={setExpenses}
                  />
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
                          <option value="No">No, Convert to Donation</option>
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
                            onChange={(e) =>
                              setSelectedRecipient(e.target.value)
                            }
                          >
                            <option value="">-- Select Recipient --</option>
                            {[
                              "John Doe",
                              "Jane Smith",
                              "Michael Johnson",
                              "Sarah Williams",
                              "David Brown",
                            ].map((r) => (
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
                          onChange={(e) =>
                            setReturnAdvanceBalance(e.target.value)
                          }
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
                            onChange={(e) =>
                              setSelectedDeliverer(e.target.value)
                            }
                          >
                            <option value="">-- Select Deliverer --</option>
                            {[
                              "John Doe",
                              "Jane Smith",
                              "Michael Johnson",
                              "Sarah Williams",
                              "David Brown",
                            ].map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              <div className="d-flex justify-content-between mt-4">
                {currentStep > 1 && (
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowUp size={16} className="me-1" />
                      Back
                    </button>

                    <button
                      type="button"
                      className="btn btn-success d-flex align-items-center gap-1"
                      onClick={() => {
                        console.log("✅ Submitting settlement with data:", {
                          advanceId: selectedAdvanceId,
                          totalAdvanceAmount,
                          expenses,
                        });
                        setIsSubmitted(true);
                      }}
                    >
                      <Check size={16} />
                      Submit Settlement
                    </button>
                  </div>
                )}

                {currentStep === 1 && (
                  <button
                    type="button"
                    className="btn btn-primary ms-auto"
                    disabled={!selectedAdvanceId}
                    onClick={() => {
                      if (expenses.length === 0) {
                        setExpenses([
                          {
                            expenseCode: "Accommodation",
                            unitCost: totalAdvanceAmount,
                            receipt: null,
                            mileage: "",
                            costCenter: "ICT",
                            project: "Project A",
                            surrenderedAmount: undefined,
                          },
                        ]);
                      }
                      setCurrentStep(2);
                    }}
                  >
                    <ArrowDown size={16} className="me-1" />
                    Save & Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <ProgressIndicator
            currentStep={currentStep}
            isSubmitted={isSubmitted}
          />
        </div>
      </div>
      <div className="d-flex justify-content-center gap-2 mb-4">
        {[1, 2].map((step) => (
          <div
            key={step}
            className={`rounded-circle ${
              currentStep === step ? "bg-danger" : "bg-secondary"
            }`}
            style={{
              width: "10px",
              height: "10px",
              opacity: currentStep === step ? 1 : 0.5,
              transition: "all 0.3s ease",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

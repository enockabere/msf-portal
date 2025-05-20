"use client";

import React, { useState, useEffect } from "react";
import AdvanceSettlementHeaderStep from "./Settlement/AdvanceSettlementHeaderStep";
import SettlementExpenseForm from "./SettlementExpenseForm";
import ProgressIndicator from "./Operational/ProgressIndicator";
import { ExpenseItem } from "@/app/types/advance";
import { AlertTriangle, ArrowDown, ArrowUp, Check } from "lucide-react";
import { useAdvance } from "@/app/context/AdvanceContext";
import { findObjectFromArray } from "@/app/utils/helpers";
import { useMySetups } from "@/app/context/SetupContext";

export default function AdvanceSettlement() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string>("");
  const [claimOverspent, setClaimOverspent] = useState<string>("No");
  const [returnAdvanceBalance, setReturnAdvanceBalance] =
    useState<string>("No");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedDeliverer, setSelectedDeliverer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { advanceLineSelectedForAccounting } = useAdvance();

  const { expenses, formData } = useAdvance();
  const { currencies, fetchSetups, userProfiles } = useMySetups();

  const totalSurrendered = expenses.reduce(
    (sum, item) => sum + (item?.accountedAmount || 0),
    0
  );

  const totalBalanceAmount = expenses.reduce((sum, item) => sum + item?.balance, 0);
  const overspent = 0 > totalBalanceAmount;
  const fullyAccounted = totalBalanceAmount === 0;
  const underspent = 0 < totalBalanceAmount;

  useEffect(() => {
    if (totalBalanceAmount > 0) {
      setReturnAdvanceBalance("Yes");
    } else {
      setReturnAdvanceBalance("No");
    }

    if (overspent) {
      setClaimOverspent("Yes");
    } else {
      setClaimOverspent("No");
    }
  }, [totalBalanceAmount, overspent]);

  useEffect(() => {
    fetchSetups([
      'userProfiles'
    ]);
  }, [totalBalanceAmount, overspent]);

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row flex-grow-1">
        <div className="col-md-9">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary-subtle">
              <h5 className="mb-0 fw-semibold text-dark">
                Advance Settlement
              </h5>
            </div>
            <div className="card-body">
              <>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Amount Advanced</span>
                        <ArrowUp size={16} className="text-success" />
                      </div>
                      <h5 className="mt-2 mb-0 text-success fw-bold">
                        {findObjectFromArray(currencies, 'code', formData?.currencyCode)?.description as string || 'KES'} {formData?.amountToPayHeader}
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
                        {findObjectFromArray(currencies, 'code', formData?.currencyCode)?.description as string || 'KES'} {totalSurrendered.toLocaleString()}
                      </h5>
                    </div>
                  </div>
                </div>
                <div
                  className={`toast d-flex align-items-center w-100 text-white border-0 show ${overspent
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
                            {findObjectFromArray(currencies, 'code', formData?.currencyCode)?.description as string || 'KES'}
                            {" "}
                            {Math.abs(totalBalanceAmount).toLocaleString()}
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
                            {findObjectFromArray(currencies, 'code', formData?.currencyCode)?.description as string || 'KES'}
                            {" "}
                            {totalBalanceAmount.toLocaleString()}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <SettlementExpenseForm
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
                          <option defaultValue="">-- Select Recipient --</option>
                          {
                            userProfiles?.map((profile: Record<string, any>) => (
                              <option key={profile?.no} value={profile?.no}>
                                {`${profile?.firstName} ${profile?.secondName} ${profile?.lastName}`}
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
                          <option defaultValue="">-- Select Deliverer --</option>
                          {
                            userProfiles?.map((profile: Record<string, any>) => (
                              <option key={profile?.no} value={profile?.no}>
                                {`${profile?.firstName} ${profile?.secondName} ${profile?.lastName}`}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </>
              <div className="d-flex justify-content-between mt-4">
                <div className="d-flex gap-2">

                  <button
                    type="button"
                    className="btn btn-success d-flex align-items-center gap-1"
                    onClick={() => {
                      console.log("✅ Submitting settlement with data:", {
                        advanceId: selectedAdvanceId,
                        expenses,
                      });
                      setIsSubmitted(true);
                    }}
                  >
                    <Check size={16} />
                    Send Settlement For Approval
                  </button>
                </div>
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
            className={`rounded-circle ${currentStep === step ? "bg-danger" : "bg-secondary"
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

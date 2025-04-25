"use client";

import React, { useState } from "react";
import { CheckCircle, CircleXIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

interface ActionButtonsProps {
  isSubmitting: boolean;
  isLoading?: boolean;
  isViewMode?: boolean;
  status: string;
  advanceNo?: string;
  onSuccess?: () => void;
  cutoffPassed?: boolean;
  limitExceeded?: boolean;
}

export default function ActionButtons({
  isSubmitting,
  isLoading = false,
  isViewMode = false,
  status = "",
  advanceNo,
  onSuccess,
  cutoffPassed = false,
  limitExceeded = false,
}: ActionButtonsProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelForApproval = async () => {
    if (!advanceNo) {
      toast.error("Missing advance number.");
      return;
    }

    setIsCancelling(true);

    try {
      const res = await fetch(
        "/api/bc/advances/salary/cancelApproval",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ advanceNo }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error?.message || "Failed to cancel for approval.");
      } else {
        toast.success("Cancelled for approval successfully.");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Cancel approval error:", error);
      toast.error("Something went wrong during cancellation.");
    } finally {
      setIsCancelling(false);
    }
  };

  const submissionDisabled =
    isSubmitting || isLoading || isViewMode || cutoffPassed || limitExceeded;

  const disabledReason = () => {
    if (cutoffPassed)
      return "⚠️ Submission is disabled — the advance cutoff date has passed.";
    if (limitExceeded)
      return "⚠️ Submission is disabled — the requested amount exceeds your limit.";
    if (isViewMode)
      return "⚠️ Submission is disabled — the form is in view-only mode.";
    return "";
  };

  return (
    <div className="mt-3 d-flex flex-column gap-2">
      <ToastContainer position="top-right" autoClose={5000} />
      {(!status || status === "Open") && (
        <>
          <button
            type="submit"
            className="btn btn-danger d-flex align-items-center gap-2"
            disabled={submissionDisabled}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  style={{ width: "0.8rem", height: "0.8rem" }}
                />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={13} />
                {advanceNo
                  ? "Edit & Submit for Approval"
                  : "Save & Submit for Approval"}
              </>
            )}
          </button>

          {!isLoading && submissionDisabled && (
            <div className="text-warning small mt-1">{disabledReason()}</div>
          )}
        </>
      )}

      {status === "Pending Approval" && (
        <button
          type="button"
          className="btn btn-danger d-flex align-items-center gap-2"
          disabled={isCancelling || isViewMode}
          onClick={handleCancelForApproval}
        >
          {isCancelling ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                style={{ width: "0.8rem", height: "0.8rem" }}
              />
              Cancelling...
            </>
          ) : (
            <>
              <CircleXIcon size={16} />
              Cancel Approval
            </>
          )}
        </button>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { CheckCircle, CircleXIcon } from "lucide-react";
import Swal from "sweetalert2";

interface ActionButtonsProps {
  isSubmitting: boolean;
  isLoading?: boolean;
  isViewMode?: boolean;
  status: string;
  advanceNo?: string;
  onSuccess?: () => void;
  cutoffPassed?: boolean;
  limitExceeded?: boolean;
  employeeNo?: string;
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
  employeeNo,
}: ActionButtonsProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelForApproval = async () => {
    if (!advanceNo) {
      Swal.fire("Error", "Missing advance number.", "error");
      return;
    }

    setIsCancelling(true);

    try {
      const res = await fetch("/api/bc/advances/salary/cancelApproval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ advanceNo }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        await Swal.fire(
          "Error",
          data.error?.message || "Failed to cancel approval.",
          "error"
        );
      } else {
        await fetch(`/api/clearCache?employeeNo=${employeeNo}`, {
          method: "POST",
        });
        await Swal.fire(
          "Success",
          "Cancelled approval successfully!",
          "success"
        );
        onSuccess?.();
      }
    } catch (error) {
      console.error("Cancel approval error:", error);
      await Swal.fire(
        "Error",
        "Something went wrong during cancellation.",
        "error"
      );
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
      {(!status || status === "Open") && (
        <>
          <button
            type="submit"
            className="btn btn-danger d-flex justify-content-center align-items-center gap-2"
            disabled={submissionDisabled}
            style={{ height: "45px" }}
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
                <CheckCircle size={16} />
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
          className="btn btn-danger d-flex justify-content-center align-items-center gap-2"
          disabled={isCancelling || isViewMode}
          onClick={handleCancelForApproval}
          style={{ height: "45px" }}
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

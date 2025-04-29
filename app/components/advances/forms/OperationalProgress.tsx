"use client";

import { FilePlus, Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { SalaryAdvanceData } from "@/app/types/advance";
import "./VerticalProgressCard.css";
import SimpleBar from "simplebar-react";

interface ApprovalEntry {
  sendByName: string;
  approverID: string;
  approveForName: string;
  dateTimeSentForApproval: string;
  lastDateTimeModified: string;
  status: string;
  ageing: string;
  approvalComments?: { comment: string }[];
}

interface OperationalProgressProps {
  advance?: SalaryAdvanceData | null;
}

export default function OperationalProgress({
  advance,
}: OperationalProgressProps) {
  const [applicationDate, setApplicationDate] = useState<string>("");
  const [approvalEntries, setApprovalEntries] = useState<ApprovalEntry[]>([]);

  const isNew = !advance;
  const isPending = advance?.status === "Pending Approval";
  const isReleased = advance?.status === "Released";
  const [showCommentsToast, setShowCommentsToast] = useState(true);

  useEffect(() => {
    if (advance?.applicationDate) {
      setApplicationDate(
        dayjs(advance.applicationDate).format("D MMMM YYYY, hh:mm A")
      );
    } else {
      setApplicationDate(dayjs().format("D MMMM YYYY, hh:mm A"));
    }
  }, [advance]);

  useEffect(() => {
    const fetchApprovals = async () => {
      if (
        advance?.status === "Pending Approval" ||
        advance?.status === "Released"
      ) {
        const start = performance.now(); // ⏱️ Start timer

        try {
          const res = await fetch(
            `/api/bc/advances/salary/approvals?documentNo=${advance.no}`
          );
          const json = await res.json();
          const entries = json?.data?.value || [];
          console.log("📥 Approval entries fetched:", entries);
          setApprovalEntries(entries);
        } catch (error) {
          console.error("❌ Failed to fetch approval entries:", error);
        } finally {
          const end = performance.now(); // ⏱️ End timer
          console.log(
            `⏳ Fetch approvalEntries took ${(end - start).toFixed(2)} ms`
          );
        }
      }
    };
    fetchApprovals();
  }, [advance]);

  const allApprovalComments = useMemo(() => {
    let comments: string[] = [];

    approvalEntries.forEach((entry) => {
      if (entry.approvalComments && entry.approvalComments.length > 0) {
        entry.approvalComments.forEach((c) => {
          if (c.comment) comments.push(c.comment);
        });
      }
    });

    return comments;
  }, [approvalEntries]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Open":
        return "text-info";
      case "Approved":
        return "text-success";
      case "Canceled":
        return "text-danger";
      default:
        return "text-muted";
    }
  };

  const formatAgeing = (ageingStr: string | undefined) => {
    if (!ageingStr) return null;

    const match = ageingStr.match(/P(\d+)D(?:T(\d+)H(\d+)M([\d.]+)S)?/);
    if (!match) return null;

    const days = Number(match[1] || 0);
    const hours = Number(match[2] || 0);
    const minutes = Number(match[3] || 0);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(" ") + " ago" : "Just now";
  };

  const ageingDuration = useMemo(() => {
    if (approvalEntries.length > 0) {
      const openEntry = approvalEntries.find(
        (entry) => entry.status === "Open"
      );
      if (openEntry && openEntry.ageing) {
        return formatAgeing(openEntry.ageing);
      }
    }
    return null;
  }, [approvalEntries]);

  const approvalNote = () => {
    if (isNew) {
      return "Remember to Save and Submit your request once you fill the form. Advances exceeding your limit won't be saved or submitted.";
    } else if (isPending && approvalEntries.length > 0) {
      return (
        <ul className="mb-0 ps-3">
          {approvalEntries.map((entry, index) => (
            <li key={index}>
              <strong>{entry.approveForName}</strong> -{" "}
              <span className={getStatusClass(entry.status)}>
                {entry.status}
              </span>
            </li>
          ))}
        </ul>
      );
    } else if (isReleased) {
      return `Advance of ${advance?.applicationAmount} ${advance?.currencyCode} submitted on ${applicationDate} was approved and released.`;
    } else {
      return `Advance request of ${advance?.applicationAmount} ${advance?.currencyCode} using ${advance?.paymentMethod} for ${advance?.employeeName} is open but not yet submitted.`;
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary-subtle">
        <h4 className="card-title fw-semibold mb-0 text-dark">
          Salary Advance Progress
        </h4>
      </div>

      <div className="card-body bg-primary-subtle pt-0">
        <SimpleBar style={{ maxHeight: 500 }}>
          <div className="vertical-stepper">
            <div className="step">
              <div className="step-line completed"></div>
              <div className="step-content d-flex align-items-center">
                <div className="step-icon-lg bg-success text-white">
                  <FilePlus size={20} />
                </div>
                <div className="ms-3">
                  <h6 className="mb-1">Open Application</h6>
                  <p className="text-muted fs-12 mb-0">{applicationDate}</p>
                </div>
              </div>
            </div>

            <div className="step">
              <div
                className={`step-line ${
                  isNew
                    ? "muted"
                    : isPending
                    ? "active"
                    : isReleased
                    ? "completed"
                    : "muted"
                }`}
              ></div>
              <div className="step-content d-flex align-items-center">
                <div
                  className={`step-icon-lg ${
                    isPending
                      ? "bg-success-subtle text-success"
                      : isReleased
                      ? "bg-success text-white"
                      : "bg-secondary-subtle text-muted"
                  }`}
                >
                  <Clock size={20} />
                </div>
                <div className="ms-3">
                  <h6
                    className={`mb-1 ${
                      isPending || isReleased ? "text-success" : "text-muted"
                    }`}
                  >
                    Pending Approval
                  </h6>
                  <p className="text-muted fs-12 mb-0">
                    {isPending && ageingDuration ? ageingDuration : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="step">
              <div
                className={`step-line ${isReleased ? "completed" : "muted"}`}
              ></div>
              <div className="step-content d-flex align-items-center">
                <div
                  className={`step-icon-lg ${
                    isReleased ? "bg-success text-white" : "bg-light text-muted"
                  }`}
                >
                  <CheckCircle2 size={20} />
                </div>
                <div className="ms-3">
                  <h6
                    className={`mb-1 ${
                      isReleased ? "text-success" : "text-muted"
                    }`}
                  >
                    Approved
                  </h6>
                  <p className="text-muted fs-12 mb-0">
                    {isReleased && approvalEntries.length > 0
                      ? dayjs(approvalEntries[0]?.lastDateTimeModified).format(
                          "D MMMM YYYY, hh:mm A"
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary-subtle p-2 border-dashed border-primary rounded mt-4">
            <span className="text-primary fw-semibold">Note:</span>
            <div className="text-primary mt-1">{approvalNote()}</div>
          </div>
          {allApprovalComments.length > 0 && showCommentsToast && (
            <div
              className="toast d-flex align-items-center w-100 text-white border-0 show bg-info mt-3"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="toast-body d-flex flex-column gap-2">
                {allApprovalComments.map((comment, index) => (
                  <div key={index} className="d-flex align-items-center gap-2">
                    <FilePlus size={16} />
                    <span>{comment}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white ms-auto me-2"
                aria-label="Close"
                onClick={() => setShowCommentsToast(false)}
              ></button>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
}

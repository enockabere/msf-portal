"use client";

import { FilePlus, Clock, User, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { SalaryAdvanceData } from "@/app/types/advance";
import "./VerticalProgressCard.css";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

interface ApprovalEntry {
  sendByName: string;
  approverName: string;
  approveForName: string;
  dateTimeSentForApproval: string;
  lastDateTimeModified: string;
  status: string;
  ageing: string;
  approvalComments?: { comment: string }[];
  sequenceNo?: number;
}

interface VerticalProgressCardProps {
  advance?: SalaryAdvanceData | null;
}

export default function VerticalProgressCard({
  advance,
}: VerticalProgressCardProps) {
  const [applicationDate, setApplicationDate] = useState<string>("");
  const [approvalEntries, setApprovalEntries] = useState<ApprovalEntry[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);

  const isNew = !advance;

  useEffect(() => {
    setApplicationDate(
      advance?.applicationDate
        ? dayjs(advance.applicationDate).format("D MMM YYYY, hh:mm A")
        : dayjs().format("D MMM YYYY, hh:mm A")
    );
  }, [advance]);

  useEffect(() => {
    const fetchApprovals = async () => {
      if (advance?.no) {
        setIsLoadingApprovals(true);
        try {
          const res = await fetch(
            `/api/bc/advances/salary/approvals?documentNo=${advance.no}`
          );
          const json = await res.json();
          const sorted = (json?.data?.value || []).sort(
            (a: ApprovalEntry, b: ApprovalEntry) =>
              (a.sequenceNo || 0) - (b.sequenceNo || 0)
          );
          setApprovalEntries(sorted);
        } catch (err) {
          console.error("❌ Error fetching approvals", err);
          setApprovalEntries([]);
        } finally {
          setIsLoadingApprovals(false);
        }
      }
    };
    fetchApprovals();
  }, [advance]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-success";
      case "Canceled":
        return "text-danger";
      case "Open":
        return "text-warning";
      default:
        return "text-muted";
    }
  };

  const formatAgeing = (ageingStr: string | undefined) => {
    const match = ageingStr?.match(/P(\d+)D(?:T(\d+)H(\d+)M)?/);
    if (!match) return null;
    const [, days, hours, minutes] = match;
    return `${days ? `${days}d ` : ""}${hours ? `${hours}h ` : ""}${
      minutes ? `${minutes}m` : ""
    }`.trim();
  };

  const currentApprover = approvalEntries.find((e) => e.status === "Open");

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-primary-subtle">
        <h4 className="card-title fw-semibold mb-0 text-dark">
          {approvalEntries.length > 0
            ? "Advance Approvers"
            : "Application Progress"}
        </h4>
      </div>

      <div className="card-body bg-primary-subtle pt-0">
        {/* Current Approver Section */}
        {approvalEntries.length > 0 && currentApprover && (
          <div className="p-3 border rounded bg-light mb-3">
            <h6 className="text-primary mb-1">Current Approver</h6>
            <div className="d-flex justify-content-between align-items-center">
              <span>{currentApprover.approverName}</span>
              <span className="badge bg-warning text-dark">Open</span>
            </div>
          </div>
        )}

        <SimpleBar
          style={{ maxHeight: 360, paddingRight: "8px" }}
          autoHide={false}
          scrollbarMaxSize={28}
          forceVisible="y"
        >
          <div className="vertical-stepper pe-2">
            {isLoadingApprovals ? (
              // Skeleton loader streaming layout
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="step mb-3 d-flex gap-3 align-items-start"
                >
                  <div className="step-icon-lg bg-secondary-subtle skeleton rounded-circle"></div>
                  <div className="flex-grow-1">
                    <div
                      className="skeleton w-50 mb-2 rounded"
                      style={{ height: "14px" }}
                    ></div>
                    <div
                      className="skeleton w-75 mb-2 rounded"
                      style={{ height: "12px" }}
                    ></div>
                    <div
                      className="skeleton w-100 rounded"
                      style={{ height: "10px" }}
                    ></div>
                  </div>
                </div>
              ))
            ) : approvalEntries.length > 0 ? (
              approvalEntries.map((step, i) => {
                const isApproved = step.status === "Approved";
                const isOpen = step.status === "Open";
                const isCanceled = step.status === "Canceled";

                return (
                  <div key={i} className="step">
                    <div
                      className={`step-line ${
                        isApproved ? "completed" : isOpen ? "active" : "muted"
                      }`}
                    ></div>
                    <div className="step-content d-flex">
                      <div
                        className={`step-icon-lg flex-shrink-0 mt-1 ${
                          isApproved
                            ? "bg-success text-white"
                            : isCanceled
                            ? "bg-danger text-white"
                            : isOpen
                            ? "bg-warning text-white"
                            : "bg-secondary-subtle text-muted"
                        }`}
                        title={`Status: ${step.status}`}
                      >
                        <User size={18} />
                      </div>
                      <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1 text-dark">{step.approverName}</h6>
                        <p className={`mb-0 ${getStatusColor(step.status)}`}>
                          {step.status}
                        </p>

                        {step.approvalComments?.length > 0 && (
                          <div className="p-2 mt-2 rounded bg-danger-subtle border-start border-4 border-danger comment-highlight">
                            <h6 className="text-danger d-flex align-items-center mb-2">
                              <MessageCircle size={16} className="me-2" />
                              Comment(s)
                            </h6>
                            <ul className="mb-0 ps-3 small text-dark fw-semibold">
                              {step.approvalComments.map((c, idx) => (
                                <li key={idx}>{c.comment}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-muted fs-12 mb-0">
                          {formatAgeing(step.ageing) || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="step">
                  <div className="step-line completed"></div>
                  <div className="step-content d-flex align-items-center">
                    <div className="step-icon-lg bg-success text-white">
                      <FilePlus size={18} />
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-1 text-dark">Application Created</h6>
                      <p className="text-muted fs-12 mb-0">{applicationDate}</p>
                    </div>
                  </div>
                </div>
                <div className="step">
                  <div className="step-line active"></div>
                  <div className="step-content d-flex align-items-center">
                    <div className="step-icon-lg bg-warning text-white">
                      <Clock size={18} />
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-1 text-dark">Pending Submission</h6>
                      <p className="text-muted fs-12 mb-0">Save & Submit</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </SimpleBar>

        {/* Note */}
        <div className="bg-primary-subtle p-2 border-dashed border-primary rounded mt-3">
          <span className="text-primary fw-semibold">Note:</span>
          <div className="text-primary mt-1">
            {isNew
              ? "Remember to Save and Submit your request once filled."
              : `This request was created on ${applicationDate}.`}
          </div>
        </div>
      </div>
    </div>
  );
}

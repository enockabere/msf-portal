"use client";

import { FilePlus, Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { SalaryAdvanceData } from "@/app/types/advance";
import "./VerticalProgressCard.css";

interface ApprovalEntry {
  sendByName: string;
  approverID: string;
  approveForName: string;
  dateTimeSentForApproval: string;
  status: string;
}

interface VerticalProgressCardProps {
  advance?: SalaryAdvanceData | null;
}

export default function VerticalProgressCard({
  advance,
}: VerticalProgressCardProps) {
  const [applicationDate, setApplicationDate] = useState<string>("");
  const [approvalEntries, setApprovalEntries] = useState<ApprovalEntry[]>([]);

  const isNew = !advance;
  const isPending = advance?.status === "Pending Approval";
  const isReleased = advance?.status === "Released";

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
      if (advance?.status === "Pending Approval") {
        try {
          const res = await fetch(
            `/selfservice/api/bc/advances/salary/approvals?documentNo=${advance.no}`
          );
          const json = await res.json();
          const entries = json?.data?.value || [];
          console.log("📥 Approval entries fetched:", entries);
          setApprovalEntries(entries);
        } catch (error) {
          console.error("Failed to fetch approval entries:", error);
        }
      }
    };
    fetchApprovals();
  }, [advance]);

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
    <div className="card h-100">
      <div className="card-header bg-primary-subtle">
        <h4 className="card-title fw-semibold mb-0 text-dark">
          Salary Advance Progress
        </h4>
      </div>

      <div className="card-body bg-primary-subtle pt-0">
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
                  {(isPending || isReleased) && approvalEntries.length > 0
                    ? dayjs(approvalEntries[0]?.dateTimeSentForApproval).format(
                        "D MMMM YYYY, hh:mm A"
                      )
                    : "-"}
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
                  {isReleased ? dayjs().format("D MMMM YYYY, hh:mm A") : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary-subtle p-2 border-dashed border-primary rounded mt-4">
          <span className="text-primary fw-semibold">Note:</span>
          <div className="text-primary mt-1">{approvalNote()}</div>
        </div>
      </div>
    </div>
  );
}

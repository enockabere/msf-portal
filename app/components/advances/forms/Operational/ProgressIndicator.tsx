"use client";

import React from "react";
import { FilePlus, CheckCircle2, Clock, User } from "lucide-react";
import SimpleBar from "simplebar-react";

interface ProgressIndicatorProps {
  currentStep: number;
  isSubmitted?: boolean;
}

interface ApproverStep {
  id: number;
  name: string;
  status: "Approved" | "Canceled" | "Open";
  date: string;
  icon: React.ReactNode;
}

interface FormStep {
  id: number;
  name: string;
  icon: React.ReactNode;
}

export default function ProgressIndicator({
  currentStep,
  isSubmitted = false,
}: ProgressIndicatorProps) {
  const workflowSteps: (ApproverStep | FormStep)[] = isSubmitted
    ? [
        {
          id: 1,
          name: "John Doe",
          status: "Approved",
          date: "3 days ago",
          icon: <User size={18} />,
        },
        {
          id: 2,
          name: "Jane Doe",
          status: "Canceled",
          date: "4 days ago",
          icon: <User size={18} />,
        },
        {
          id: 3,
          name: "Ann Doe",
          status: "Open",
          date: "Today",
          icon: <User size={18} />,
        },
      ]
    : [
        { id: 1, name: "Advance Request", icon: <FilePlus size={18} /> },
        { id: 2, name: "Expense Details", icon: <CheckCircle2 size={18} /> },
      ];

  const getStatusClass = (status: string) => {
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

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-primary-subtle">
        <h4 className="card-title fw-semibold mb-0 text-dark">
          {isSubmitted ? "Advance Approvers" : "Application Progress"}
        </h4>
      </div>
      <div className="card-body bg-primary-subtle pt-0">
        <div className="vertical-stepper">
          {workflowSteps.map((step) => {
            const isApproverStep = isSubmitted && "status" in step;
            const isCompleted = isApproverStep
              ? step.status === "Approved"
              : step.id < currentStep;
            const isActive = isApproverStep
              ? step.status === "Open"
              : step.id === currentStep;

            return (
              <div key={step.id} className="step">
                <div
                  className={`step-line ${
                    isCompleted ? "completed" : isActive ? "active" : "muted"
                  }`}
                ></div>
                <div className="step-content d-flex align-items-center">
                  <div
                    className={`step-icon-lg ${
                      isCompleted
                        ? "bg-success text-white"
                        : isActive
                        ? "bg-warning text-white"
                        : isApproverStep && step.status === "Canceled"
                        ? "bg-danger text-white"
                        : "bg-secondary-subtle text-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : isApproverStep && step.status === "Canceled" ? (
                      <Clock size={18} />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="ms-3">
                    <h6
                      className={`mb-1 ${
                        isCompleted || isActive || isSubmitted
                          ? "text-dark"
                          : "text-muted"
                      }`}
                    >
                      {step.name}
                    </h6>
                    {isApproverStep ? (
                      <>
                        <p className={`mb-0 ${getStatusClass(step.status)}`}>
                          {step.status}
                        </p>
                        <p className="text-muted fs-12 mb-0">{step.date}</p>
                      </>
                    ) : (
                      <p className="text-muted fs-12 mb-0">
                        {step.id < currentStep
                          ? "Completed"
                          : step.id === currentStep
                          ? "In progress"
                          : "Pending"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-primary-subtle p-2 border-dashed border-primary rounded mt-5">
          <span className="text-primary fw-semibold">Note:</span>
          <div className="text-primary mt-1">
            Ensure all required fields are filled before proceeding to the next
            step.
          </div>
        </div>
        <div
          className="toast d-flex align-items-center w-100 text-white border-0 show bg-info mt-3"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-body d-flex flex-column gap-2">
            <div className="d-flex align-items-center gap-2">
              <span>Double-check the requested amount before submitting.</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white ms-auto me-2"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}

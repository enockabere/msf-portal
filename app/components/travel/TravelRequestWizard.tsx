"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  User,
  ListChecks,
  Globe,
  Briefcase,
  FilePlus2,
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  Ticket,
  Link,
  DownloadIcon,
  FileDownIcon,
} from "lucide-react";
import "./TravelRequestWizard.css";
import TravelHeaderForm from "../advances/forms/Travel/TravelHeaderForm";
import { TravelInfo } from "@/app/types/travel";
import TravelAdvanceDetails from "./TravelAdvanceDetails";
import TravelAdvanceGLTable from "./TravelAdvanceGLTable";
import VisaApplicationForm from "@/app/components/advances/forms/Travel/VisaApplicationForm";

interface WizardStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export default function TravelRequestWizard() {
  const [activeTab, setActiveTab] = useState("info");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({
    userType: "",
    residentStatus: "",
    basedOnRequest: "Yes",
    travelRequestId: "",
    tripType: "",
    costCenter: "",
    remainingTrips: "",
    tripDates: { from: "", to: "" },
    destination: "",
    applyForOther: "No",
    recipientName: "",
    currency: "",
    paymentMethod: "",
    travelType: "",
    visaRequired: "No",
    workPermitRequired: "No",
  });

  const [submitted, setSubmitted] = useState(false);

  // Define all possible steps
  const allSteps: WizardStep[] = [
    {
      id: "info",
      icon: <User size={18} />,
      title: "Your Info",
      desc: "Basic travel details",
    },
    {
      id: "destinations",
      icon: <Globe size={18} />,
      title: "Destinations",
      desc: "Travel destination details",
    },
    {
      id: "dependencies",
      icon: <Link size={18} />,
      title: "Dependencies",
      desc: "Related travel requirements",
    },
    {
      id: "ticket",
      icon: <Ticket size={18} />,
      title: "Ticket Booking",
      desc: "Flight/train reservations",
    },
    {
      id: "checklist",
      icon: <ListChecks size={18} />,
      title: "Checklist",
      desc: "Pre-travel requirements",
    },
    {
      id: "visa",
      icon: <Globe size={18} />,
      title: "Visa Application",
      desc: "Visa documentation",
    },
    {
      id: "permit",
      icon: <FilePlus2 size={18} />,
      title: "Work Permit",
      desc: "Work authorization",
    },
    {
      id: "advance",
      icon: <Briefcase size={18} />,
      title: "Travel Advance",
      desc: "Advance request",
    },
  ];

  // Get the appropriate steps based on user type
  const getSteps = useCallback((): WizardStep[] => {
    if (travelInfo.userType === "Outbound") {
      return [
        allSteps.find((step) => step.id === "info")!,
        allSteps.find((step) => step.id === "destinations")!,
        allSteps.find((step) => step.id === "dependencies")!,
        allSteps.find((step) => step.id === "ticket")!,
        allSteps.find((step) => step.id === "checklist")!,
        allSteps.find((step) => step.id === "visa")!,
        allSteps.find((step) => step.id === "advance")!,
      ];
    } else if (travelInfo.userType === "Inbound") {
      return [
        allSteps.find((step) => step.id === "info")!,
        allSteps.find((step) => step.id === "checklist")!,
        allSteps.find((step) => step.id === "permit")!,
        allSteps.find((step) => step.id === "advance")!,
      ];
    }
    return [allSteps.find((step) => step.id === "info")!];
  }, [travelInfo.userType]);

  const handleChange = useCallback((field: keyof TravelInfo, value: any) => {
    setTravelInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleTabChange = (stepId: string) => {
    if (validateCurrentStep()) {
      setActiveTab(stepId);
      setCompletedSteps((prev) => new Set(prev).add(activeTab));
    }
  };

  const validateCurrentStep = (): boolean => {
    // Add your validation logic here
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
  };

  const currentSteps = getSteps();
  const currentStepIndex = currentSteps.findIndex((s) => s.id === activeTab);
  const progressPercentage = (completedSteps.size / currentSteps.length) * 100;

  // Work Permit form fields
  const workPermitFields = [
    { id: "country", label: "Country of Work", type: "text" },
    { id: "duration", label: "Duration (days)", type: "number" },
    { id: "documents", label: "Required Documents", type: "file" },
  ];

  // Handle the initial submission from the info step
  const handleInitialSubmit = () => {
    setCompletedSteps((prev) => new Set(prev).add("info"));
    setSubmitted(true);

    if (travelInfo.userType === "Inbound") {
      setActiveTab("checklist");
    } else if (travelInfo.userType === "Outbound") {
      setActiveTab("destinations");
    }
  };

  return (
    <div className="travel-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">Travel Request Application</h2>
        <p className="wizard-subtitle">
          Fill out your travel request in steps.
        </p>

        <div className="wizard-progress">
          <div
            className="progress-bar"
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      <div className="wizard-body">
        <nav className="wizard-sidebar" aria-label="Travel request steps">
          <ul className="step-list" role="tablist">
            {currentSteps.map((step) => (
              <li key={step.id} className="step-item">
                <button
                  className={`step-button ${
                    activeTab === step.id ? "active" : ""
                  } ${completedSteps.has(step.id) ? "completed" : ""}`}
                  onClick={() => handleTabChange(step.id)}
                  role="tab"
                  aria-selected={activeTab === step.id}
                  aria-controls={`${step.id}-panel`}
                  id={`${step.id}-tab`}
                  tabIndex={activeTab === step.id ? 0 : -1}
                >
                  <span className="step-icon-wrapper">
                    <span className="step-icon">{step.icon}</span>
                  </span>
                  <span className="step-content">
                    <span className="step-title">{step.title}</span>
                    <span className="step-desc">{step.desc}</span>
                  </span>
                  {completedSteps.has(step.id) && (
                    <span className="step-completed-badge" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="wizard-content">
          <div
            className="step-panel"
            role="tabpanel"
            aria-labelledby={`${activeTab}-tab`}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 wizard-bg-gray">
              <h4 className="step-panel-title">
                {currentSteps.find((s) => s.id === activeTab)?.title}
              </h4>

              {activeTab === "visa" && (
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mx-2 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <DownloadIcon size={16} className="button-icon" />
                    Download
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" type="button">
                        <FileDownIcon size={16} className="button-icon" />
                        Dummy ticket
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" type="button">
                        <FileDownIcon size={16} className="button-icon" />
                        Accommodation voucher
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" type="button">
                        <FileDownIcon size={16} className="button-icon" />
                        Letter of intent
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === "info" && (
                <TravelHeaderForm
                  travelInfo={travelInfo}
                  handleChange={handleChange}
                />
              )}

              {activeTab === "permit" && (
                <div className="permit-form">
                  <div className="permit-notice mb-4">
                    <p className="notice-text">
                      <strong>Note:</strong> Work permit applications typically
                      take 3-4 weeks to process. Please ensure all documents are
                      uploaded completely and accurately.
                    </p>
                  </div>

                  <div className="form-grid">
                    {workPermitFields.map((field) => (
                      <div key={field.id} className="form-group">
                        <label htmlFor={field.id}>{field.label}</label>
                        {field.type === "file" ? (
                          <input
                            type="file"
                            id={field.id}
                            className="form-control"
                            onChange={(e) =>
                              handleChange(
                                field.id as keyof TravelInfo,
                                e.target.files
                              )
                            }
                          />
                        ) : (
                          <input
                            type={field.type}
                            id={field.id}
                            className="form-control"
                            onChange={(e) =>
                              handleChange(
                                field.id as keyof TravelInfo,
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "advance" && (
                <div>
                  <TravelAdvanceDetails travelInfo={travelInfo} />
                  <TravelAdvanceGLTable
                    glLines={[
                      {
                        account: "6001",
                        description: "Flight Ticket",
                        amount: 500,
                        currency: travelInfo.currency,
                        department: "",
                        project: "",
                      },
                      {
                        account: "6002",
                        description: "Hotel",
                        amount: 300,
                        currency: travelInfo.currency,
                        department: "",
                        project: "",
                      },
                    ]}
                  />
                </div>
              )}

              {activeTab === "visa" && <VisaApplicationForm />}

              {activeTab === "checklist" && (
                <div className="mb-3">
                  <div className="bg-light-subtle p-3 rounded">
                    <p className="fw-bold mb-2">Checklist</p>
                    <ul className="mb-0">
                      {travelInfo.userType === "Inbound" ? (
                        <li>Work Permit is required for this trip.</li>
                      ) : (
                        <li>Visa is required for this trip.</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {["destinations", "dependencies", "ticket"].includes(
                activeTab
              ) && (
                <div className="step-placeholder">
                  Form fields for: <strong>{activeTab}</strong>
                </div>
              )}

              <div className="step-actions">
                {activeTab === "info" ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleInitialSubmit}
                  >
                    <Save size={16} className="button-icon" />
                    Save & Continue
                  </button>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {currentStepIndex > 0 && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleTabChange(currentSteps[currentStepIndex - 1].id)
                        }
                      >
                        <ArrowLeft size={16} className="button-icon" />
                        Previous
                      </button>
                    )}

                    {activeTab === "visa" &&
                    travelInfo.userType === "Outbound" ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setCompletedSteps((prev) =>
                            new Set(prev).add("visa")
                          );
                          setActiveTab("advance");
                        }}
                      >
                        <Check size={16} className="button-icon" />
                        Submit Travel Request
                      </button>
                    ) : activeTab === "permit" &&
                      travelInfo.userType === "Inbound" ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setCompletedSteps((prev) =>
                            new Set(prev).add("permit")
                          );
                          setActiveTab("advance");
                        }}
                      >
                        <Check size={16} className="button-icon" />
                        Submit Travel Request
                      </button>
                    ) : currentStepIndex < currentSteps.length - 1 ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          handleTabChange(currentSteps[currentStepIndex + 1].id)
                        }
                      >
                        <ArrowRight size={16} className="button-icon" />
                        Next
                      </button>
                    ) : (
                      <button type="submit" className="submit-button">
                        <Check size={16} className="button-icon" />
                        Submit Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

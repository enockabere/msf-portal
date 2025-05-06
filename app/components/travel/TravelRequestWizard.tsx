"use client";

import React, { useState } from "react";
import { User, ListChecks, Globe, Briefcase, FilePlus2 } from "lucide-react";
import "./TravelRequestWizard.css";
import TravelHeaderForm from "../advances/forms/Travel/TravelHeaderForm";
import { TravelInfo } from "@/app/types/travel";

export default function TravelRequestWizard() {
  const [activeTab, setActiveTab] = useState("info");

  const [travelInfo, setTravelInfo] = useState<TravelInfo>({
    basedOnRequest: "Yes",
    travelRequestId: "",
    tripType: "", // ← Must be "" | "Local" | "Foreign"
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

  const handleChange = (field: any, value: any) => {
    setTravelInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const steps = [
    {
      id: "info",
      icon: <User size={18} />,
      title: "Your Info",
      desc: "Basic travel details",
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

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-primary-subtle border-bottom">
        <h4 className="mb-0 text-dark">Travel Request Application</h4>
        <p className="text-muted mt-1">
          Fill out your travel request in steps.
        </p>
      </div>
      <div className="card-body">
        <div className="row gx-1">
          {/* Sidebar */}
          <div className="col-xxl-3 col-xl-4 col-12">
            <div className="nav flex-column wizard-sidebar" role="tablist">
              {steps.map((step) => (
                <button
                  key={step.id}
                  className={`nav-link text-start wizard-tab ${
                    activeTab === step.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(step.id)}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div
                      className={`wizard-icon-wrapper ${
                        activeTab === step.id ? "active" : ""
                      }`}
                    >
                      <div className="wizard-icon">{step.icon}</div>
                    </div>
                    <div>
                      <h5 className="mb-1">{step.title}</h5>
                      <p className="mb-0 small text-muted">{step.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="col-xxl-9 col-xl-8 col-12">
            <div className="tab-content p-3">
              <div className="tab-pane active">
                <div
                  className="bg-primary-subtle text-dark p-3 rounded mb-3"
                  style={{ marginTop: "-20px" }}
                >
                  <h5 className="mb-0">
                    {steps.find((s) => s.id === activeTab)?.title}
                  </h5>
                </div>
                {activeTab === "info" && (
                  <TravelHeaderForm
                    travelInfo={travelInfo}
                    handleChange={handleChange}
                  />
                )}

                {activeTab !== "info" && (
                  <p>
                    Form fields or instructions for:{" "}
                    <strong>{activeTab}</strong>
                  </p>
                )}

                {/* Navigation Buttons */}
                <div className="text-end mt-3">
                  {steps.findIndex((s) => s.id === activeTab) > 0 && (
                    <button
                      className="btn btn-secondary me-2"
                      onClick={() =>
                        setActiveTab(
                          steps[steps.findIndex((s) => s.id === activeTab) - 1]
                            .id
                        )
                      }
                    >
                      Previous
                    </button>
                  )}
                  {steps.findIndex((s) => s.id === activeTab) <
                    steps.length - 1 && (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        setActiveTab(
                          steps[steps.findIndex((s) => s.id === activeTab) + 1]
                            .id
                        )
                      }
                    >
                      Next
                    </button>
                  )}
                  {activeTab === "advance" && (
                    <button className="btn btn-success ms-2">Submit</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

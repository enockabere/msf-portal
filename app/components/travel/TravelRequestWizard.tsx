"use client";

import React, { useState } from "react";
import { User, ListChecks, Globe, Plane } from "lucide-react";
import "./TravelRequestWizard.css";
import TravelAdvanceDetails from "./TravelAdvanceDetails";
import TravelAdvanceGLTable from "./TravelAdvanceGLTable";

export default function TravelRequestWizard() {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-light border-bottom">
        <h4 className="mb-0 text-dark">Travel Request Application</h4>
        <p className="text-muted mt-1">
          Fill out your travel request in steps.
        </p>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-xxl-3 col-xl-4 col-12">
            <div className="nav flex-column wizard-sidebar" role="tablist">
              {[
                {
                  id: "info",
                  icon: <User size={20} />,
                  title: "Your Info",
                  desc: "Basic travel details",
                },
                {
                  id: "checklist",
                  icon: <ListChecks size={20} />,
                  title: "Checklist",
                  desc: "Pre-travel requirements",
                },
                {
                  id: "visa",
                  icon: <Globe size={20} />,
                  title: "Visa Application",
                  desc: "Visa documentation",
                },
                {
                  id: "travel_advance",
                  icon: <Plane size={20} />,
                  title: "travel advance",
                  desc: "travel advance",
                }
              ].map((step) => (
                <button
                  key={step.id}
                  className={`nav-link text-start wizard-tab ${activeTab === step.id ? "active" : ""
                    }`}
                  onClick={() => setActiveTab(step.id)}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div className="wizard-icon">{step.icon}</div>
                    <div>
                      <h5 className="mb-1">{step.title}</h5>
                      <p className="mb-0 small text-muted">{step.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-xxl-9 col-xl-8 col-12">
            <div className="tab-content">
              {activeTab === "info" && (
                <div className="tab-pane active">
                  <h5>Travel Info</h5>
                  <form className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Destination</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Purpose</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="col-12 text-end">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setActiveTab("checklist")}
                      >
                        Next
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "checklist" && (
                <div className="tab-pane active">
                  <h5>Checklist</h5>
                  <ul>
                    <li>Passport copy</li>
                    <li>Approval from supervisor</li>
                    <li>Itinerary</li>
                  </ul>
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setActiveTab("info")}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setActiveTab("visa")}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "visa" && (
                <div className="tab-pane active">
                  <h5>Visa Application</h5>
                  <form className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label">Visa Type</label>
                      <select className="form-select">
                        <option>Tourist</option>
                        <option>Business</option>
                        <option>Conference</option>
                      </select>
                    </div>
                    <div className="col-12 text-end">
                      <button
                        type="button"
                        className="btn btn-secondary me-2"
                        onClick={() => setActiveTab("checklist")}
                      >
                        Previous
                      </button>
                      <button type="submit" className="btn btn-success">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {activeTab === "travel_advance" && (
                <div>
                  {/* Travel Advance Details */}
                  <TravelAdvanceDetails travelInfo={{
                    basedOnRequest: "No",
                    travelRequestId: "TR001",
                    tripType: "One Way",
                    tripDates: { from: "2025-05-10", to: "2025-05-15" },
                    origin: "Nairobi",
                    destination: "Kampala",
                    applyForOther: "No",
                    recipientName: "John Doe",
                    currency: "USD",
                    paymentMethod: "Bank"
                  }} />
                  {/* Travel Advance GL Lines Table */}
                  <TravelAdvanceGLTable glLines={[
                    { account: "6001", description: "Flight Ticket", amount: 500, currency: "USD", department: "Finance", project: "Project A" },
                    { account: "6002", description: "Hotel", amount: 300, currency: "USD", department: "Finance", project: "Project A" },
                  ]} />
                  <div className="text-end mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setActiveTab("visa")}
                    >
                      Previous
                    </button>
                    <button className="btn btn-primary">
                      Create New Travel Advance
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

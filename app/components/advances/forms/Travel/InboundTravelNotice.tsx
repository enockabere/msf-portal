"use client";

import React, { useState } from "react";

const REASONS = [
  "Medevac",
  "Training",
  "Briefing/Debriefing",
  "HQ/Field Visit",
  "Other",
];

export default function InboundTravelNotice() {
  const [reason, setReason] = useState("");

  return (
    <div className="border rounded p-3 bg-light-subtle mt-3">
      <h6 className="text-dark fw-bold">Visit Details</h6>
      <div className="mb-1">
        <label className="form-label">Name of Visitor</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nehemiah Makau"
          readOnly
        />
        <small className="text-muted">
          Data to come from BC user profile on integration.
        </small>
      </div>

      <div className="row g-3 mb-3 mt-1">
        <div className="col-md-6">
          <label className="form-label">
            Arrival Date <span className="text-danger">*</span>
          </label>
          <input type="date" className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">
            Departure Date <span className="text-danger">*</span>
          </label>
          <input type="date" className="form-control" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">
            Cost Center <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter cost center"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Reason for Visiting <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">-- Select Reason --</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {reason === "Other" && (
        <div className="mt-3">
          <label className="form-label">Please describe the reason</label>
          <textarea
            className="form-control"
            placeholder="Enter description"
            rows={3}
          ></textarea>
        </div>
      )}

      {/* Attachment field */}
      <div className="mt-3">
        <label className="form-label">
          Attach Supporting Document <span className="text-danger">*</span>
        </label>
        <input type="file" className="form-control" />
        <small className="text-muted">
          Upload invitation letter, clearance, or other relevant documents.
        </small>
      </div>
    </div>
  );
}

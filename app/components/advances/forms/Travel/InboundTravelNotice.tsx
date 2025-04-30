"use client";

import React from "react";

const REASONS = [
  "Medevac",
  "Training",
  "Briefing/Debriefing",
  "HQ/Field Visit",
  "Other",
];

const DISBURSEMENT_METHODS = ["Cash", "Mpesa Transfer"];
const CURRENCIES = ["KES", "USD", "EUR"];

export default function InboundTravelNotice() {
  return (
    <div className="border rounded p-3 mt-3 bg-light-subtle">
      <div className="mb-3">
        <label className="form-label fw-semibold">Name of Visitor</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter visitor's name"
        />
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Arrival Date</label>
          <input type="date" className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">Departure Date</label>
          <input type="date" className="form-control" />
        </div>
      </div>

      <div className="mt-3">
        <label className="form-label fw-semibold">Cost Center</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter cost center"
        />
      </div>

      <div className="mt-3">
        <label className="form-label fw-semibold">Reason for Travel</label>
        <select className="form-select">
          <option value="">-- Select Reason --</option>
          {REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Disbursement Method</label>
          <select className="form-select">
            <option value="">-- Select Method --</option>
            {DISBURSEMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Currency</label>
          <select className="form-select">
            <option value="">-- Select Currency --</option>
            {CURRENCIES.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="form-label fw-semibold">Attachment</label>
        <input type="file" className="form-control" />
      </div>
    </div>
  );
}

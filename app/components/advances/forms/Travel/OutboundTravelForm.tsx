"use client";

import React from "react";

const COST_CENTERS = [
  { code: "HR", name: "Human Resources" },
  { code: "FIN", name: "Finance" },
  { code: "OPS", name: "Operations" },
  { code: "IT", name: "Information Technology" },
];

const REASONS = [
  "Conference",
  "Training",
  "Client Meeting",
  "Internal Meeting",
  "Project Work",
];

const ACCOMMODATION_TYPES = [
  "Self Arranged",
  "Full Board",
  "Half Board",
  "Bed & Breakfast",
];

const TRIP_TYPES = ["One Way", "Return", "Multi-City"];

interface Props {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export default function OutboundTravelForm({
  formData,
  handleChange,
}: Props) {
  return (
    <div className="border rounded p-3 bg-light-subtle mt-3">
      <h6 className="text-dark fw-bold">Travel Details</h6>
      <div className="row g-3">
        {/* Travel Type */}
        <div className="col-md-4">
          <label className="form-label">
            Type of Travel <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={formData.travelType}
            onChange={(e) => handleChange("travelType", e.target.value)}
          >
            <option value="">-- Select --</option>
            <option value="Local">Local</option>
            <option value="Regional">Regional</option>
            <option value="International">International</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">
            Cost Center <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={formData.costCenter || ""}
            onChange={(e) => handleChange("costCenter", e.target.value)}
          >
            <option value="">-- Select Cost Center --</option>
            {COST_CENTERS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="form-text mt-1 text-info">
            Remaining Trips:{" "}
            <strong>
              {formData.remainingTrips !== undefined
                ? formData.remainingTrips
                : "--"}
            </strong>
          </div>
        </div>
        <div className="col-md-4">
          <label className="form-label">
            Purpose of Travel <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={formData.reason || ""}
            onChange={(e) => handleChange("reason", e.target.value)}
          >
            <option value="">-- Select Reason --</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Accommodation Type</label>
          <select
            className="form-select"
            value={formData.accommodationType || ""}
            onChange={(e) => handleChange("accommodationType", e.target.value)}
          >
            <option value="">-- Select Type --</option>
            {ACCOMMODATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Require Per Diem</label>
          <select
            className="form-select"
            value={formData.requirePerDiem || "No"}
            onChange={(e) => handleChange("requirePerDiem", e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Trip Type</label>
          <select
            className="form-select"
            value={formData.tripType || ""}
            onChange={(e) => handleChange("tripType", e.target.value)}
          >
            <option value="">-- Select Trip Type --</option>
            {TRIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Require Security Money - Only if Local */}
        {formData.travelType === "Local" && (
          <div className="col-md-6">
            <label className="form-label">Require Security Money</label>
            <select
              className="form-select"
              value={formData.requireSecurityMoney || "No"}
              onChange={(e) =>
                handleChange("requireSecurityMoney", e.target.value)
              }
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        )}
        <div className="col-md-6">
          <label className="form-label">Annual Trip</label>
          <select
            className="form-select"
            value={formData.annualTrip || "No"}
            onChange={(e) => handleChange("annualTrip", e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
      </div>
    </div>
  );
}

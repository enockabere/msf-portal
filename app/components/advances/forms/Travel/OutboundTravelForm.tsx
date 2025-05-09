"use client";

import React from "react";

const COST_CENTERS = [
  { code: "HR", name: "Human Resources" },
  { code: "FIN", name: "Finance" },
  { code: "OPS", name: "Operations" },
  { code: "IT", name: "Information Technology" },
];

interface Props {
  travelInfo: any;
  handleChange: (field: string, value: any) => void;
}

export default function OutboundTravelForm({
  travelInfo,
  handleChange,
}: Props) {
  return (
    <>
      <div className="border rounded p-3 bg-light-subtle mt-3">
        <h6 className="text-dark fw-bold">Travel Details</h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              Type of Travel <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={travelInfo.travelType}
              onChange={(e) => handleChange("travelType", e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="Local">Local</option>
              <option value="Regional">Regional</option>
              <option value="International">International</option>
            </select>
          </div>

          {/* Cost Center */}
          <div className="col-md-6">
            <label className="form-label">
              Cost Center <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={travelInfo.costCenter || ""}
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
                {travelInfo.remainingTrips !== undefined
                  ? travelInfo.remainingTrips
                  : "--"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

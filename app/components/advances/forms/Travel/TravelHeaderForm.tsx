"use client";

import React from "react";

interface TripDates {
  from: string;
  to: string;
}

interface TravelInfo {
  travelType: "Local" | "Foreign" | "";
  visaRequired: string;
  workPermitRequired: string;
  tripDates: TripDates;
  destination: string;
  travelRequestId: string;
  basedOnRequest: string;
}

interface Props {
  travelInfo: TravelInfo;
  handleChange: (field: keyof TravelInfo, value: any) => void;
}

export default function TravelHeaderForm({ travelInfo, handleChange }: Props) {
  const calculateDuration = (from: string, to: string) => {
    const start = new Date(from);
    const end = new Date(to);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const showVisaField = travelInfo.travelType === "Foreign";
  const showWorkPermit =
    travelInfo.tripDates.from &&
    travelInfo.tripDates.to &&
    calculateDuration(travelInfo.tripDates.from, travelInfo.tripDates.to) > 7;

  return (
    <>
      {/* Travel Type */}
      <div className="mb-3">
        <label className="form-label">Type of Travel</label>
        <select
          className="form-select"
          value={travelInfo.travelType}
          onChange={(e) =>
            handleChange("travelType", e.target.value as "Local" | "Foreign")
          }
        >
          <option value="">-- Select --</option>
          <option value="Local">Local</option>
          <option value="Foreign">Foreign</option>
        </select>
      </div>

      {/* Visa Required (if Foreign) */}
      {showVisaField && (
        <div className="mb-3">
          <label className="form-label">Visa Required?</label>
          <select
            className="form-select"
            value={travelInfo.visaRequired}
            onChange={(e) => handleChange("visaRequired", e.target.value)}
          >
            <option value="">-- Select --</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      )}

      {/* Trip Dates */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Trip From</label>
          <input
            type="date"
            className="form-control"
            value={travelInfo.tripDates.from}
            onChange={(e) =>
              handleChange("tripDates", {
                ...travelInfo.tripDates,
                from: e.target.value,
              })
            }
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Trip To</label>
          <input
            type="date"
            className="form-control"
            value={travelInfo.tripDates.to}
            onChange={(e) =>
              handleChange("tripDates", {
                ...travelInfo.tripDates,
                to: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Work Permit Required (if > 7 days) */}
      {showWorkPermit && (
        <div className="mt-3">
          <label className="form-label">Work Permit Required?</label>
          <select
            className="form-select"
            value={travelInfo.workPermitRequired}
            onChange={(e) => handleChange("workPermitRequired", e.target.value)}
          >
            <option value="">-- Select --</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      )}

      {/* Destination */}
      <div className="mt-3">
        <label className="form-label">Destination</label>
        <input
          type="text"
          className="form-control"
          value={travelInfo.destination}
          onChange={(e) => handleChange("destination", e.target.value)}
        />
      </div>
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { TravelInfo } from "./TravelAdvanceHeader";

interface Props {
  travelInfo: TravelInfo;
  handleChange: (field: keyof TravelInfo, value: any) => void;
}

export default function TravelHeaderForm({ travelInfo, handleChange }: Props) {
  const [costCenters] = useState([
    { code: "HR", name: "Human Resources" },
    { code: "FIN", name: "Finance" },
    { code: "OPS", name: "Operations" },
    { code: "IT", name: "Information Technology" },
  ]);

  const calculateDuration = (from: string, to: string) => {
    const start = new Date(from);
    const end = new Date(to);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const showWorkPermit =
    travelInfo.tripDates.from &&
    travelInfo.tripDates.to &&
    calculateDuration(travelInfo.tripDates.from, travelInfo.tripDates.to) > 7;

  const showVisaField =
    travelInfo.travelType === "Regional" ||
    travelInfo.travelType === "International";

  useEffect(() => {
    if (travelInfo.travelType && travelInfo.costCenter) {
      const randomTrips = Math.floor(Math.random() * 5) + 1;
      handleChange("remainingTrips", randomTrips);
    }
  }, [travelInfo.travelType, travelInfo.costCenter, handleChange]);

  return (
    <>
      <div className="row g-3">
        {/* User Type */}
        <div className="col-md-6">
          <label className="form-label">User Type</label>
          <select
            className="form-select"
            value={travelInfo.userType}
            onChange={(e) =>
              handleChange("userType", e.target.value as TravelInfo["userType"])
            }
          >
            <option value="">-- Select User Type --</option>
            <option value="Inbound">Inbound</option>
            <option value="Outbound">Outbound</option>
          </select>
        </div>

        {/* Destination (Inbound only) */}
        {travelInfo.userType === "Inbound" && (
          <div className="col-md-6">
            <label className="form-label">Destination</label>
            <input
              type="text"
              className="form-control"
              value={travelInfo.destination}
              onChange={(e) => handleChange("destination", e.target.value)}
            />
          </div>
        )}

        {/* Are you a Resident? (Outbound only) */}
        {travelInfo.userType === "Outbound" && (
          <div className="col-md-6">
            <label className="form-label">Are you a Resident?</label>
            <select
              className="form-select"
              value={travelInfo.residentStatus}
              onChange={(e) =>
                handleChange(
                  "residentStatus",
                  e.target.value as "Resident" | "Non-Resident"
                )
              }
            >
              <option value="">-- Select Status --</option>
              <option value="Resident">Resident</option>
              <option value="Non-Resident">Non-Resident</option>
            </select>
          </div>
        )}

        {/* Travel Type and related details */}
        {travelInfo.userType !== "Inbound" && (
          <>
            {/* Travel Type */}
            <div className="col-md-6">
              <label className="form-label">Type of Travel</label>
              <select
                className="form-select"
                value={travelInfo.travelType}
                onChange={(e) =>
                  handleChange(
                    "travelType",
                    e.target.value as TravelInfo["travelType"]
                  )
                }
              >
                <option value="">-- Select --</option>
                <option value="Local">Local</option>
                <option value="Regional">Regional</option>
                <option value="International">International</option>
              </select>
            </div>

            {/* Visa Required — only show if type is Regional/International */}
            {showVisaField && (
              <div className="col-md-6">
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

            {/* Cost Center */}
            <div className="col-md-6">
              <label className="form-label">Cost Center</label>
              <select
                className="form-select"
                value={travelInfo.costCenter || ""}
                onChange={(e) => handleChange("costCenter", e.target.value)}
              >
                <option value="">-- Select Cost Center --</option>
                {costCenters.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Remaining Trips */}
            <div className="col-md-6">
              <label className="form-label">Remaining Trips</label>
              <input
                type="text"
                className="form-control"
                value={
                  travelInfo.remainingTrips !== undefined
                    ? travelInfo.remainingTrips
                    : "--"
                }
                readOnly
              />
            </div>
          </>
        )}
      </div>

      {/* Trip Dates */}
      <div className="row g-3 mt-2">
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

      {/* Work Permit Required */}
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
    </>
  );
}

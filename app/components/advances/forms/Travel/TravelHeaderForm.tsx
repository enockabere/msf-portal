"use client";

import { useEffect } from "react";
import { TravelInfo } from "./TravelAdvanceHeader";
import { useMySetups } from "@/app/context/SetupContext";

const COST_CENTERS = [
  { code: "HR", name: "Human Resources" },
  { code: "FIN", name: "Finance" },
  { code: "OPS", name: "Operations" },
  { code: "IT", name: "Information Technology" },
];

const ACCOMMODATION_TYPES = [
  { code: "Self-Arranged", name: "Self Arranged" },
  { code: "Full Board", name: "Full Board" },
  { code: "Half Board", name: "Half Board" },
  { code: "Bed & Breakfast", name: "Bed & Breakfast" },
];

const TRIP_TYPES = ["One Way", "Return", "Multi-City"];

interface Props {
  travelInfo: TravelInfo;
  profile: Record<string, any>;
  handleChange: (field: keyof TravelInfo, value: any) => void;
}

export default function TravelHeaderForm({ travelInfo, profile, handleChange }: Props) {
  const {
    purposeOfTravel,
    fetchSetups,
  } = useMySetups();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSetups([
          'purposeOfTravel',
        ]);
      } finally {
        //
      }
    };

    loadData();
  }, [fetchSetups]);

  useEffect(() => {
    if (travelInfo.travelType && travelInfo.costCenter) {
      const randomTrips = Math.floor(Math.random() * 5) + 1;
      handleChange("remainingTrips", randomTrips);
    }
  }, [travelInfo.travelType, travelInfo.costCenter, handleChange]);

  return (
    <>
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
                value={travelInfo.travelType}
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
          <div className="col-md-4">
            <label className="form-label">
              Purpose of Travel <span className="text-danger">*</span>
            </label>
            <select
                className="form-select"
                value={travelInfo.purposeOfTravel}
                onChange={(e) => handleChange("reason", e.target.value)}
            >
              <option value="">-- Select Purpose --</option>
              {purposeOfTravel.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.description}
                  </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Accommodation Type</label>
            <select
                className="form-select"
                value={travelInfo.accommodationType || ""}
                onChange={(e) => handleChange("accommodationType", e.target.value)}
            >
              <option value="">-- Select Type --</option>
              {ACCOMMODATION_TYPES.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.name}
                  </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Require Per Diem</label>
            <select
                className="form-select"
                value={travelInfo.requirePerDiem || "No"}
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
                value={travelInfo.tripType || ""}
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
          {travelInfo.travelType === "Local" && (
              <div className="col-md-6">
                <label className="form-label">Require Security Money</label>
                <select
                    className="form-select"
                    value={travelInfo.requireSecurityMoney || "No"}
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
                value={travelInfo.annualTrip || "No"}
                onChange={(e) => handleChange("annualTrip", e.target.value)}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

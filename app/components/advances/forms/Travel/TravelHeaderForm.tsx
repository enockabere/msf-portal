"use client";

import React, { useEffect } from "react";
import { TravelInfo } from "./TravelAdvanceHeader";
import InboundTravelNotice from "./InboundTravelNotice";
import OutboundTravelForm from "./OutboundTravelForm";

interface Props {
  travelInfo: TravelInfo;
  handleChange: (field: keyof TravelInfo, value: any) => void;
}

export default function TravelHeaderForm({ travelInfo, handleChange }: Props) {
  useEffect(() => {
    if (travelInfo.travelType && travelInfo.costCenter) {
      const randomTrips = Math.floor(Math.random() * 5) + 1;
      handleChange("remainingTrips", randomTrips);
    }
  }, [travelInfo.travelType, travelInfo.costCenter, handleChange]);

  return (
    <>
      {/* User Info Section */}
      <div className="border rounded p-3 mb-4">
        <h6 className="text-dark fw-bold">User Information</h6>
        <small className="text-muted">
          Fields for test purposes. Data to come from BC user profile on
          integration. <span className="text-danger">*</span>
        </small>

        <div className="row g-3 mt-2">
          {/* User Type */}
          <div className="col-md-6">
            <label className="form-label">User Type</label>
            <select
              className="form-select"
              value={travelInfo.userType}
              onChange={(e) =>
                handleChange(
                  "userType",
                  e.target.value as TravelInfo["userType"]
                )
              }
            >
              <option value="">-- Select User Type --</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
            </select>
          </div>

          {/* Are you a Resident? */}
          <div className="col-md-6">
            <label className="form-label">Nationality?</label>
            <select
              className="form-select"
              value={travelInfo.residentStatus}
              onChange={(e) =>
                handleChange(
                  "residentStatus",
                  e.target.value as "Resident" | "Non-Resident"
                )
              }
              disabled={travelInfo.userType !== "Outbound"}
            >
              <option value="">-- Select Status --</option>
              <option value="Resident">Kenyan</option>
              <option value="Non-Resident">Foreigner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conditional Form Rendering */}
      {travelInfo.userType === "Inbound" && <InboundTravelNotice />}
      {travelInfo.userType === "Outbound" && (
        <OutboundTravelForm
          travelInfo={travelInfo}
          handleChange={handleChange}
        />
      )}
    </>
  );
}

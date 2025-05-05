"use client";

import { ArrowDown } from "lucide-react";
import React, { useEffect, useCallback } from "react";
import InboundTravelNotice from "./InboundTravelNotice";
import OutboundTravelForm from "./OutboundTravelForm";

export interface TravelInfo {
  basedOnRequest: "Yes" | "No";
  travelRequestId: "TR001" | "TR002" | "";
  tripType: string;
  tripDates: { from: string; to: string };
  destination: string;
  applyForOther: "Yes" | "No";
  recipientName: string;
  currency: string;
  paymentMethod: string;
  [key: string]: any;
}

interface TravelAdvanceHeaderProps {
  travelInfo: TravelInfo;
  setTravelInfo: React.Dispatch<React.SetStateAction<TravelInfo>>;
  onNext: () => void;
}

const TRAVEL_REQUESTS = {
  TR001: {
    destination: "Nairobi",
    tripDates: { from: "2024-06-01", to: "2024-06-05" },
    currency: "KES",
    paymentMethod: "Bank",
  },
  TR002: {
    destination: "Mombasa",
    tripDates: { from: "2024-06-10", to: "2024-06-12" },
    currency: "USD",
    paymentMethod: "Cash",
  },
} as const;

type TravelRequestID = keyof typeof TRAVEL_REQUESTS;

// Helper to populate travel info from request
const getTravelRequestData = (id: TravelRequestID) => TRAVEL_REQUESTS[id];

export default function TravelAdvanceHeader({
  travelInfo,
  setTravelInfo,
  onNext,
}: TravelAdvanceHeaderProps) {
  const handleChange = useCallback(
    (field: keyof TravelInfo, value: any) => {
      setTravelInfo((prev) => ({ ...prev, [field]: value }));
    },
    [setTravelInfo]
  );

  // Default "Yes" on first load
  useEffect(() => {
    if (!travelInfo.basedOnRequest) {
      setTravelInfo((prev) => ({ ...prev, basedOnRequest: "Yes" }));
    }
  }, [travelInfo.basedOnRequest, setTravelInfo]);

  // Populate data from request
  useEffect(() => {
    const { travelRequestId, basedOnRequest } = travelInfo;
    if (
      basedOnRequest === "Yes" &&
      travelRequestId &&
      travelRequestId in TRAVEL_REQUESTS
    ) {
      const selected = getTravelRequestData(travelRequestId as TravelRequestID);
      setTravelInfo((prev) => {
        if (
          prev.destination === selected.destination &&
          prev.tripDates.from === selected.tripDates.from &&
          prev.tripDates.to === selected.tripDates.to &&
          prev.currency === selected.currency &&
          prev.paymentMethod === selected.paymentMethod
        ) {
          return prev;
        }
        return {
          ...prev,
          destination: selected.destination,
          tripDates: selected.tripDates,
          currency: selected.currency,
          paymentMethod: selected.paymentMethod,
        };
      });
    }
  }, [travelInfo, setTravelInfo]);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-primary-subtle">
        <h5 className="mb-0 text-dark">Step 1: Travel Details</h5>
      </div>
      <div className="card-body">
        {/* Based on Planner */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Based on submitted Travel Request?
          </label>
          <select
            className="form-select"
            value={travelInfo.basedOnRequest}
            onChange={(e) => handleChange("basedOnRequest", e.target.value)}
          >
            <option value="No">No - (MSF-EA Visitor Travel Allowance)</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Travel Request ID (only active when Yes) */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Select Travel Request
          </label>
          <select
            className="form-select"
            disabled={travelInfo.basedOnRequest === "No"}
            value={travelInfo.travelRequestId}
            onChange={(e) => handleChange("travelRequestId", e.target.value)}
          >
            <option value="">-- Select --</option>
            <option value="TR001">Trip to Nairobi</option>
            <option value="TR002">Workshop in Mombasa</option>
          </select>
        </div>

        {/* If Yes + Request is selected => show outbound */}
        {travelInfo.basedOnRequest === "Yes" && travelInfo.travelRequestId && (
          <OutboundTravelForm
            travelInfo={travelInfo}
            handleChange={handleChange}
          />
        )}

        {/* If No => Inbound */}
        {travelInfo.basedOnRequest === "No" && <InboundTravelNotice />}

        {/* Footer */}
        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
            onClick={onNext}
          >
            <ArrowDown size={16} />
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
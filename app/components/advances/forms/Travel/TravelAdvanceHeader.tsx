"use client";

import { ArrowDown } from "lucide-react";
import React, { useEffect } from "react";

interface TravelAdvanceHeaderProps {
  travelInfo: any;
  setTravelInfo: (info: any) => void;
  onNext: () => void;
}

const RECIPIENTS = [
  "John Doe",
  "Jane Smith",
  "Michael Johnson",
  "Sarah Williams",
  "David Brown",
];

const TRAVEL_REQUESTS: Record<
  string,
  {
    destination: string;
    tripDates: { from: string; to: string };
    currency: string;
    paymentMethod: string;
  }
> = {
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
};

export default function TravelAdvanceHeader({
  travelInfo,
  setTravelInfo,
  onNext,
}: TravelAdvanceHeaderProps) {
  const handleChange = (field: string, value: any) => {
    setTravelInfo((prev: any) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (travelInfo.basedOnRequest === "Yes" && travelInfo.travelRequestId) {
      const selected = TRAVEL_REQUESTS[travelInfo.travelRequestId];
      if (selected) {
        setTravelInfo((prev: any) => ({
          ...prev,
          destination: selected.destination,
          tripDates: selected.tripDates,
          currency: selected.currency,
          paymentMethod: selected.paymentMethod,
        }));
      }
    }
  }, [travelInfo.basedOnRequest, travelInfo.travelRequestId, setTravelInfo]);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-primary-subtle">
        <h5 className="mb-0 text-dark">Step 1: Travel Details</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Based on submitted Travel Request?
          </label>
          <select
            className="form-select"
            value={travelInfo.basedOnRequest}
            onChange={(e) => handleChange("basedOnRequest", e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {travelInfo.basedOnRequest === "Yes" ? (
          <>
            <div className="mb-3">
              <label className="form-label">Select Travel Request</label>
              <select
                className="form-select"
                value={travelInfo.travelRequestId}
                onChange={(e) =>
                  handleChange("travelRequestId", e.target.value)
                }
              >
                <option value="">-- Select --</option>
                <option value="TR001">Trip to Nairobi</option>
                <option value="TR002">Workshop in Mombasa</option>
              </select>
            </div>
            {travelInfo.travelRequestId && (
              <div className="bg-light p-3 rounded border">
                <p className="mb-2">
                  <strong>Destination:</strong> {travelInfo.destination || "-"}
                </p>
                <p className="mb-2">
                  <strong>Trip Dates:</strong> {travelInfo.tripDates?.from} to{" "}
                  {travelInfo.tripDates?.to}
                </p>
                <p className="mb-2">
                  <strong>Currency:</strong> {travelInfo.currency || "-"}
                </p>
                <p className="mb-0">
                  <strong>Payment Method:</strong>{" "}
                  {travelInfo.paymentMethod || "-"}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-3">
              <label className="form-label">Trip Type</label>
              <select
                className="form-select"
                value={travelInfo.tripType}
                onChange={(e) => handleChange("tripType", e.target.value)}
              >
                <option value="">-- Select --</option>
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>

            {travelInfo.tripType === "outbound" && (
              <>
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

                <div className="mt-3">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    value={travelInfo.destination}
                    onChange={(e) =>
                      handleChange("destination", e.target.value)
                    }
                  />
                </div>

                <div className="mt-3">
                  <label className="form-label">
                    Apply on behalf of someone else?
                  </label>
                  <select
                    className="form-select"
                    value={travelInfo.applyForOther}
                    onChange={(e) =>
                      handleChange("applyForOther", e.target.value)
                    }
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {travelInfo.applyForOther === "Yes" && (
                  <div className="mt-2">
                    <label className="form-label">Recipient Name</label>
                    <select
                      className="form-select"
                      value={travelInfo.recipientName}
                      onChange={(e) =>
                        handleChange("recipientName", e.target.value)
                      }
                    >
                      <option value="">-- Select Recipient --</option>
                      {RECIPIENTS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="row mt-3">
                  <div className="col-md-6">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-select"
                      value={travelInfo.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                    >
                      <option value="">-- Select Currency --</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={travelInfo.paymentMethod}
                      onChange={(e) =>
                        handleChange("paymentMethod", e.target.value)
                      }
                    >
                      <option value="">-- Select Method --</option>
                      <option value="Cash">Cash</option>
                      <option value="Mpesa">Mpesa</option>
                      <option value="Bank">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {travelInfo.tripType === "inbound" && (
              <div className="alert alert-info mt-3">
                Inbound trips do not require accounting. Approval required from
                cross-admin.
              </div>
            )}
          </>
        )}

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

"use client";

import React from "react";

const RECIPIENTS = [
  "John Doe",
  "Jane Smith",
  "Michael Johnson",
  "Sarah Williams",
  "David Brown",
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
          onChange={(e) => handleChange("destination", e.target.value)}
        />
      </div>

      <div className="mt-3">
        <label className="form-label">Apply on behalf of someone else?</label>
        <select
          className="form-select"
          value={travelInfo.applyForOther}
          onChange={(e) => handleChange("applyForOther", e.target.value)}
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
            onChange={(e) => handleChange("recipientName", e.target.value)}
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
            onChange={(e) => handleChange("paymentMethod", e.target.value)}
          >
            <option value="">-- Select Method --</option>
            <option value="Cash">Cash</option>
            <option value="Mpesa">Mpesa</option>
            <option value="Bank">Bank Transfer</option>
          </select>
        </div>
      </div>
    </>
  );
}

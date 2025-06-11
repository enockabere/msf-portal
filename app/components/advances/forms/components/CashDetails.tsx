"use client";

import React from "react";

interface Props {
  collectionDate: string;
  setCollectionDate: (v: string) => void;
  cashHours: string;
  setCashHours: (v: string) => void;
  isViewMode: boolean;
  status?: string;
}

export default function CashDetails({
  collectionDate,
  setCollectionDate,
  cashHours,
  setCashHours,
  isViewMode,
  status = "",
}: Props) {
  const isDisabled =
    isViewMode || status === "Pending Approval" || status === "Released";

  const readOnlyStyle =
    !["Open", ""].includes(status) || isDisabled
      ? { backgroundColor: "#f1f1f1", color: "#6b7280", cursor: "not-allowed" }
      : {};

  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Collection Date</label>
        <input
          type="date"
          className="form-control"
          value={collectionDate}
          onChange={(e) => setCollectionDate(e.target.value)}
          disabled={isDisabled}
          style={readOnlyStyle}
          required
        />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">Collection Time</label>
        <select
          id="cash-hours"
          className="form-select"
          value={cashHours}
          onChange={(e) => setCashHours(e.target.value)}
          disabled={isDisabled}
          style={readOnlyStyle}
          required
        >
          <option value="Morning">Morning (8:00 AM - 12:00 PM)</option>
          <option value="Afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
        </select>
      </div>
    </div>
  );
}

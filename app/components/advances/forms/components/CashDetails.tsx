"use client";

import React from "react";

interface Props {
  collectionDate: string;
  setCollectionDate: (v: string) => void;
  cashHours: string;
  setCashHours: (v: string) => void;
  isViewMode: boolean;
}

export default function CashDetails({
  collectionDate,
  setCollectionDate,
  cashHours,
  setCashHours,
  isViewMode,
}: Props) {
  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Collection Date</label>
        <input
          type="date"
          className="form-control"
          value={collectionDate}
          onChange={(e) => setCollectionDate(e.target.value)}
          disabled={isViewMode}
          required
        />
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label">Collection Time</label>
        <input
          type="time"
          className="form-control"
          value={cashHours}
          onChange={(e) => setCashHours(e.target.value)}
          disabled={isViewMode}
          required
        />
      </div>
    </div>
  );
}

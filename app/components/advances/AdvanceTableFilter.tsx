"use client";

import React from "react";
import { Funnel } from "lucide-react";

interface AdvanceTableFilterProps {
  status: string;
  setStatus: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}

export default function AdvanceTableFilter({
  status,
  setStatus,
  type,
  setType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  search,
  setSearch,
}: AdvanceTableFilterProps) {
  return (
    <div className="dropdown">
      <a
        className="btn bg-success-subtle text-success dropdown-toggle d-flex align-items-center"
        data-bs-toggle="dropdown"
        href="#"
        role="button"
        aria-haspopup="true"
        aria-expanded="false"
        data-bs-auto-close="outside"
      >
        <Funnel size={16} className="me-1" />
        Filter
      </a>

      <div className="dropdown-menu p-3 shadow" style={{ minWidth: "320px" }}>
        <div className="mb-2">
          <label className="form-label fw-semibold">Advance Type</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Salary">Salary</option>
            <option value="Travel">Travel</option>
            <option value="Operational">Operational</option>
            <option value="Project">Project</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label fw-semibold">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Released">Released</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label fw-semibold">Date Range</label>
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-2">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={() => {
              setSearch("");
              setStatus("All");
              setType("All");
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear
          </button>
          <button className="btn btn-sm btn-primary">Apply</button>
        </div>
      </div>
    </div>
  );
}

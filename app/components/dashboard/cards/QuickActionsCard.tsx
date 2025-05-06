"use client";

import React from "react";
import Link from "next/link";
import "./Cards.css";
import CustomModal from "../../modals/CustomModal";
import SalaryAdvanceForm from "../../advances/forms/SalaryAdvanceForm";

export default function QuickActionsCard() {
  return (
    <div className="card h-100 quick-actions-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 position-relative">
          <h5 className="card-title mb-0">
            <i className="iconoir-settings text-primary me-2"></i>
            Quick Actions
          </h5>
          <div className="blink-animation-circle">
            <i className="fa-solid fa-exclamation text-danger" />
          </div>
        </div>
        <div className="row g-2">
          {/* <div className="col-6">
            <Link
              href="/dashboard/make-request/advances"
              className="action-card bg-success p-3 rounded text-center d-block position-relative text-white"
            >
              <i className="iconoir-wallet h4 mb-2"></i>
              <h5 className="mb-1 fw-bold">New</h5>
              <p className="mb-0 fs-13">Salary Advance</p>
            </Link>
          </div> */}
          {/* <div className="col-6">
            <Link
              href="#"
              className="action-card bg-danger p-3 rounded text-center d-block position-relative text-white"
            >
              <i className="iconoir-bell-notification h4 mb-2"></i>
              <h5 className="mb-1 fw-bold">8 Approvals</h5>
              <p className="mb-0 fs-13">Requests</p>
            </Link>
          </div> */}
          {/* <div className="col-6">
            <Link
              href="#"
              className="action-card bg-info p-3 rounded text-center d-block text-white"
            >
              <i className="iconoir-cash h4 mb-2"></i>
              <h5 className="mb-1 fw-bold">KES 15,000</h5>
              <p className="mb-0 fs-13">Surrender Imprest</p>
            </Link>
          </div> */}
          <div className="col-6">
            <Link
              href="/dashboard/make-request/advances"
              className="action-card bg-warning p-3 rounded text-center d-block text-white"
            >
              <i className="iconoir-wallet h4 mb-2"></i>
              <h5 className="mb-1 fw-bold">Salary Advances</h5>
              <p className="mb-0 fs-13">View</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

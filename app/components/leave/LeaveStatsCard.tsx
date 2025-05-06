"use client";

import { CalendarDays, Ban, CheckCircle } from "lucide-react";

export default function LeaveStatsCard() {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="row g-3">
          {/* Total Leave Days Taken */}
          <div className="col-md-12">
            <div className="card shadow-none border mb-3 mb-lg-0">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <CalendarDays size={24} className="text-info me-2" />
                  <div className="flex-grow-1 text-truncate">
                    <p className="text-dark mb-0 fw-semibold fs-13">
                      Leave Days Taken
                    </p>
                    <h3 className="mt-1 mb-0 fs-18 fw-bold">
                      34
                      <span className="fs-11 text-muted fw-normal">
                        This Year
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approved Leaves */}
          <div className="col-md-12">
            <div className="card shadow-none border mb-3 mb-lg-0">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <CheckCircle size={24} className="text-success me-2" />
                  <div className="flex-grow-1 text-truncate">
                    <p className="text-dark mb-0 fw-semibold fs-13">
                      Approved Leaves
                    </p>
                    <h3 className="mt-1 mb-0 fs-18 fw-bold">
                      48
                      <span className="fs-11 text-muted fw-normal">
                        Approved 365 Days
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancelled Requests */}
          <div className="col-md-12">
            <div className="card shadow-none border mb-3 mb-lg-0">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <Ban size={24} className="text-danger me-2" />
                  <div className="flex-grow-1 text-truncate">
                    <p className="text-dark mb-0 fw-semibold fs-13">
                      Cancelled Requests
                    </p>
                    <h3 className="mt-1 mb-0 fs-18 fw-bold">
                      8
                      <span className="fs-11 text-muted fw-normal">
                        In the Past Year
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

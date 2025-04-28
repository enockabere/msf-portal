"use client";

import React from "react";

type MpesaDetailsProps = {
  phone: string;
  setPhone: (val: string) => void;
  idNumber: string;
  setIdNumber: (val: string) => void;
  isLoading?: boolean;
  isViewMode?: boolean;
  required?: boolean;
  status?: string; // <-- Added status prop
};

export default function MpesaDetails({
  phone,
  setPhone,
  idNumber,
  setIdNumber,
  isLoading = false,
  isViewMode = false,
  required = false,
  status = "", // <-- Default empty string
}: MpesaDetailsProps) {
  const isDisabled =
    isViewMode || status === "Pending Approval" || status === "Released"; // Central disable logic

  return (
    <div className="fade-in">
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="mpesa-phone" className="form-label">
            Mpesa Phone Number <span className="text-danger">*</span>
          </label>
          {isLoading ? (
            <div
              className="skeleton-box"
              style={{ height: "38px", borderRadius: "0.375rem" }}
            />
          ) : (
            <div className="input-group">
              <span className="input-group-text">+254</span>
              <input
                id="mpesa-phone"
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={9}
                disabled={isDisabled}
                required={required}
              />
            </div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="id-number" className="form-label">
            ID / Passport No. (Used to register the provided MPESA number){" "}
            <span className="text-danger">*</span>
          </label>
          {isLoading ? (
            <div
              className="skeleton-box"
              style={{ height: "38px", borderRadius: "0.375rem" }}
            />
          ) : (
            <input
              id="id-number"
              type="text"
              className="form-control"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              disabled={isDisabled}
              required={required}
            />
          )}
        </div>
      </div>
    </div>
  );
}

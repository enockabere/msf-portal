"use client";

import { useState } from "react";

export default function BankDetailsTab() {
  const [bankDetails, setBankDetails] = useState({
    currency: "KES",
    bankName: "Equity Bank",
    branch: "Westlands",
    accountName: "Enock Abere",
    accountNumber: "1234567890",
    swiftCode: "EQBLKENA",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Bank Details</h4>
      </div>
      <div className="card-body pt-0">
        <div className="form-group mb-3 row">
          <label className="col-lg-3 text-end form-label">Currency</label>
          <div className="col-lg-9">
            <select
              name="currency"
              className="form-select"
              value={bankDetails.currency}
              onChange={handleChange}
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="form-group mb-3 row">
          <label className="col-lg-3 text-end form-label">Bank Name</label>
          <div className="col-lg-9">
            <input
              className="form-control"
              type="text"
              name="bankName"
              value={bankDetails.bankName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group mb-3 row">
          <label className="col-lg-3 text-end form-label">Branch</label>
          <div className="col-lg-9">
            <input
              className="form-control"
              type="text"
              name="branch"
              value={bankDetails.branch}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group mb-3 row">
          <label className="col-lg-3 text-end form-label">Account Name</label>
          <div className="col-lg-9">
            <input
              className="form-control"
              type="text"
              name="accountName"
              value={bankDetails.accountName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group mb-3 row">
          <label className="col-lg-3 text-end form-label">Account Number</label>
          <div className="col-lg-9">
            <input
              className="form-control"
              type="text"
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group mb-3 row">
          <label className="col-lg-3 text-end form-label">SWIFT Code</label>
          <div className="col-lg-9">
            <input
              className="form-control"
              type="text"
              name="swiftCode"
              value={bankDetails.swiftCode}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group row">
          <div className="col-lg-9 offset-lg-3">
            <button type="submit" className="btn btn-primary me-2">
              Save Changes
            </button>
            <button type="button" className="btn btn-danger">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";

interface BankDetailsProps {
  accountNo: string;
  setAccountNo: (val: string) => void;
  bank: string;
  setBank: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  chequeName: string;
  setChequeName: (val: string) => void;
  swiftCode: string;
  setSwiftCode: (val: string) => void;
  paymentMethod: string;
  banks: any[];
  filteredBranches: any[];
  isLoading?: boolean;
  isViewMode?: boolean;
  status?: string;
}

export default function BankDetails({
  accountNo,
  setAccountNo,
  bank,
  setBank,
  branch,
  setBranch,
  chequeName,
  setChequeName,
  swiftCode,
  setSwiftCode,
  paymentMethod,
  banks,
  filteredBranches,
  isLoading = false,
  isViewMode = false,
  status = "",
}: BankDetailsProps) {
  const isRTGS = paymentMethod === "RTGS";
  const isEFT = paymentMethod === "EFT";
  const isCHEQUE = paymentMethod === "CHEQUE";

  const isRequired = isRTGS || isCHEQUE || isEFT;
  const isDisabled =
    isViewMode || status === "Pending Approval" || status === "Released";

  const readOnlyStyle =
    !["Open", ""].includes(status) || isDisabled
      ? { backgroundColor: "#f1f1f1", color: "#6b7280", cursor: "not-allowed" }
      : {};

  return (
    <div className="fade-in">
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="account-no" className="form-label">
            Account No. {isRequired && <span className="text-danger">*</span>}
          </label>
          {isLoading ? (
            <div
              className="skeleton-box"
              style={{ height: "38px", borderRadius: "0.375rem" }}
            />
          ) : (
            <input
              id="account-no"
              type="text"
              className="form-control"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              required={isRequired}
              disabled={isDisabled}
              style={readOnlyStyle}
            />
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="bank" className="form-label">
            Select Bank {isRequired && <span className="text-danger">*</span>}
          </label>
          {isLoading ? (
            <div
              className="skeleton-box"
              style={{ height: "38px", borderRadius: "0.375rem" }}
            />
          ) : (
            <select
              id="bank"
              className="form-select"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              required={isRequired}
              disabled={isDisabled}
              style={readOnlyStyle}
            >
              <option value="">Select Bank</option>
              {banks.map((b) => (
                <option key={b.no} value={b.no}>
                  {b.no} — {b.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="branch" className="form-label">
            Select Branch {isRequired && <span className="text-danger">*</span>}
          </label>
          {isLoading ? (
            <div
              className="skeleton-box"
              style={{ height: "38px", borderRadius: "0.375rem" }}
            />
          ) : (
            <select
              id="branch"
              className="form-select"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required={isRequired}
              disabled={!bank || isDisabled}
              style={readOnlyStyle}
            >
              <option value="">Select Branch</option>
              {filteredBranches.map((bb) => (
                <option key={bb.branchNo} value={bb.branchNo}>
                  {bb.branchNo} — {bb.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="account-name" className="form-label">
            Account Name {isRequired && <span className="text-danger">*</span>}
          </label>
          {isLoading ? (
            <div
              className="skeleton-box"
              style={{ height: "38px", borderRadius: "0.375rem" }}
            />
          ) : (
            <input
              id="account-name"
              type="text"
              className="form-control"
              value={chequeName}
              onChange={(e) => setChequeName(e.target.value)}
              required={isRequired}
              disabled={isDisabled}
              style={readOnlyStyle}
            />
          )}
        </div>
      </div>

      {(isRTGS || isEFT) && (
        <div className="row">
          <div className="col-12 mb-3">
            <label htmlFor="swift-code" className="form-label">
              Swift Code {isRTGS && <span className="text-danger">*</span>}
            </label>
            {isLoading ? (
              <div
                className="skeleton-box"
                style={{ height: "38px", borderRadius: "0.375rem" }}
              />
            ) : (
              <input
                id="swift-code"
                type="text"
                className="form-control"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value)}
                required={isRTGS}
                disabled={isDisabled}
                style={readOnlyStyle}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

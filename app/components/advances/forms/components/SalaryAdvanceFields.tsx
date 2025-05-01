"use client";

import React, { useMemo } from "react";

interface Props {
  advanceAmount: string;
  setAdvanceAmount: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  currencies: any[];
  paymentMethods: any[];
  advanceLimit: number | null | undefined;
  isLimitLoading: boolean;
  isViewMode: boolean;
  status?: string;
}

export default function SalaryAdvanceFields({
  advanceAmount,
  setAdvanceAmount,
  paymentMethod,
  setPaymentMethod,
  currency,
  setCurrency,
  currencies,
  paymentMethods,
  advanceLimit,
  isLimitLoading,
  isViewMode,
  status = "",
}: Props) {
  const isKES = currency === "KES";
  const currencyChosen = currency !== "";

  const isDisabled =
    isViewMode || status === "Pending Approval" || status === "Released";

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = e.target.value;
    setCurrency(selectedCurrency);
    setPaymentMethod("");
  };

  const filteredPaymentMethods = useMemo(() => {
    if (!currencyChosen) return [];
    if (currency === "KES") {
      return paymentMethods;
    }
    return paymentMethods.filter((pm) => pm.code !== "MPESA");
  }, [currency, currencyChosen, paymentMethods]);

  return (
    <div className="row">
      <div className="col-md-4 mb-3">
        <label htmlFor="currency" className="form-label">
          Currency
        </label>
        <select
          id="currency"
          className="form-select"
          value={currency}
          onChange={handleCurrencyChange}
          disabled={isDisabled}
          required
        >
          <option value="">-- Select Currency --</option>
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.description}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-4 mb-3">
        <label htmlFor="AdvanceAmount" className="form-label">
          Advance Amount
        </label>
        <input
          id="AdvanceAmount"
          type="number"
          className="form-control"
          placeholder="Enter Advance Amount"
          value={advanceAmount}
          onChange={(e) => setAdvanceAmount(e.target.value)}
          required
          disabled={isDisabled}
        />
        {typeof advanceLimit === "number" && (
          <div className="mt-1 small">
            <strong className="text-info">Advance Limit:</strong>{" "}
            {isKES ? "KES" : currency || "N/A"} {advanceLimit.toLocaleString()}
            {parseFloat(advanceAmount) > advanceLimit && (
              <div className="text-danger mt-1">
                Amount exceeds allowed limit!
              </div>
            )}
          </div>
        )}
        {isLimitLoading && (
          <div className="mt-1 small text-muted d-flex align-items-center gap-2">
            <span
              className="spinner-border spinner-border-sm"
              style={{ width: "0.8rem", height: "0.8rem" }}
            />
            Calculating limit...
          </div>
        )}
      </div>

      <div className="col-md-4 mb-3">
        <label htmlFor="payment-method" className="form-label">
          Payment Method
        </label>
        <select
          id="payment-method"
          className="form-select"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={isDisabled || !currencyChosen}
          required
        >
          <option value="">-- Select Payment Method --</option>
          {filteredPaymentMethods.map((pm) => (
            <option key={pm.code} value={pm.code}>
              {pm.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

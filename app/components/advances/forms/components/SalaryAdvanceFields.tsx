"use client";

import React, { useMemo } from "react";

interface Props {
  advanceAmount: string;
  setAdvanceAmount: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  isPaymentMethodLocked: boolean;
  currency: string;
  setCurrency: (v: string) => void;
  currencies: any[];
  paymentMethods: any[];
  advanceLimit: number | null | undefined;
  isLimitLoading: boolean;
  isViewMode: boolean;
}

export default function SalaryAdvanceFields({
  advanceAmount,
  setAdvanceAmount,
  paymentMethod,
  setPaymentMethod,
  isPaymentMethodLocked,
  currency,
  setCurrency,
  currencies,
  paymentMethods,
  advanceLimit,
  isLimitLoading,
  isViewMode,
}: Props) {
  const isKES = currency === "KES";
  const currencyChosen = currency !== "";

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = e.target.value;
    setCurrency(selectedCurrency);

    if (selectedCurrency === "KES" || selectedCurrency === "") {
      setPaymentMethod("MPESA");
    } else {
      setPaymentMethod("");
    }
  };

  const filteredPaymentMethods = useMemo(() => {
    if (!currencyChosen) return [];
    return isKES
      ? paymentMethods.filter((pm) => pm.code === "MPESA")
      : paymentMethods.filter((pm) => pm.code !== "MPESA");
  }, [currency, paymentMethods]);

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
          disabled={isViewMode}
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
          disabled={isViewMode}
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
          disabled={isViewMode || isPaymentMethodLocked || !currencyChosen}
          required
        >
          <option value="">-- Select Payment Method --</option>
          {filteredPaymentMethods.map((pm) => (
            <option key={pm.code} value={pm.code}>
              {pm.description}
            </option>
          ))}
        </select>
        {isPaymentMethodLocked && (
          <small className="text-muted">
            Change the currency to unlock payment method
          </small>
        )}
      </div>
    </div>
  );
}

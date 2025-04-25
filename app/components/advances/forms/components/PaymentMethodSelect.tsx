"use client";
import React from "react";

interface Props {
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
}

export default function PaymentMethodSelect({
  paymentMethod,
  setPaymentMethod,
}: Props) {
  return (
    <div className="col-md-4 mb-3">
      <label htmlFor="payment-method" className="form-label">
        Payment Method
      </label>
      <select
        className="form-select"
        id="payment-method"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="Bank">Bank</option>
        <option value="Mpesa">Mpesa</option>
      </select>
    </div>
  );
}

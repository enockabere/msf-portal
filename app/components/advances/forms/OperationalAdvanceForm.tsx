"use client";

import React, { useState, useEffect } from "react";
import "./SalaryAdvanceForm.css";
import OperationalLineForm from "./components/OperationalLineForm";

interface ExpenseItem {
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
  otherCategory?: string;
}

export default function OperationalAdvanceForm() {
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("0");
  const [currency, setCurrency] = useState("KES");
  const [paymentMethod, setPaymentMethod] = useState("Mpesa");
  const [cashCollectionDate, setCashCollectionDate] = useState("");
  const [cashHours, setCashHours] = useState("morning");
  const [idPassportNumber, setIdPassportNumber] = useState("");

  const [accountNo, setAccountNo] = useState("1234567890");
  const [bank, setBank] = useState("Equity Bank");
  const [branch, setBranch] = useState("Westlands");
  const [chequeName, setChequeName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");

  const [phone, setPhone] = useState("712345678");

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  const handleChange = <K extends keyof ExpenseItem>(
    index: number,
    field: K,
    value: ExpenseItem[K]
  ) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...expenses];
    updated[index].receipt = file;
    setExpenses(updated);
  };

  const removeExpenseLine = (index: number) => {
    const updated = [...expenses];
    updated.splice(index, 1);
    setExpenses(updated);
  };

  const addExpenseLine = () => {
    setExpenses((prev) => [
      ...prev,
      {
        category: "",
        amount: NaN,
        receipt: null,
        mileage: "",
        costCenter: "",
        otherCategory: "",
      },
    ]);
  };

  useEffect(() => {
    const total = expenses.reduce(
      (acc, item) => acc + (isNaN(item.amount) ? 0 : item.amount),
      0
    );
    setAmount(total.toString());
  }, [expenses]);

  return (
    <div>
      {/* Display Total Amount Toast */}

      <form className="p-2 pt-3">
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="currency" className="form-label">
              Currency
            </label>
            <select
              id="currency"
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
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
            >
              <option value="Cash">Cash</option>
              <option value="Mpesa">Mpesa</option>
              <option value="Bank">Bank Transfer</option>
            </select>
          </div>

          <div className="col-md-4">
            <div
              className="toast align-items-center text-white bg-danger border-0 show w-100 mt-3 mx-auto"
              role="alert"
            >
              <div className="d-flex">
                <div className="toast-body">
                  <strong>Total Advance:</strong> KES {amount}
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  data-bs-dismiss="toast"
                  aria-label="Close"
                  onClick={() => setAmount("0")}
                ></button>
              </div>
            </div>
          </div>
        </div>

        {paymentMethod === "Cash" && (
          <div className="fade-in">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="cash-collection-date" className="form-label">
                  Cash Collection Date
                </label>
                <input
                  type="date"
                  id="cash-collection-date"
                  className="form-control"
                  value={cashCollectionDate}
                  onChange={(e) => setCashCollectionDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              {cashCollectionDate && (
                <div className="col-md-6 mb-3 fade-in">
                  <label htmlFor="cash-hours" className="form-label">
                    Collection Time
                  </label>
                  <select
                    id="cash-hours"
                    className="form-select"
                    value={cashHours}
                    onChange={(e) => setCashHours(e.target.value)}
                    required
                  >
                    <option value="morning">
                      Morning (8:00 AM - 12:00 PM)
                    </option>
                    <option value="afternoon">
                      Afternoon (1:00 PM - 5:00 PM)
                    </option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {paymentMethod === "Bank" && (
          <div className="fade-in">
            <div className="row">
              <div className="col-md-3 mb-3">
                <label htmlFor="account-no" className="form-label">
                  Account No.
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="account-no"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="bank" className="form-label">
                  Select Bank
                </label>
                <select
                  className="form-select"
                  id="bank"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                >
                  <option>Equity Bank</option>
                  <option>Co-operative Bank</option>
                  <option>NCBA</option>
                </select>
              </div>
              <div className="col-md-5 mb-3">
                <label htmlFor="branch" className="form-label">
                  Select Branch
                </label>
                <select
                  className="form-select"
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option>Westlands</option>
                  <option>Kisumu</option>
                  <option>Nakuru</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="cheque-name" className="form-label">
                  Cheque Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cheque-name"
                  value={chequeName}
                  onChange={(e) => setChequeName(e.target.value)}
                />
              </div>
              <div className="col-6 mb-3">
                <label htmlFor="swift-code" className="form-label">
                  Swift Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="swift-code"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "Mpesa" && (
          <div className="fade-in">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="mpesa-phone" className="form-label">
                  Mpesa Phone Number
                </label>
                <div className="input-group">
                  <span className="input-group-text">+254</span>
                  <input
                    type="tel"
                    className="form-control"
                    id="mpesa-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={9}
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="id-passport" className="form-label">
                  ID/Passport Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="id-passport"
                  value={idPassportNumber}
                  onChange={(e) => setIdPassportNumber(e.target.value)}
                  placeholder="Enter ID or Passport number"
                />
              </div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-md-12 mb-3">
            <label htmlFor="purpose" className="form-label">
              Purpose of the Advance
            </label>
            <input
              type="text"
              id="purpose"
              className="form-control"
              placeholder="e.g. Fuel, petty cash..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
        </div>
      </form>

      {/* Operational Line Table */}
      <div className="mt-3">
        <OperationalLineForm
          expenses={expenses}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          removeExpenseLine={removeExpenseLine}
          addExpenseLine={addExpenseLine}
        />
      </div>
    </div>
  );
}

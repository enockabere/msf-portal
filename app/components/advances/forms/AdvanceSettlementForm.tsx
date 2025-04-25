"use client";

import React, { useState, useEffect } from "react";
import { FileText, LogOut, CheckCircle, CircleXIcon } from "lucide-react";
import SettlementExpenseForm from "./SettlementExpenseForm";

type ExpenseItem = {
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
  deliverer: string;
};

const mockAdvances = [
  { id: "ADV001", label: "Fuel for Project A", balance: 30000 },
  { id: "ADV002", label: "Office Supplies", balance: 18500 },
  { id: "ADV003", label: "Field Visit Allowance", balance: 9800 },
];

export default function AdvanceSettlementForm() {
  const [selectedAdvanceId, setSelectedAdvanceId] = useState(
    mockAdvances[0].id
  );
  const [balance, setBalance] = useState(mockAdvances[0].balance);

  const [justifiedAmount, setJustifiedAmount] = useState(0);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [mileage, setMileage] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [deliverer, setDeliverer] = useState("");

  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      category: "",
      amount: 0,
      receipt: null,
      mileage: "",
      costCenter: "",
      deliverer: "",
    },
  ]);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReceipt(e.target.files[0]);
    }
  };

  useEffect(() => {
    const selected = mockAdvances.find((adv) => adv.id === selectedAdvanceId);
    if (selected) setBalance(selected.balance);
  }, [selectedAdvanceId]);

  return (
    <form className="p-2 pt-3">
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">
            Select Advance to Settle
          </label>
          <select
            className="form-select"
            value={selectedAdvanceId}
            onChange={(e) => setSelectedAdvanceId(e.target.value)}
          >
            {mockAdvances.map((adv) => (
              <option key={adv.id} value={adv.id}>
                {adv.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">
            Balance to be Accounted for
          </label>
          <div className="form-control bg-light">
            {`KES ${balance.toLocaleString()}`}
          </div>
        </div>
      </div>

      <SettlementExpenseForm
        expenses={expenses}
        setExpenses={setExpenses}
        balance={balance}
      />

      <div className="mt-3 d-flex flex-wrap gap-2">
        <button
          type="submit"
          className="btn btn-success d-flex align-items-center gap-2"
        >
          <CheckCircle size={16} /> Submit Settlement
        </button>

        <button
          type="button"
          className="btn btn-danger d-flex align-items-center gap-2"
        >
          <CircleXIcon size={16} /> Cancel
        </button>

        <button
          type="button"
          className="btn btn-outline-primary d-flex align-items-center gap-2"
        >
          <FileText size={16} /> Preview Report
        </button>

        <button
          type="button"
          className="btn btn-secondary d-flex align-items-center gap-2"
        >
          <LogOut size={16} /> Exit
        </button>
      </div>
    </form>
  );
}

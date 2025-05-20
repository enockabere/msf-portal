"use client";

import { useAdvance } from "@/app/context/AdvanceContext";
import React from "react";

interface AdvanceOption {
  id: string;
  description: string;
  amount: number;
}

interface Props {
  selectedAdvanceId: string;
  setSelectedAdvanceId: (id: string) => void;
  setSelectedAmount: (amount: number) => void;
}

export default function AdvanceSettlementHeaderStep() {

  const { actions, formData, expenses, advanceLineSelectedForAccounting } = useAdvance();
  const { dispatcher } = actions;

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected: Record<string, any> = expenses.find((line: Record<string, any>) => line.expenseCode === val);
    dispatcher({
      type: 'SET_ADVANCE_LINE_SELECTED_FOR_ACCOUNTING',
      payload: selected,
    });
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h5 className="mb-3 fw-semibold">Select Advance to Settle</h5>
        <div className="alert alert-info mb-0">
          Settling advance number: <strong>{formData?.no}</strong>
        </div>
        <select
          className="form-select"
          value={advanceLineSelectedForAccounting.expenseCode}
          onChange={handleSelect}
        >
          <option defaultValue={''}>--Selected Advance line--</option>
          {expenses.map((adv: Record<string, any>) => (
            <option key={`${adv?.expenseCode}-${adv?.lineNo}`} value={adv.expenseCode}>
              {adv?.description} (KES {adv?.amountToPay.toLocaleString()})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

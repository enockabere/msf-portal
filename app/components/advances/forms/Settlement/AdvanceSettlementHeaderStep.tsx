"use client";

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
  advanceNo?: string | null;
}

const advances: AdvanceOption[] = [
  { id: "ADV001", description: "Travel Advance to Nairobi", amount: 58300 },
  { id: "ADV002", description: "Training Advance", amount: 42000 },
  { id: "ADV003", description: "Operational Advance", amount: 76000 },
];

export default function AdvanceSettlementHeaderStep({
  selectedAdvanceId,
  setSelectedAdvanceId,
  setSelectedAmount,
  advanceNo,
}: Props) {
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selected = advances.find((a) => a.id === id);
    setSelectedAdvanceId(id);
    setSelectedAmount(selected?.amount || 0);
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h5 className="mb-3 fw-semibold">Select Advance to Settle</h5>
        {advanceNo ? (
          <div className="alert alert-info mb-0">
            Settling advance number: <strong>{advanceNo}</strong>
          </div>
        ) : (
          <>
            <select
              className="form-select"
              value={selectedAdvanceId}
              onChange={handleSelect}
            >
              <option value="">-- Select Advance --</option>
              {advances.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.description} (KES {adv.amount.toLocaleString()})
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}

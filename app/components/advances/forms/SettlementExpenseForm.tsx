"use client";

import React from "react";
import { FileChartColumnIncreasing } from "lucide-react";
import { useAdvance } from "@/app/context/AdvanceContext";
import { useMySetups } from "@/app/context/SetupContext";
import { findObjectFromArray } from "@/app/utils/helpers";

interface Props {
  saveAccountingLine?: (index: number, exp: Record<string, any>) => Promise<void>;
  viewLineAccountingDetails?: (index: number, exp: Record<string, any>) => Promise<void>;
}

export default function SettlementExpenseForm(
  {
    viewLineAccountingDetails
  }: Props
) {
  const { expenses } = useAdvance();
  const { DEPARTMENTS, PROJECT } = useMySetups();

  return (
    <table className="table table-bordered my-3 align-middle">
      <thead className="table-light">
        <tr>
          <th>Category</th>
          <th>Amount Given</th>
          <th>Cost Center</th>
          <th>Project</th>
          <th>Amount Surrendered</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {expenses.map((exp, idx) => (
          <tr key={`${exp?.expenseCode}-${exp?.lineNo}`}>
            <td>{exp.description || exp.expenseCode}</td>
            <td>KES {exp.amountToPay?.toLocaleString()}</td>
            <td>{
              findObjectFromArray(DEPARTMENTS, 'code', exp[
                `shortcutDimension${DEPARTMENTS[0]["globalDimensionNo"]}Code`
              ])?.name as string
            }</td>
            <td>{
              findObjectFromArray(PROJECT, 'code', exp[
                `shortcutDimension${PROJECT[0]["globalDimensionNo"]}Code`
              ])?.name as string
            }</td>
            <td>
              <input
                type="number"
                className="form-control"
                value={exp?.accountedAmount}
                readOnly={true}
              />
            </td>
            <td className="text-center">
              <button
                type="button"
                className="btn btn-sm btn-outline-info mt-2"
                onClick={async () => await viewLineAccountingDetails(idx, exp)}
              >
                <FileChartColumnIncreasing size={16} /> account
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

"use client";

import React, { useState } from "react";
import { UploadCloud, Save } from "lucide-react";
import { ExpenseItem } from "@/app/types/advance";
import { useAdvance } from "@/app/context/AdvanceContext";
import { useMySetups } from "@/app/context/SetupContext";
import { findObjectFromArray } from "@/app/utils/helpers";

interface Props {
  expenses: ExpenseItem[];
  setExpenses: (expenses: ExpenseItem[]) => void;
}

export default function SettlementExpenseForm() {

  const [accountedLines, setAccountedLines] = useState<Record<string, any>[]>([]);
  const { expenses } = useAdvance();
  const { DEPARTMENTS, PROJECT } = useMySetups();

  const handleChange = <K extends keyof ExpenseItem>(
    index: number,
    field: K,
    value: ExpenseItem[K]
  ) => {
    const updated = [...expenses];
    let lineExist = false;
    const draftState = [...accountedLines];
    const newDraftState = draftState.map((line: Record<string, any>) => {
      if (line.DetailedLineMgtLineNo === updated[index].lineNo) {
        lineExist = true;
        return {
          ...line,
          [field]: value,
        };
      } else {
        return line;
      }
    });
    if (!lineExist) {
      newDraftState.push(
        {
          [field]: value,
          description: '',
          DetailedLineMgtDocType: 'Imprest',
          DetailedLineMgtDocNo: updated[index].documentNo,
          DetailedLineMgtLineNo: updated[index].lineNo,
        }
      );
    }
    setAccountedLines(newDraftState);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...expenses];
    updated[index].receipt = file;
    // setExpenses(updated);
  };

  return (
    <table className="table table-bordered my-3 align-middle">
      <thead className="table-light">
        <tr>
          <th>Category</th>
          <th>Amount Given</th>
          <th>Cost Center</th>
          <th>Project</th>
          <th>Upload Receipt</th>
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
              <label className="btn btn-sm btn-outline-secondary w-100">
                <UploadCloud size={14} className="me-1" /> Upload
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={(e) =>
                    handleFileChange(idx, e.target.files?.[0] || null)
                  }
                />
              </label>
            </td>
            <td>
              <input
                type="number"
                className="form-control"
                value={
                  typeof exp.surrenderedAmount === "number" &&
                    !isNaN(exp.surrenderedAmount)
                    ? exp.surrenderedAmount
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    idx,
                    "surrenderedAmount",
                    e.target.value === ""
                      ? undefined
                      : parseFloat(e.target.value)
                  )
                }
                placeholder="Enter amount"
              />
            </td>
            <td className="text-center">
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => console.log("Save row", idx)}
              >
                <Save size={16} /> save
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

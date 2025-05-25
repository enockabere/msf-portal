"use client";

import React from "react";
import { UploadCloud, Save, CheckCheck, Trash2 } from "lucide-react";
import { useAdvance } from "@/app/context/AdvanceContext";
import { findObjectFromArray, safeTypechecker } from "@/app/utils/helpers";
import Swal from "sweetalert2";

interface Props {
    saveAccountingLine?: (index: number, exp: Record<string, any>) => Promise<void>;
    viewLineAccountingDetails?: (index: number, exp: Record<string, any>) => Promise<void>;
    deleteDetailedExpesneLine?: (index: number, exp: Record<string, any>) => Promise<void>;
}

export default function AccountingExpenseDetailsForm(
    {
        saveAccountingLine,
        deleteDetailedExpesneLine
    }: Props
) {
    const { actions, selectedAdvanceLineForViewAccountingDetails, selectedAdvanceLineForView } = useAdvance();
    const { dispatcher } = actions;

    const handleChange = (
        index: number,
        field: string,
        value: any
    ) => {
        if (
            safeTypechecker(index) === 'Null' ||
            safeTypechecker(index) === 'Undefined' ||
            index < 0
        ) return;
        const draftAccountingLines = [...selectedAdvanceLineForViewAccountingDetails];
        const updatedLine = draftAccountingLines[index];
        if (safeTypechecker(updatedLine) === 'Object') {
            updatedLine[field] = Number(value);
            draftAccountingLines.splice(index, 1, updatedLine);
            dispatcher({
                type: 'SET_ACCOUNTING_LINES_FOR_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS',
                payload: draftAccountingLines,
            });
        }
    };

    const handleFileChange = (index: number, file: File | null) => {
        if (
            safeTypechecker(index) === 'Null' ||
            safeTypechecker(index) === 'Undefined' ||
            index < 0
        ) return;
        if (!file) return;
        if (file.size / (1024 * 1024) > 10) {
            Swal.fire('Error!', 'File size is too large (max 10 MB)', 'error');
            return;
        }
        const draftAccountingLines = [...selectedAdvanceLineForViewAccountingDetails];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const changingDraftLine = draftAccountingLines[index];
            const rawBase64 = reader.result as string;
            if (safeTypechecker(changingDraftLine) === 'Object') {
                changingDraftLine['attachment'] = rawBase64.split(',')[1];
                changingDraftLine['attachmentName'] = `${file.name}`;
                draftAccountingLines.splice(index, 1, changingDraftLine);
                dispatcher({
                    type: 'SET_ACCOUNTING_LINES_FOR_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS',
                    payload: draftAccountingLines,
                });
            }
        }

    };


    return (
        <table className="table table-bordered my-3 align-middle">
            <thead className="table-light">
                <tr>
                    <th>Entry No.</th>
                    <th>Upload Receipt</th>
                    <th>Amount Surrendered</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>
                {selectedAdvanceLineForViewAccountingDetails.map((exp: Record<string, any>, idx: number) => (
                    <tr key={`${selectedAdvanceLineForView?.expenseCode}-${selectedAdvanceLineForView?.lineNo}-${exp?.entryNo || idx}`}>
                        <td>#{exp.entryNo?.toLocaleString()}</td>
                        <td>
                            <label className={`btn btn-sm btn-outline-secondary w-100`}>
                                {
                                    exp?.entryNo >= 0 || exp.attachment ?
                                        (
                                            <>
                                                <CheckCheck size={14} className="me-1" /> Uploaded
                                            </>
                                        )
                                        :
                                        (
                                            <>
                                                <UploadCloud size={14} className="me-1" /> Upload
                                            </>
                                        )
                                }

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
                                value={findObjectFromArray(selectedAdvanceLineForViewAccountingDetails, 'entryNo', exp.entryNo)?.amount as string}
                                onChange={(e) =>
                                    handleChange(
                                        idx,
                                        "amount",
                                        e.target.value === ""
                                            ? undefined
                                            : parseFloat(e.target.value)
                                    )
                                }
                                placeholder="Enter amount"
                            />
                        </td>
                        <td className="d-flex justify-content-center align-items-center">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={async () => await saveAccountingLine(idx, exp)}
                            >
                                <Save size={16} /> Save
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-info  ms-2"
                                onClick={async () => await deleteDetailedExpesneLine(idx, exp)}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

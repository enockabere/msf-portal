"use client";

import React from "react";
import { UploadCloud, Save, CheckCheck, Eye, Trash2 } from "lucide-react";
import { ExpenseItem } from "@/app/types/advance";
import { useAdvance } from "@/app/context/AdvanceContext";
import { useMySetups } from "@/app/context/SetupContext";
import { findObjectFromArray, safeTypechecker } from "@/app/utils/helpers";
import Swal from "sweetalert2";

interface Props {
    saveAccountingLine?: (index: number, exp: Record<string, any>) => Promise<void>;
    viewLineAccountingDetails?: (index: number, exp: Record<string, any>) => Promise<void>;
}

export default function AccountingExpenseDetailsForm(
    {
        saveAccountingLine,
        viewLineAccountingDetails
    }: Props
) {
    const { actions, accountedLines, expenses, selectedAdvanceLineForViewAccountingDetails, selectedAdvanceLineForView } = useAdvance();
    const { dispatcher } = actions;

    // const handleChange = <K extends keyof ExpenseItem>(
    //     index: number,
    //     field: K,
    //     value: ExpenseItem[K]
    // ) => {
    //     if (
    //         safeTypechecker(index) === 'Null' ||
    //         safeTypechecker(index) === 'Undefined' ||
    //         index < 0
    //     ) return;
    //     const updated = [...expenses];
    //     let lineExist = false;
    //     const draftState = [...accountedLines];
    //     const newDraftState = draftState.map((line: Record<string, any>) => {
    //         if (line.DetailedLineMgtLineNo === updated[index].lineNo) {
    //             lineExist = true;
    //             return {
    //                 ...line,
    //                 [field]: value,
    //             };
    //         } else {
    //             return line;
    //         }
    //     });
    //     if (!lineExist) {
    //         newDraftState.push(
    //             {
    //                 [field]: value,
    //                 description: '',
    //                 DetailedLineMgtDocType: 'Imprest',
    //                 DetailedLineMgtDocNo: updated[index].documentNo,
    //                 DetailedLineMgtLineNo: updated[index].lineNo,
    //             }
    //         );
    //     }
    //     dispatcher({
    //         type: 'SET_DETAILED_ACCOUNTING_LINES',
    //         payload: newDraftState,
    //     });
    // };

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
        const draftExpenses = [...expenses];
        const reader = new FileReader();
        const attachmentName = `${file.name}`
        reader.readAsDataURL(file);
        reader.onload = () => {
            const changingDraftLine = draftExpenses[index];
            const draftAccountedLinesState = [...accountedLines];
            let itemExist = false;
            const rawBase64 = reader.result as string;
            const newDraftAccountedLinesState = draftAccountedLinesState.map((line: Record<string, any>) => {
                if (line.DetailedLineMgtLineNo === changingDraftLine.lineNo) {
                    itemExist = true;
                    return {
                        ...line,
                        attachment: rawBase64.split(',')[1],
                        attachmentName,
                    }
                }
                return line;
            });

            if (!itemExist) {
                newDraftAccountedLinesState.push({
                    attachment: rawBase64.split(',')[1],
                    attachmentName,
                    description: '',
                    DetailedLineMgtDocType: changingDraftLine.documentType,
                    DetailedLineMgtDocNo: changingDraftLine.documentNo,
                    DetailedLineMgtLineNo: changingDraftLine.lineNo,
                });
            }
            dispatcher({
                type: 'SET_DETAILED_ACCOUNTING_LINES',
                payload: newDraftAccountedLinesState,
            });
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
                    <tr key={`${selectedAdvanceLineForView?.expenseCode}-${selectedAdvanceLineForView?.lineNo}-${exp?.entryNo}`}>
                        <td>#{exp.entryNo?.toLocaleString()}</td>
                        <td>
                            <label className={`btn btn-sm btn-outline-secondary w-100`}>
                                <>
                                    <CheckCheck size={14} className="me-1" /> Uploaded
                                </>

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
                                value={'500'}
                                // value={findObjectFromArray(accountedLines, 'DetailedLineMgtLineNo', exp.lineNo)?.amount as string}
                                // onChange={(e) => console.log("Looging for now!!")
                                //     // handleChange(
                                //     //     idx,
                                //     //     "amount",
                                //     //     e.target.value === ""
                                //     //         ? undefined
                                //     //         : parseFloat(e.target.value)
                                //     // )
                                // }
                                placeholder="Enter amount"
                            />
                        </td>
                        <td className="d-flex justify-content-center align-items-center">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={async () => await saveAccountingLine(idx, exp)}
                            >
                                <Save size={16} /> Update
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-info mt-2"
                                onClick={async () => await viewLineAccountingDetails(idx, exp)}
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

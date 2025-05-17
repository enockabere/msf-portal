import React, { useState } from 'react';
import {patchResource} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import {Save} from "lucide-react";
import {ChecklistItem} from "@/app/types/ChecklistItem";

export default function ChecklistRow({ row, fetchChecklist }: {row: ChecklistItem, fetchChecklist: () => void}) {
    const [expiryDate, setExpiryDate] = useState(
        row.expiryDate === '0001-01-01' ? '' : row.expiryDate
    );
    const [has, setHas] = useState(row.has);

    const handleSubmit = async () => {
        try {
            const payload = {
                checklistItem: row.checklistItem,
                lineNo: row.lineNo,
                checklistType: row.checklistType,
                documentNo: row.documentNo,
                documentType: row.documentType,
                expiryDate,
                has,
            };

            console.log('checklist form data', payload)

            const res = await patchResource('travellerChecklist', {
                data: payload,
                primaryKey: ['documentType', 'documentNo', 'lineNo', 'checklistType', 'checklistItem'],
            });

            if (res.error) {
                return Swal.fire('Error!', res.error.message, 'error');
            }

            Swal.fire('Success', 'Travel checklist updated successfully!', 'success');
            fetchChecklist()
        } catch (err) {
            Swal.fire('Error!', err.message, 'error');
        }
    };

    return (
        <tr>
            <td>{row.checklistItem}. {row.checklistItemDescription}</td>
            <td>
                <input
                    type="date"
                    value={expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setExpiryDate(e.target.value)}
                />
            </td>
            <td>
                <input
                    type="checkbox"
                    checked={has}
                    disabled={row.has === true}
                    onChange={(e) => setHas(e.target.checked)}
                />
            </td>
            <td>
                <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={handleSubmit}
                    title="Save"
                >
                    <Save size={16} />
                </button>
            </td>
        </tr>
    );
}

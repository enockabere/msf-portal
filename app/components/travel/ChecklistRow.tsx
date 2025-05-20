import React, { useState } from 'react';
import {createResource, patchResource} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import {Save} from "lucide-react";
import {ChecklistItem} from "@/app/types/ChecklistItem";

export default function ChecklistRow({ row, fetchChecklist }: {row: ChecklistItem, fetchChecklist: () => void}) {
    const [expiryDate, setExpiryDate] = useState(
        row.expiryDate === '0001-01-01' ? '' : row.expiryDate
    );
    const [has, setHas] = useState(row.has);
    const [base64, setBase64] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const base64String = await toBase64(file);
        setBase64(base64String);

        saveBase64File(base64String, file.name);
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });

    const saveBase64File = async (base64Data: unknown, fileName: string) => {
        // For example, send to backend
        console.log("Saving file:", fileName);
        console.log("Base64:", base64Data);
        const currentDate = new Date().toISOString();

        try {
            const res = await createResource('travelAttachments', {
                data: {
                    relatedRecordId: row.id,
                    no: row.documentNo,
                    lineNo: row.lineNo,
                    documentCode: "",
                    attachment: base64,
                    attachedDate: currentDate,
                }
            })


            if (res.error) {
                Swal.fire(
                    "Error",
                    res.error?.message || "Failed to cancel approval.",
                    "error"
                );
            } else {
                Swal.fire(
                    "Success",
                    "Cancelled approval successfully!",
                    "success"
                );
            }
        } catch (err) {
            Swal.fire("Error", "Error uploading Attachment.", err.message);
        }

    };

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
                {row.renewable ? (
                    <input
                        type="date"
                        value={expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setExpiryDate(e.target.value)}
                    />
                ) : (
                    <p className="text-center">N/A</p>
                )}

            </td>
            <td>
                {!row.requiresAttachment ? (
                    <input
                        type="file"
                        checked={has}
                        onChange={handleFileChange}
                    />
                ) : (
                  <p className="text-center">N/A</p>
                )}
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

import React, { useState } from 'react';
import { createResource, deleteResource, getResource, patchResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { Save } from "lucide-react";
import { ChecklistItem } from "@/app/types/ChecklistItem";

export default function ChecklistRow({ row, fetchChecklist }: { row: ChecklistItem, fetchChecklist: () => void }) {
    const [expiryDate, setExpiryDate] = useState(row.expiryDate === '0001-01-01' ? '' : row.expiryDate);
    const [has, setHas] = useState(row.has);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const base64String = await toBase64(file);
        await saveBase64File(base64String);
    };

    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

    const saveBase64File = async (base64Data: string | null) => {
        if (!base64Data || typeof base64Data !== 'string') {
            Swal.fire("Error", "Invalid base64 data.", "error");
            return;
        }

        const base64Only = base64Data.split(',')[1];
        const currentDate = new Date().toISOString();

        setLoading(true);
        try {
            const { value = [] } = await getResource('travelAttachments', {
                params: {
                    filters: { no: row.documentNo, lineNo: 0 },
                    "$select": "keyID"
                }
            });

            if (value.length) {
                await deleteResource('travelAttachments', {
                    data: { keyID: value[0].keyID },
                    primaryKey: ['keyID']
                });
            }

            const res = await createResource('travelAttachments', {
                data: {
                    relatedRecordId: row.id,
                    no: row.documentNo,
                    lineNo: row.lineNo,
                    documentCode: row.relatedDocumentCode,
                    attachment: base64Only,
                    attachedDate: currentDate,
                }
            });

            if (res.error) throw new Error(res.error.message);

            Swal.fire("Success", "Attachment uploaded successfully!", "success");
        } catch (err: any) {
            Swal.fire("Error", err.message || "Unknown error", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                checklistItem: row.checklistItem,
                lineNo: row.lineNo,
                checklistType: row.checklistType,
                documentNo: row.documentNo,
                documentType: row.documentType,
                documentCode: row.relatedDocumentCode,
                has,
                ...(expiryDate && { expiryDate }),
            };

            const res = await patchResource('travellerChecklist', {
                data: payload,
                primaryKey: ['documentType', 'documentNo', 'lineNo', 'checklistType', 'checklistItem'],
            });

            if (res.error) {
                Swal.fire('Error!', res.error.message, 'error');
            } else {
                Swal.fire('Success', 'Travel checklist updated successfully!', 'success');
                fetchChecklist();
            }
        } catch (err: any) {
            Swal.fire('Error!', err.message, 'error');
        } finally {
            setLoading(false);
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
                        disabled={loading}
                    />
                ) : (
                    <p className="text-center">N/A</p>
                )}
            </td>
            <td>
                {row.requiresAttachment ? (
                    <input
                        type="file"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                ) : (
                    <p className="text-center">N/A</p>
                )}
            </td>
            <td>
                <input
                    type="checkbox"
                    checked={has}
                    disabled={row.has === true || loading}
                    onChange={(e) => setHas(e.target.checked)}
                />
            </td>
            <td>
                <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={handleSubmit}
                    title="Save"
                    disabled={loading}
                >
                    {loading ? <span className="spinner-border spinner-border-sm me-1" /> : <Save size={16} />}
                </button>
            </td>
        </tr>
    );
}

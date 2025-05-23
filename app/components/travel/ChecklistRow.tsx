import React, { useState } from 'react';
import {createResource, deleteResource, getResource, patchResource} from "@/app/lib/api/http";
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

    type Base64String = string | unknown | null;


    const saveBase64File = async (
        base64Data: Base64String,
        fileName: string,
    ) => {
        if (!base64Data || typeof base64Data !== 'string') {
            Swal.fire("Error", "Invalid base64 data.", "error");
            return;
        }

        const base64Only = base64Data.split(',')[1];
        const currentDate = new Date().toISOString();

        try {
            const getAttachment = await getResource('travelAttachments', {
                params: {
                    filters: {
                        no: 'NRTR001',
                        lineNo: 0,
                    },
                    "$select": "keyID"
                }
            });

            if (getAttachment?.value?.length) {
                await deleteResource('travelAttachments', {
                    data: { keyID: getAttachment.value[0].keyID },
                    primaryKey: ['keyID']
                });
            }

            const res = await createResource('travelAttachments', {
                data: {
                    relatedRecordId: row.id,
                    no: row.documentNo	,
                    lineNo: row.lineNo,
                    documentCode: row.relatedDocumentCode,
                    attachment: base64Only,
                    attachedDate: currentDate,
                }
            });

            if (res.error) {
                throw new Error(res.error.message);
            }

            Swal.fire("Success", "Attachment uploaded successfully!", "success");

        } catch (err: any) {
            Swal.fire("Error", "Error uploading Attachment.", err.message || "Unknown error");
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
                has,
                ...(expiryDate !== '' && { expiryDate }),
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
                {row.requiresAttachment ? (
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

import React, { useState } from 'react';
import { createResource, deleteResource, getResource, patchResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { Save } from "lucide-react";
import { ChecklistItem } from "@/app/types/ChecklistItem";
import SectionLoader from "@/app/components/loaders/SectionLoader";

interface FileAttachment {
    no: string;
    lineNo: number;
    documentCode: string;
    attachment: string;
    attachedDate: string;
}

export default function ChecklistRow({ row, fetchChecklist }: { row: ChecklistItem, fetchChecklist: () => void }) {
    const [has, setHas] = useState(row.has);
    const [loading, setLoading] = useState(false);

    // File conversion utility
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // Handle file upload process
    const handleFileUpload = async (file: File) => {
        try {
            const base64String = await fileToBase64(file);
            const base64Data = base64String.split(',')[1];

            if (!base64Data) {
                throw new Error("Invalid file data");
            }

            await manageAttachment({
                no: row.documentNo,
                lineNo: row.lineNo,
                documentCode: row.relatedDocumentCode,
                attachment: base64Data,
                attachedDate: new Date().toISOString(),
                relatedRecordId: row.id
            });

            Swal.fire("Success", "Attachment uploaded successfully!", "success");
        } catch (error) {
            const message = error instanceof Error ? error.message : "File upload failed";
            Swal.fire("Error", message, "error");
        }
    };

    // Manage attachment lifecycle (delete old, create new)
    const manageAttachment = async (attachmentData: FileAttachment & { relatedRecordId: string }) => {
        setLoading(true);
        try {
            // Check for existing attachment
            const { value = [] } = await getResource('travelAttachments', {
                params: {
                    filters: { no: row.documentNo, lineNo: 0 },
                    "$select": "keyID"
                }
            });

            // Delete existing if found
            if (value.length) {
                await deleteResource('travelAttachments', {
                    data: { keyID: value[0].keyID },
                    primaryKey: ['keyID']
                });
            }

            // Create new attachment
            const res = await createResource('travelAttachments', {
                data: attachmentData
            });

            if (res.error) {
                throw new Error(res.error.message);
            }
        } catch (error: any) {
            Swal.fire('Error saving attachment', error.message, 'error')
        } finally {
            setLoading(false);
        }
    };

    // Handle file input change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await handleFileUpload(file);
    };

    // Submit checklist updates
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                checklistItem: row.checklistItem,
                lineNo: row.lineNo,
                checklistType: row.checklistType,
                documentNo: row.documentNo,
                documentType: row.documentType,
                has: has,
            };

            const res = await patchResource('travellerChecklist', {
                data: payload,
                primaryKey: ['documentType', 'documentNo', 'lineNo', 'checklistType', 'checklistItem'],
            });

            if (res.error) {
                throw new Error(res.error.message);
            }

            Swal.fire('Success', 'Travel checklist updated successfully!', 'success');
            fetchChecklist();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Update failed";
            Swal.fire('Error!', message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
      <tr>
          <td>{row.checklistItemDescription}</td>
          <td>
              {row.requiresAttachment ? (
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={loading}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-control form-control-sm"
                />
              ) : (
                <span className="text-muted">N/A</span>
              )}
          </td>
          <td className="text-center">
              <input
                type="checkbox"
                checked={has}
                disabled={row.verified || loading}
                onChange={(e) => setHas(e.target.checked)}
                className="form-check-input"
              />
          </td>
          <td>
              <button
                type="button"
                className="btn btn-outline-success btn-sm"
                onClick={handleSubmit}
                disabled={loading}
                aria-label="Save checklist item"
              >
                  {loading ? (
                    <SectionLoader size={16} classes={'button-icon'}/>
                  ) : (
                    <Save size={16} className="me-1" />
                  )}
                  Save
              </button>
          </td>
      </tr>
    );
}
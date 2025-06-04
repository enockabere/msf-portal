import React, { useEffect, useState, useCallback } from 'react';
import { createResource, deleteResource, getResource, patchResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { XCircle } from "lucide-react";
import { ChecklistItem } from "@/app/types/ChecklistItem";
import SectionLoader from "@/app/components/loaders/SectionLoader";
import { downloadFileFromBase64 } from "@/app/utils/downloadBas64";

interface FileAttachment {
  no: string;
  lineNo: number;
  documentCode: string;
  attachment: string;
  attachedDate: string;
  relatedRecordId: string;
}

interface AttachmentRecord extends Record<string, any> {
  keyID: string;
}

export default function ChecklistRow({ row }: { row: ChecklistItem }) {
  const [formData, setFormData] = useState<ChecklistItem>({ ...row });
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoized file conversion utility
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  // Handle success messages with timeout
  const showSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message);
    const timer = setTimeout(() => setSuccessMessage(''), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Manage attachment lifecycle (delete old, create new)
  const manageAttachment = useCallback(async (attachmentData: FileAttachment) => {
    setLoading(true);
    try {
      const res = await createResource('travelAttachments', {
        data: attachmentData
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      if (res) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { attachment, ...savedFile } = res;
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, savedFile],
        }));
        showSuccessMessage("Saved!");
      } else {
        throw new Error("No attachment was saved. Please try again.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error saving attachment";
      Swal.fire('Error', message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSuccessMessage]);

  // Handle file upload process
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const base64String = await fileToBase64(file);
      const base64Data = base64String.split(",")[1];

      if (!base64Data) {
        throw new Error("Invalid file data");
      }

      await manageAttachment({
        no: row.documentNo,
        lineNo: row.lineNo,
        documentCode: row.relatedDocumentCode,
        attachment: base64Data,
        attachedDate: new Date().toISOString(),
        relatedRecordId: row.id,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "File upload failed";
      Swal.fire("Error", message, "error");
    }
  }, [fileToBase64, manageAttachment, row]);

  // Handle file input change
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file);
  }, [handleFileUpload]);

  // Submit checklist updates
  const handleSubmit = useCallback(async (has: boolean) => {
    setFormData(prev => ({ ...prev, has }));
    setLoading(true);

    try {
      const payload = {
        checklistItem: row.checklistItem,
        lineNo: row.lineNo,
        checklistType: row.checklistType,
        documentNo: row.documentNo,
        documentType: row.documentType,
        has,
      };

      const res = await patchResource("travellerChecklist", {
        data: payload,
        primaryKey: [
          "documentType",
          "documentNo",
          "lineNo",
          "checklistType",
          "checklistItem",
        ],
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      showSuccessMessage("Saved!");
    } catch (error: unknown) {
      setFormData(prev => ({ ...prev, has: !has }));
      const message = error instanceof Error ? error.message : "Update failed";
      Swal.fire('Error', message, 'error');
    } finally {
      setLoading(false);
    }
  }, [row, showSuccessMessage]);

  const handleDeleteAttachment = useCallback(async (attachment: AttachmentRecord) => {
    try {
      setLoading(true);
      const res = await deleteResource('travelAttachments', {
        data: { keyID: attachment.keyID },
        primaryKey: ['keyID']
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(
          (file: AttachmentRecord) => file.keyID !== attachment.keyID
        )
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error deleting attachment";
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleViewAttachment = useCallback(async (attachment: AttachmentRecord) => {
    try {
      setLoading(true);
      const res = await getResource('travelAttachments', {
        params: {
          filters: { keyID: attachment.keyID }
        }
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      const file = res.value[0];
      await downloadFileFromBase64(file.attachment, file.documentCode);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error opening attachment";
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const renderAttachmentControls = () => {
    if (!formData.requiresAttachment) {
      return <span className="text-muted">N/A</span>;
    }

    if (formData.attachments.length === 0) {
      return (
        <input
          type="file"
          onChange={handleFileChange}
          disabled={loading}
          accept=".pdf,.jpg,.jpeg,.png"
          className="form-control form-control-sm"
        />
      );
    }

    return formData.attachments.map((attachment: AttachmentRecord) => (
      <div key={attachment.keyID} className="btn-group">
        <button
          type="button"
          onClick={() => handleViewAttachment(attachment)}
          className="btn btn-outline-danger btn-sm"
          title="Download attachment"
        >
          Attached File
        </button>
        {!formData.has && (
          <button
            type="button"
            onClick={() => handleDeleteAttachment(attachment)}
            className="btn btn-danger dropdown-toggle dropdown-toggle-split"
            title="Delete attachment"
          >
            <XCircle size={16} />
          </button>
        )}
      </div>
    ));
  };

  return (
    <tr>
      <td>{formData.checklistItemDescription}</td>
      <td>{renderAttachmentControls()}</td>
      <td className="text-end">
        {loading && <SectionLoader size={16} classes={'button-icon'} />}
        {successMessage && <span className="text-success fs-6 mx-1">{successMessage}</span>}

        <input
          type="checkbox"
          checked={formData.has}
          disabled={formData.verified || loading}
          onChange={(e) => handleSubmit(e.target.checked)}
          className="form-check-input"
        />
      </td>
    </tr>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  File as FileIcon,
  FileText,
  Image,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  createResource,
  getResource,
  deleteResource,
} from "@/app/lib/api/http";
import { toast } from "react-toastify";
import "./upload.css";

interface ConfirmedEtaUploadProps {
  status: string;
  travelId: string;
  travelNo: string;
}

interface UploadedFile {
  id: string;
  name: string;
  uploadedAt: string;
  type: string;
  base64: string;
  keyID: string;
  no: string;
  lineNo: number;
}

const ConfirmedEtaUpload: React.FC<ConfirmedEtaUploadProps> = ({
  status,
  travelId,
  travelNo,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await getResource("travel_attachments", {
        params: { filters: { no: travelNo } },
      });

      if (res.error) {
        toast.error(res.error.message);
        return;
      }

      const files = res.value.map((item: any) => ({
        id: item.recordGuid || crypto.randomUUID(),
        name: item.documentCode,
        uploadedAt: item.createdAt || new Date().toISOString(),
        type: item.attachmentMimeType || "application/octet-stream",
        base64: item.attachment,
        keyID: item.keyID,
        no: item.no,
        lineNo: item.lineNo,
      }));

      setUploadedFiles(files);
    } catch {
      toast.error("Failed to load attachments");
    }
  }, [travelNo]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (status !== "Open") {
        Swal.fire(
          "Upload not allowed",
          "This request is not editable.",
          "error"
        );
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];

        const payload = {
          relatedRecordId: travelId,
          no: travelNo,
          documentCode: "PASSPORT PHOTO",
          attachment: base64,
        };

        Swal.fire({ title: "Uploading...", didOpen: () => Swal.showLoading() });

        try {
          const res = await createResource("travel_attachments", {
            data: payload,
          });

          if (res.error) {
            Swal.close();
            Swal.fire("Error", res.error.message, "error");
            return;
          }

          await fetchAttachments();
          Swal.close();
          Swal.fire({
            title: "Upload Successful",
            text: `${file.name} uploaded.`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch {
          Swal.close();
          Swal.fire("Error", "Upload failed", "error");
        }
      };

      reader.readAsDataURL(file);
    },
    [status, travelId, travelNo, fetchAttachments]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [], "image/*": [] },
    multiple: false,
  });

  const handleDownload = async (file: UploadedFile) => {
    Swal.fire({ title: "Downloading...", didOpen: () => Swal.showLoading() });

    try {
      const byteString = atob(file.base64 || "");
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: file.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);

      Swal.close();
    } catch {
      Swal.close();
      toast.error("Failed to download the file");
    }
  };

  const handleDelete = (file: UploadedFile) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete ${file.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "Deleting...", didOpen: () => Swal.showLoading() });

        try {
          const res = await deleteResource("travel_attachments", {
            primaryKey: ["keyID"],
            data: {
              keyID: file.keyID,
              no: file.no,
              lineNo: file.lineNo,
            },
          });

          if (res.error) {
            Swal.close();
            toast.error(res.error.message);
            return;
          }

          setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
          Swal.close();
          Swal.fire("Deleted!", "Your file has been removed.", "success");
        } catch {
          Swal.close();
          toast.error("Failed to delete the file");
        }
      }
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/"))
      return <Image size={24} className="text-info" />;
    if (fileType === "application/pdf")
      return <FileText size={24} className="text-danger" />;
    return <FileIcon size={24} className="text-primary" />;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString() +
    " " +
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="upload-container">
      <div className="upload-info">
        <AlertCircle size={20} className="text-primary" />
        <p className="upload-info-text">
          Upload travel ticket (PDF or image). Request must be{" "}
          <strong>Open</strong>.
        </p>
      </div>

      <div
        {...getRootProps({
          className: `dropzone ${isDragActive ? "active" : ""} ${
            dragOver ? "drag-over" : ""
          }`,
          onDragEnter: () => setDragOver(true),
          onDragLeave: () => setDragOver(false),
          onDrop: () => setDragOver(false),
        })}
      >
        <input {...getInputProps()} disabled={status !== "Open"} />
        <UploadCloud className="dropzone-icon" size={48} />
        <p className="dropzone-text">
          {status === "Open"
            ? "Drag & drop or click to upload"
            : "Upload not allowed – request is not editable"}
        </p>
        {status === "Open" && (
          <p className="dropzone-subtext">PDF, JPG, PNG supported</p>
        )}
      </div>

      <div className="file-list">
        {uploadedFiles.length > 0 ? (
          <>
            <div className="file-list-header">
              Uploaded Documents ({uploadedFiles.length})
            </div>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-icon">{getFileIcon(file.type)}</div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span>Uploaded: {formatDate(file.uploadedAt)}</span>
                  </div>
                </div>
                <div className="file-actions">
                  <button
                    type="button"
                    className="btn-icon btn-download"
                    onClick={() => handleDownload(file)}
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(file)}
                    disabled={status !== "Open"}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="file-list-empty">No files uploaded yet</div>
        )}
      </div>
    </div>
  );
};

export default ConfirmedEtaUpload;

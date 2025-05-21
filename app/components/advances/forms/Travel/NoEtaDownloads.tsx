"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  DownloadCloud,
  FileText,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  Info,
} from "lucide-react";
import "./download.css";
import { getResource } from "@/app/lib/api/http";

interface NoEtaDownloadsProps {
  primaryKey: { no: string; documentType: string };
}

interface DocumentStatus {
  loi: "idle" | "loading" | "success" | "error";
  voucher: "idle" | "loading" | "success" | "error";
}

const NoEtaDownloads: React.FC<NoEtaDownloadsProps> = ({ primaryKey }) => {
  const [downloadStatus, setDownloadStatus] = useState<DocumentStatus>({
    loi: "idle",
    voucher: "idle",
  });

  const [downloadTimestamps, setDownloadTimestamps] = useState<{
    loi?: Date;
    voucher?: Date;
  }>({});

  const handleDownloadLOI = async () => {
    try {
      setDownloadStatus((prev) => ({ ...prev, loi: "loading" }));

      Swal.fire({
        title: "Preparing Document...",
        text: "Generating your Letter of Invitation",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      const docTypeMap: Record<string, string> = {
        Employee: "0",
        Visitor: "1",
        "Non-Resident": "2",
      };

      const docType = docTypeMap[primaryKey.documentType] || "1";

      const res = await fetch("/api/codeunit/travel/getLetterOfInvitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          docNo: primaryKey.no,
        }),
      });

      const data = await res.json();
      if (data?.error) {
        throw new Error(data.error.message || "Unknown error from codeunit");
      }

      if (!data?.downloadUrl) {
        throw new Error("Missing download URL in response.");
      }

      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${data.downloadUrl}`;
      link.download = `LetterOfInvitation_${primaryKey.no}.pdf`;
      link.target = "_self";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus((prev) => ({ ...prev, loi: "success" }));
      setDownloadTimestamps((prev) => ({ ...prev, loi: new Date() }));

      Swal.fire({
        icon: "success",
        title: "Downloaded Successfully",
        text: "Your Letter of Invitation has been downloaded.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setDownloadStatus((prev) => ({ ...prev, loi: "error" }));
      Swal.fire("Error", err.message || "Unexpected error occurred", "error");
    }
  };

  const handleDownloadVoucher = async () => {
    try {
      setDownloadStatus((prev) => ({ ...prev, voucher: "loading" }));

      Swal.fire({
        title: "Preparing Document...",
        text: "Fetching your Accommodation Voucher",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      const res = await getResource("travel_attachments", {
        params: {
          filters: {
            no: "primaryKey.no",
          },
        },
      });

      if (res.error || !Array.isArray(res.value) || res.value.length === 0) {
        throw new Error("No attachment found for voucher");
      }

      const base64 = res.value[0].attachment;

      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = `AccommodationVoucher_${primaryKey.no}.pdf`;
      link.target = "_self";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus((prev) => ({ ...prev, voucher: "success" }));
      setDownloadTimestamps((prev) => ({ ...prev, voucher: new Date() }));

      Swal.fire({
        icon: "success",
        title: "Downloaded Successfully",
        text: "Your Accommodation Voucher has been downloaded.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setDownloadStatus((prev) => ({ ...prev, voucher: "error" }));
      Swal.fire("Error", err.message || "Download failed", "error");
    }
  };

  const formatTimestamp = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle size={18} className="text-success" />;
      case "error":
        return <AlertTriangle size={18} className="text-danger" />;
      case "loading":
        return <Clock size={18} className="text-warning" />;
      default:
        return null;
    }
  };

  return (
    <div className="travel-documents-container">
      <div className="info-alert">
        <AlertTriangle size={24} className="text-warning" />
        <div className="info-alert-content">
          <p className="info-alert-text">
            Please download and print all the following documents before your
            travel. You must present these documents to immigration authorities
            upon arrival.
          </p>
        </div>
      </div>

      <div className="documents-grid">
        <div className="document-card">
          <div
            className="document-icon"
            style={{ background: "rgba(52, 152, 219, 0.1)", color: "#ff0000" }}
          >
            <FileText size={28} />
          </div>
          <h3 className="document-title">Letter of Invitation</h3>
          <p className="document-description">
            Official document confirming you've been invited. Required for visa
            processing.
          </p>
          <button
            className="btn btn-download btn-primary-custom"
            onClick={handleDownloadLOI}
            disabled={downloadStatus.loi === "loading"}
          >
            {downloadStatus.loi === "loading" ? (
              <>
                <div className="loading-spinner"></div> Generating...
              </>
            ) : (
              <>
                <DownloadCloud size={18} /> Download Letter of Invitation
              </>
            )}
          </button>
          <div className="document-footer">
            <div className="download-status">
              {getStatusIcon(downloadStatus.loi)}
              <span className={`status-text status-${downloadStatus.loi}`}>
                {downloadStatus.loi === "success"
                  ? "Downloaded"
                  : downloadStatus.loi === "error"
                  ? "Download Failed"
                  : downloadStatus.loi === "loading"
                  ? "Downloading..."
                  : "Not Downloaded"}
              </span>
            </div>
            {downloadTimestamps.loi && (
              <div className="document-timestamp">
                {formatTimestamp(downloadTimestamps.loi)}
              </div>
            )}
          </div>
        </div>
        <div className="document-card">
          <div
            className="document-icon"
            style={{ background: "rgba(46, 204, 113, 0.1)", color: "#2ecc71" }}
          >
            <Building size={28} />
          </div>
          <h3 className="document-title">Accommodation Voucher</h3>
          <p className="document-description">
            Proof of accommodation arrangements during your stay.
          </p>
          <button
            className="btn btn-download btn-primary-custom"
            onClick={handleDownloadVoucher}
            disabled={downloadStatus.voucher === "loading"}
          >
            {downloadStatus.voucher === "loading" ? (
              <>
                <div className="loading-spinner"></div> Generating...
              </>
            ) : (
              <>
                <DownloadCloud size={18} /> Download Accommodation Voucher
              </>
            )}
          </button>
          <div className="document-footer">
            <div className="download-status">
              {getStatusIcon(downloadStatus.voucher)}
              <span className={`status-text status-${downloadStatus.voucher}`}>
                {downloadStatus.voucher === "success"
                  ? "Downloaded"
                  : downloadStatus.voucher === "error"
                  ? "Download Failed"
                  : downloadStatus.voucher === "loading"
                  ? "Downloading..."
                  : "Not Downloaded"}
              </span>
            </div>
            {downloadTimestamps.voucher && (
              <div className="document-timestamp">
                {formatTimestamp(downloadTimestamps.voucher)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-top">
        <div className="d-flex align-items-start gap-2">
          <Info size={18} className="text-muted mt-1" />
          <p className="text-muted small mb-0">
            Documents will download as PDF files. If you encounter any issues
            during download, please refresh the page or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoEtaDownloads;

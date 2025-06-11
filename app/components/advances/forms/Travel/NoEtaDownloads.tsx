"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { DownloadCloud, FileText, Building, X } from "lucide-react";
import { getResource, codeUnit } from "../../../../lib/api/http";
import "./download.css";

interface NoEtaDownloadsProps {
  primaryKey: { no: string; documentType: string };
  requireETA?: boolean;
  compact?: boolean;
}

interface DownloadStatus {
  loi: "idle" | "loading" | "success" | "error";
  voucher: "idle" | "loading" | "success" | "error";
}

const NoEtaDownloads: React.FC<NoEtaDownloadsProps> = ({
  primaryKey,
  requireETA,
  compact = false,
}) => {
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({
    loi: "idle",
    voucher: "idle",
  });
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  const handleDownloadLOI = async () => {
    try {
      setDownloadStatus((prev) => ({ ...prev, loi: "loading" }));

      Swal.fire({
        title: "Preparing Documents...",
        text: "Generating your Letters of Invitation",
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
      const docNo = primaryKey.no;

      const codeUnits: {
        method: "getLetterOfInvitation1" | "getLetterOfInvitation2";
        filename: string;
      }[] = [
        {
          method: "getLetterOfInvitation1",
          filename: `LetterOfInvitation1_${docNo}.pdf`,
        },
        {
          method: "getLetterOfInvitation2",
          filename: `LetterOfInvitation2_${docNo}.pdf`,
        },
      ];

      for (const { method, filename } of codeUnits) {
        const res = await codeUnit(method, {
          data: { docType, docNo },
        });

        if (res?.error)
          throw new Error(`Error from ${method}: ${res.error.message}`);
        if (!res?.value) throw new Error(`No response value from ${method}`);

        const base64 = res.value;

        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${base64}`;
        link.download = filename;
        link.target = "_self";
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadStatus((prev) => ({ ...prev, loi: "success" }));

      Swal.fire({
        icon: "success",
        title: "Download Complete",
        text: "Both Letters of Invitation have been downloaded.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      setDownloadStatus((prev) => ({ ...prev, loi: "error" }));
      Swal.fire(
        "Download Failed",
        error.message || "An error occurred",
        "error"
      );
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
            no: primaryKey.no,
            documentCode: "AV",
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

  return (
    <div className={`no-eta-downloads ${compact ? "compact" : ""}`}>
      {!requireETA && showInfoAlert && (
        <div className="info-alert">
          <div className="alert-content">
            <p>
              Please download and print these documents before your travel. You
              must present them to immigration authorities.
            </p>
          </div>
          <button
            className="alert-close"
            onClick={() => setShowInfoAlert(false)}
            aria-label="Close alert"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="documents-grid">
        <div className="document-card">
          <div className="card-icon bg-primary-light">
            <FileText size={compact ? 16 : 20} />
          </div>
          <div className="card-content">
            <h3 className="card-title">Letter of Invitation</h3>
            <p className="card-description">
              Official document confirming your invitation
            </p>
            <button
              className={`download-btn ${
                downloadStatus.loi === "loading" ? "loading" : ""
              }`}
              onClick={handleDownloadLOI}
              disabled={downloadStatus.loi === "loading"}
            >
              {downloadStatus.loi === "loading" ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <DownloadCloud size={compact ? 14 : 16} />
                  Download
                </>
              )}
            </button>
          </div>
        </div>

        <div className="document-card">
          <div className="card-icon bg-success-light">
            <Building size={compact ? 16 : 20} />
          </div>
          <div className="card-content">
            <h3 className="card-title">Accommodation Voucher</h3>
            <p className="card-description">
              Proof of accommodation arrangements
            </p>
            <button
              className={`download-btn ${
                downloadStatus.voucher === "loading" ? "loading" : ""
              }`}
              onClick={handleDownloadVoucher}
              disabled={downloadStatus.voucher === "loading"}
            >
              {downloadStatus.voucher === "loading" ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <DownloadCloud size={compact ? 14 : 16} />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoEtaDownloads;

"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { getResource } from "../../../../lib/api/http";
import {
  DownloadCloud,
  Gift,
  Sparkles,
  FileText,
  CheckCircle,
} from "lucide-react";

interface WelcomePackageModalProps {
  no: string;
  show: boolean;
  onHide: () => void;
}

export default function WelcomePackageModal({
  no,
  show,
  onHide,
}: WelcomePackageModalProps) {
  const [loading, setLoading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes popUp {
        from {
          transform: scale(0.95);
          opacity: 0.5;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
  
      @keyframes shimmer {
        0% { background-position: -100% 0; }
        100% { background-position: 100% 0; }
      }
    `;
    document.head.appendChild(style);

    // ✅ Proper cleanup function to remove the style tag
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleDownload = async () => {
    try {
      setLoading(true);

      Swal.fire({
        title: "Preparing Your Welcome Package",
        text: "Please wait while we generate your personalized document...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      const res = await getResource("travel_attachments", {
        params: {
          filters: {
            no,
            documentCode: "WP",
          },
        },
      });

      if (res.error || !Array.isArray(res.value) || res.value.length === 0) {
        throw new Error("No attachment found for Welcome Package");
      }

      const base64 = res.value[0].attachment;
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = `WelcomePackage_${no}.pdf`;
      link.target = "_self";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 3000);

      Swal.fire({
        icon: "success",
        title: "Download Complete!",
        text: "Your Welcome Package has been successfully downloaded.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      onHide();
    } catch (err: any) {
      Swal.fire(
        "Download Failed",
        err.message || "Unable to download your Welcome Package.",
        "error"
      );

      onHide();
    } finally {
      setLoading(false);
    }
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "1rem",
    padding: "1.5rem",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
    animation: "popUp 0.4s ease-in-out",
    transform: "scale(1)",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: downloadComplete ? "#198754" : "#dc3545", // green/red
    color: "white",
    border: "none",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    borderRadius: "0.75rem",
    padding: "1rem",
    cursor: loading ? "not-allowed" : "pointer",
    transform: isHovered ? "scale(1.02)" : "scale(1)",
    transition: "transform 0.3s ease",
    position: "relative",
    overflow: "hidden",
  };

  const shimmerStyle: React.CSSProperties = {
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
    animation: "shimmer 2s infinite",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
    backgroundSize: "200% 100%",
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      dialogClassName=""
      contentClassName=""
      style={{ zIndex: 1060 }}
    >
      <div style={modalContentStyle}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h5 className="fw-bold text-danger">🎁 Welcome Package</h5>
          <button
            onClick={onHide}
            style={{ background: "none", border: "none", fontSize: "1.25rem" }}
          >
            ×
          </button>
        </div>

        <div
          style={cardStyle}
          onClick={!loading ? handleDownload : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered && <div style={shimmerStyle} />}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="d-flex align-items-center gap-4">
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.3s ease",
                  transform:
                    isHovered && !loading ? "scale(1.1) rotate(12deg)" : "none",
                }}
              >
                {loading ? (
                  <Spinner animation="border" variant="light" />
                ) : downloadComplete ? (
                  <CheckCircle size={32} />
                ) : (
                  <Gift size={32} />
                )}
              </div>

              <div className="flex-grow-1">
                <h5 className="mb-2 d-flex align-items-center">
                  <Sparkles size={16} className="me-2 text-warning" />
                  {downloadComplete ? "Download Complete!" : "Welcome Package"}
                </h5>
                <p className="mb-3">
                  {loading
                    ? "Preparing your personalized document..."
                    : downloadComplete
                    ? "Your package has been downloaded successfully"
                    : "Get your personalized welcome package with all essential information"}
                </p>

                <Button
                  variant="light"
                  className="fw-semibold text-dark px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Generating...
                    </>
                  ) : downloadComplete ? (
                    <>
                      <CheckCircle size={16} className="me-2" />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <DownloadCloud size={16} className="me-2" />
                      Download Package
                    </>
                  )}
                </Button>
              </div>
            </div>

            {loading && (
              <div className="mt-3">
                <div
                  style={{
                    height: "6px",
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.3)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#fff",
                      animation: "progress 2s linear infinite",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              opacity: 0.2,
            }}
          >
            <FileText size={20} />
          </div>
        </div>

        <div className="text-center mt-3">
          <small style={{ color: "#6c757d" }}>
            Package ID: <code>{no}</code>
          </small>
        </div>
      </div>
    </Modal>
  );
}

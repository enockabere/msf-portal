"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../error.css";

export default function Custom500() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => router.push("/"), 10000);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [router]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleContactSupport = () => {
    // Replace with your support email or contact page
    window.location.href = "mailto:support@yourcompany.com";
  };

  return (
    <>
      <div className="error-container d-flex align-items-center justify-content-center">
        <div className="glass-card p-4 text-center">
          <div className="error-icon">
            <i
              className="fas fa-exclamation-triangle"
              style={{ fontSize: "2rem", color: "white" }}
            ></i>
          </div>
          <h1 className="error-number">500</h1>
          <h2 className="h4 text-white mb-2 fw-bold">Internal Server Error</h2>
          <div className="error-details mb-3">
            <p className="mb-1" style={{ fontSize: "0.95rem" }}>
              Something went wrong on our end.
            </p>
            <p className="error-subtitle mb-0">
              Our team is working to fix this issue.
            </p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center align-items-center mb-3">
            <button
              className="btn btn-modern text-white"
              onClick={handleRefresh}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Try Again
            </button>

            <button className="btn btn-outline-modern" onClick={handleGoHome}>
              <i className="fas fa-home me-1"></i>
              Go Home
            </button>
          </div>
          <div className="mb-2">
            <button className="btn btn-ghost" onClick={handleContactSupport}>
              <i className="fas fa-life-ring me-1"></i>
              Contact Support
            </button>
          </div>
          {countdown > 0 && (
            <div className="countdown-badge">
              <i className="fas fa-clock me-1"></i>
              Redirecting in {countdown}s
            </div>
          )}
        </div>
      </div>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
    </>
  );
}

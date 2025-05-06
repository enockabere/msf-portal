import React from "react";
import Image from "next/image";

/**
 * Enterprise-grade, scalable, dynamic loading screen.
 * Accessible, responsive, and theme-aware.
 */
const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Just a moment..." }) => {
    return (
        <div
            className="d-flex flex-column align-items-center justify-content-center vh-100 text-center loading-screen"
            role="status"
            aria-live="polite"
            aria-busy="true"
            tabIndex={-1}
        >
            <div className="loading-logo mb-3">
                <Image src="/assets/images/favicon.png" width={60} height={60} alt="Loading" priority />
            </div>
            <div className="loading-spinner mb-3" aria-hidden="true">
                <span className="visually-hidden">Loading...</span>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="spinner-svg">
                    <circle
                        className="spinner-track"
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        opacity="0.2"
                    />
                    <circle
                        className="spinner-indicator"
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="100 60"
                        strokeDashoffset="40"
                    />
                </svg>
            </div>
            <p className="mt-2 text-muted fw-semibold fs-5 loading-message">{message}</p>
        </div>
    );
};

export default LoadingScreen;

// Add styles for animation and theme support
if (typeof window !== "undefined") {
    const styleId = "loading-screen-styles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
      .loading-screen { background: var(--bs-body-bg, #f8f9fa); min-height: 100vh; }
      [data-bs-theme="dark"] .loading-screen { background: #181a1b; }
      .loading-spinner .spinner-svg { animation: spinner-rotate 1s linear infinite; }
      .spinner-indicator { stroke: var(--bs-primary, #0d6efd); animation: spinner-dash 1.2s ease-in-out infinite; }
      @keyframes spinner-rotate { 100% { transform: rotate(360deg); } }
      @keyframes spinner-dash {
        0% { stroke-dasharray: 10 150; stroke-dashoffset: 0; }
        50% { stroke-dasharray: 90 60; stroke-dashoffset: -35; }
        100% { stroke-dasharray: 10 150; stroke-dashoffset: -125; }
      }
      .loading-message { letter-spacing: 0.02em; }
    `;
        document.head.appendChild(style);
    }
}

"use client";

import { DNA } from "react-loader-spinner";
import Image from "next/image";
import "./PageLoader.css";

export default function PageLoader() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 50,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      <div className="logo-bounce">
        <Image
          src="/assets/images/favicon.png"
          alt="logo"
          width={60}
          height={60}
        />
      </div>
      <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#333" }}>
        Loading...
      </div>
      <DNA height="80" width="80" ariaLabel="dna-loading" visible={true} />
    </div>
  );
}

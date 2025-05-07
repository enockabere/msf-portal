"use client";

import { DNA } from "react-loader-spinner";

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
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DNA height="100" width="100" ariaLabel="dna-loading" visible={true} />
    </div>
  );
}

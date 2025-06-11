"use client";

import { useEffect } from "react";
import { useDropdownStopPropagation } from "../../hooks/useDropdownStopPropagation";

export default function BootstrapClient() {
  useDropdownStopPropagation();
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => {
        console.log("✅ Bootstrap JS loaded on client");
      })
      .catch((err) => {
        console.error("❌ Bootstrap JS failed to load", err);
      });
  }, []);

  return null;
}

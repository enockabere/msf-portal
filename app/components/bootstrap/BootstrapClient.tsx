"use client";

import { useEffect } from "react";
import { useDropdownStopPropagation } from "@/app/hooks/useDropdownStopPropagation";

export default function BootstrapClient() {
  // custom dropdown hook
  useDropdownStopPropagation();

  useEffect(() => {
    // Dynamically import Bootstrap JS only on the client
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

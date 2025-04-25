"use client";

import { useEffect } from "react";

export function useBootstrapUI() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.bootstrap) return;

    // Enable all tooltips
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Enable all popovers
    const popoverTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="popover"]')
    );
    popoverTriggerList.forEach((popoverTriggerEl) => {
      new window.bootstrap.Popover(popoverTriggerEl);
    });
  }, []);
}

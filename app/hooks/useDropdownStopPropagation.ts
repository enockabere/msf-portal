// src/app/hooks/useDropdownStopPropagation.ts
"use client";

import { useEffect } from "react";

export function useDropdownStopPropagation() {
  useEffect(() => {
    const dropdowns = document.querySelectorAll(".dropdown-menu.stop");

    const stopClick = (e: Event) => e.stopPropagation();

    dropdowns.forEach((el) => el.addEventListener("click", stopClick));

    return () => {
      dropdowns.forEach((el) => el.removeEventListener("click", stopClick));
    };
  }, []);
}

"use client";

import { useEffect } from "react";

export function useStickyTopbar() {
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("topbar-custom");
      if (!el) return;

      const scrolled =
        document.body.scrollTop > 50 || document.documentElement.scrollTop > 50;

      el.classList.toggle("nav-sticky", scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}

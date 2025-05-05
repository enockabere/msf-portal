/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useThemeToggle } from "@/app/hooks/useThemeToggle";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeToggle();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <li className="topbar-item">
      <button
        type="button"
        onClick={toggleTheme}
        className="nav-link nav-icon bg-transparent border-0"
      >
        <i className="icofont-moon dark-mode"></i>
        <i className="icofont-sun light-mode"></i>
      </button>
    </li>
  );
}

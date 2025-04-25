"use client";

import { useState, useLayoutEffect } from "react";

export const useThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useLayoutEffect(() => {
    const saved =
      (localStorage.getItem("theme") as "light" | "dark") ||
      (document.documentElement.getAttribute("data-bs-theme") as
        | "light"
        | "dark") ||
      "light";

    document.documentElement.setAttribute("data-bs-theme", saved);
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return { theme, toggleTheme };
};

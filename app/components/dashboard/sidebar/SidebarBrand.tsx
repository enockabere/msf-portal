"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function SidebarBrand() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const updateState = () => {
      const sidebarSize = document.body.getAttribute("data-sidebar-size");
      const themeAttr = document.documentElement.getAttribute("data-bs-theme");

      setIsCollapsed(sidebarSize === "collapsed");
      if (themeAttr === "dark" || themeAttr === "light") {
        setTheme(themeAttr);
      }
    };

    // Initial check
    updateState();

    // Observe changes to data attributes
    const sidebarObserver = new MutationObserver(updateState);
    sidebarObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-sidebar-size"],
    });

    const themeInterval = setInterval(() => {
      const currentTheme =
        document.documentElement.getAttribute("data-bs-theme");
      if (currentTheme !== theme) {
        setTheme(currentTheme as "light" | "dark");
      }
    }, 200);

    return () => {
      sidebarObserver.disconnect();
      clearInterval(themeInterval);
    };
  }, [theme]);

  // Handler for close button (mobile)
  const handleCloseSidebar = () => {
    document.body.setAttribute("data-sidebar-size", "collapsed");
    document.body.classList.remove("startbar-enable");
  };

  return (
    <div className="brand d-flex justify-between align-items-center px-3 py-2">
      {/* Logo */}
      <a href="#" className="logo d-flex align-items-center">
        <span className={isCollapsed ? "" : "d-none"}>
          <Image
            src="/assets/images/favicon.png"
            alt="logo-small"
            width={30}
            height={30}
            className="logo-sm"
          />
        </span>
        <span className={isCollapsed ? "d-none" : ""}>
          {theme === "light" ? (
            <Image
              src="/assets/images/logo-light.png"
              alt="logo-light"
              width={140}
              height={40}
              className="logo-lg"
            />
          ) : (
            <Image
              src="/assets/images/logo-dark.svg"
              alt="logo-dark"
              width={140}
              height={40}
              className="logo-lg"
            />
          )}
        </span>
      </a>

      {/* Mobile Close Button */}
      <button
        onClick={handleCloseSidebar}
        className="btn btn-link d-xl-none ms-auto p-0"
        style={{ fontSize: "1.5rem", color: "#999" }}
        aria-label="Close Sidebar"
      >
        <X />
      </button>
    </div>
  );
}

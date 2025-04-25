"use client";

import { useEffect, useState } from "react";

export function useSidebarToggle() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const updateSidebarState = () => {
    const shouldCollapse =
      window.innerWidth >= 310 && window.innerWidth <= 1440;
    const newState = shouldCollapse ? "collapsed" : "default";
    document.body.setAttribute("data-sidebar-size", newState);
    setIsCollapsed(shouldCollapse);
    document.body.classList.toggle("startbar-enable", !shouldCollapse);
  };

  const collapseSidebar = () => {
    document.body.setAttribute("data-sidebar-size", "collapsed");
    document.body.classList.remove("startbar-enable");
    setIsCollapsed(true);
  };

  const toggleSidebar = () => {
    const current = document.body.getAttribute("data-sidebar-size");
    const newState = current === "collapsed" ? "default" : "collapsed";
    document.body.setAttribute("data-sidebar-size", newState);
    setIsCollapsed(newState === "collapsed");
    document.body.classList.toggle("startbar-enable", newState === "default");
  };

  useEffect(() => {
    updateSidebarState(); // On mount

    const handleResize = () => {
      updateSidebarState();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    toggleSidebar,
    collapseSidebar,
    isCollapsed,
    isSidebarOpen: !isCollapsed,
  };
}

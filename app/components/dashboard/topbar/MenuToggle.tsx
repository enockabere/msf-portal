"use client";

import { useSidebarToggle } from "../../../hooks/useSidebarToggle";

export default function MenuToggle() {
  const { toggleSidebar } = useSidebarToggle();

  return (
    <li>
      <button
        className="nav-link mobile-menu-btn nav-icon"
        id="togglemenu"
        onClick={toggleSidebar}
      >
        <i className="iconoir-menu-scale"></i>
      </button>
    </li>
  );
}

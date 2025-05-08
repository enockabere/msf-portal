"use client";

import { useSidebarToggle } from "@/app/hooks/useSidebarToggle";
import SidebarBrand from "./SidebarBrand";
import SidebarMenu from "./SidebarMenu";
import SidebarUserInfo from "./SidebarUserInfo";
import SimpleBar from "simplebar-react";

export default function Sidebar() {
  const { collapseSidebar, isSidebarOpen } = useSidebarToggle();

  return (
    <div className="startbar d-print-none">
      {isSidebarOpen && (
        <div
          className="startbar-overlay d-print-none"
          onClick={collapseSidebar}
          style={{ position: "fixed", inset: 0, zIndex: 1003 }}
        />
      )}

      <SidebarBrand />
      <div className="startbar-menu">
        <SimpleBar className="startbar-collapse h-full">
          <div className="d-flex align-items-start flex-column w-100">
            <SidebarMenu />
            <SidebarUserInfo />
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}

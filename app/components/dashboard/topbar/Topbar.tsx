"use client";

import { useStickyTopbar } from "@/app/hooks/useStickyTopbar";
import MenuToggle from "./MenuToggle";
import BreadcrumbNav from "./BreadcrumbNav";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import Notifications from "./Notifications";
import ProfileDropdown from "./ProfileDropdown";

export default function Topbar() {
  useStickyTopbar();

  return (
    <div className="topbar d-print-none">
      <div className="container-xxl">
        <nav
          className="topbar-custom d-flex justify-content-between"
          id="topbar-custom"
        >
          <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
            <MenuToggle />
            <BreadcrumbNav />
          </ul>

          <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
            <SearchBar />
            <ThemeToggle />
            <Notifications />
            <ProfileDropdown />
          </ul>
        </nav>
      </div>
    </div>
  );
}

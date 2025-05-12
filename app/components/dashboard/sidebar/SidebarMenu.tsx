"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import { useState } from "react";
import { startTransition } from "react";

export default function SidebarMenu() {
  const router = useRouter();
  const currentPath = usePathname();
  const { showLoader } = usePageLoader();
  const [isNavigating] = useState(false);

  const isGroupActive = (prefix: string) =>
    !isNavigating &&
    currentPath.startsWith(prefix) &&
    currentPath !== "/dashboard";

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href !== currentPath) {
      showLoader();
      startTransition(() => {
        router.push(href);
      });
    }
  };

  return (
    <ul className="navbar-nav mb-auto w-100">
      {/* Main Menu Label */}
      <li className="menu-label pt-0 mt-0">
        <small className="label-border">
          <div className="border_left hidden-xs"></div>
          <div className="border_right"></div>
        </small>
        <span>Main Menu</span>
      </li>
      <li className="nav-item">
        <a
          href="/dashboard"
          className={`nav-link ${currentPath === "/dashboard" ? "active" : ""}`}
          onClick={(e) => handleNav(e, "/dashboard")}
        >
          <i className="iconoir-home-simple menu-icon"></i>
          <span>Dashboard</span>
        </a>
      </li>

      <li className="nav-item">
        <a
          className={`nav-link ${
            currentPath.startsWith("/dashboard/make-request") ? "active" : ""
          }`}
          href="#sidebarMyRequests"
          data-bs-toggle="collapse"
          aria-expanded={currentPath.startsWith("/dashboard/make-request")}
          aria-controls="sidebarMyRequests"
        >
          <i className="iconoir-shopping-bag menu-icon"></i>
          <span>My Requests</span>
        </a>
        <div
          className={`collapse ${
            currentPath.startsWith("/dashboard/make-request") ? "show" : ""
          }`}
          id="sidebarMyRequests"
        >
          <ul className="nav flex-column">
            <li className="nav-item">
              <a
                href="/dashboard/make-request"
                className={`nav-link ${
                  currentPath === "/dashboard/make-request" ? "active" : ""
                }`}
                onClick={(e) => handleNav(e, "/dashboard/make-request")}
              >
                Request Dashboard
              </a>
            </li>
          </ul>
        </div>
      </li>

      <li className="nav-item">
        <a
          className={`nav-link ${isGroupActive("/hr") ? "active" : ""}`}
          href="#sidebarHRServices"
          data-bs-toggle="collapse"
          aria-expanded={isGroupActive("/hr")}
          aria-controls="sidebarHRServices"
        >
          <i className="iconoir-user menu-icon"></i>
          <span>HR Services</span>
        </a>
        <div
          className={`collapse ${isGroupActive("/hr") ? "show" : ""}`}
          id="sidebarHRServices"
        >
          <ul className="nav flex-column">
            <li className="nav-item">
              <span className="nav-link">
                Recruitment <span className="badge bg-warning ms-2">Soon</span>
              </span>
            </li>
            <li className="nav-item">
              <span className="nav-link">
                Employee Services{" "}
                <span className="badge bg-warning ms-2">Soon</span>
              </span>
            </li>
            <li className="nav-item">
              <span className="nav-link">
                Performance Management{" "}
                <span className="badge bg-warning ms-2">Soon</span>
              </span>
            </li>
          </ul>
        </div>
      </li>

      {/* Procurement & Finance - Fixed active state logic */}
      <li className="nav-item">
        <a
          className={`nav-link ${
            isGroupActive("/procurement") ? "active" : ""
          }`}
          href="#sidebarProcFinance"
          data-bs-toggle="collapse"
          role="button"
          aria-expanded={isGroupActive("/procurement")}
          aria-controls="sidebarProcFinance"
        >
          <i className="iconoir-wallet menu-icon"></i>
          <span>Procurement & Finance</span>
        </a>
        <div
          className={`collapse ${isGroupActive("/procurement") ? "show" : ""}`}
          id="sidebarProcFinance"
        >
          <ul className="nav flex-column">
            {[
              "Requisitions",
              "Procurement Plan",
              "RFQs and Quotes",
              "Contracts",
              "Tendering",
              "Vendor Evaluation",
            ].map((text, index) => (
              <li className="nav-item" key={index}>
                <a className="nav-link" href="#">
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </li>

      {/* Static Links */}
      {[
        { label: "Planning & Budgeting", icon: "page" },
        { label: "Admin & Travel", icon: "airplane", soon: true },
        { label: "IT & Facilities", icon: "server-connection", soon: true },
        { label: "Learning & Development", icon: "graduation-cap" },
        {
          label: "Approvals & Reviews",
          icon: "check-circle",
          badge: "8",
          badgeClass: "bg-danger",
        },
        { label: "Reports & Insights", icon: "doc-star", soon: true },
        { label: "Social Center", icon: "chat-bubble", soon: true },
      ].map(({ label, icon, soon, badge, badgeClass }) => (
        <li className="nav-item" key={label}>
          <a className="nav-link" href="#">
            <i className={`iconoir-${icon} menu-icon`}></i>
            <span>
              {label}
              {soon && <span className="badge bg-warning ms-2">Soon</span>}
              {badge && (
                <span className={`badge ${badgeClass} rounded-pill ms-2`}>
                  {badge}
                </span>
              )}
            </span>
          </a>
        </li>
      ))}

      {/* Help & Support */}
      <li className="menu-label mt-2">
        <small className="label-border">
          <div className="border_left hidden-xs"></div>
          <div className="border_right"></div>
        </small>
        <span>
          Help & Support <span className="badge bg-warning ms-2">Soon</span>
        </span>
      </li>
      {["FAQs", "Submit a Ticket", "Contact IT/Admin/HR", "Documentation"].map(
        (label, index) => (
          <li className="nav-item" key={index}>
            <a className="nav-link" href="#">
              <i
                className={`iconoir-${
                  ["archive", "submit-document", "headset-help", "book"][index]
                } menu-icon`}
              ></i>
              <span>
                {label} <span className="badge bg-warning ms-2">Soon</span>
              </span>
            </a>
          </li>
        )
      )}

      {/* Logout */}
      <li className="nav-item">
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            showLoader();
            await signOut({ callbackUrl: "/" });
          }}
          className="nav-link"
        >
          <i className="iconoir-log-out menu-icon"></i>
          <span>Logout</span>
        </a>
      </li>
    </ul>
  );
}

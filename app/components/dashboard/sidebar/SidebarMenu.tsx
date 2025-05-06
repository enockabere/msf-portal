"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function SidebarMenu() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isGroupActive = (prefix: string) => pathname.startsWith(prefix);

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

      {/* Dashboard */}
      <li className="nav-item">
        <Link
          href="/dashboard"
          className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
        >
          <i className="iconoir-home-simple menu-icon"></i>
          <span>Dashboard</span>
        </Link>
      </li>

      {/* My Requests */}
      <li className="nav-item">
        <a
          className="nav-link"
          href="#sidebarMyRequests"
          data-bs-toggle="collapse"
          aria-expanded={isGroupActive("/requests")}
          aria-controls="sidebarMyRequests"
        >
          <i className="iconoir-shopping-bag menu-icon"></i>
          <span>My Requests</span>
        </a>
        <div
          className={`collapse ${isGroupActive("/requests") ? "show" : ""
            }`}
          id="sidebarMyRequests"
        >
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link
                href="/dashboard/make-request"
                className={`nav-link ${isActive("/dashboard/make-request") ? "active" : ""
                  }`}
              >
                Request Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <span className="nav-link">
                Track my Requests{" "}
                <span className="badge bg-warning ms-2">Soon</span>
              </span>
            </li>
            <li className="nav-item">
              <span className="nav-link">
                Invoices <span className="badge bg-warning ms-2">Soon</span>
              </span>
            </li>
          </ul>
        </div>
      </li>

      {/* HR Services */}
      <li className="nav-item">
        <a
          className="nav-link"
          href="#sidebarHRServices"
          data-bs-toggle="collapse"
          aria-expanded={isGroupActive("/hr")}
          aria-controls="sidebarHRServices"
        >
          <i className="iconoir-user menu-icon"></i>
          <span>HR Services</span>
        </a>
        <div
          className={`collapse ${isGroupActive("/hr") ? "show" : ""
            }`}
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

      {/* Procurement & Finance */}
      <li className="nav-item">
        <a
          className="nav-link"
          href="#sidebarProcFinance"
          data-bs-toggle="collapse"
          role="button"
          aria-expanded="false"
          aria-controls="sidebarProcFinance"
        >
          <i className="iconoir-wallet menu-icon"></i>
          <span>Procurement & Finance</span>
        </a>
        <div className="collapse" id="sidebarProcFinance">
          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link" href="#">
                Requisitions
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Procurement Plan
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                RFQs and Quotes
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Contracts
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Tendering
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Vendor Evaluation
              </a>
            </li>
          </ul>
        </div>
      </li>

      {/* Static Links */}
      <li className="nav-item">
        <a className="nav-link" href="#">
          <i className="iconoir-page menu-icon"></i>
          <span>Planning & Budgeting </span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">
          <i className="iconoir-airplane menu-icon"></i>
          <span>
            Admin & Travel <span className="badge bg-warning ms-2">Soon</span>
          </span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">
          <i className="iconoir-server-connection menu-icon"></i>
          <span>
            IT & Facilities <span className="badge bg-warning ms-2">Soon</span>
          </span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">
          <i className="iconoir-graduation-cap menu-icon"></i>
          <span>Learning & Development </span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">
          <i className="iconoir-check-circle menu-icon"></i>
          <span>Approvals & Reviews </span>
          <span className="badge bg-danger rounded-pill ms-2">8</span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">
          <i className="iconoir-doc-star menu-icon"></i>
          <span>
            Reports & Insights{" "}
            <span className="badge bg-warning ms-2">Soon</span>
          </span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">
          <i className="iconoir-chat-bubble menu-icon"></i>
          <span>
            Social Center <span className="badge bg-warning ms-2">Soon</span>
          </span>
        </a>
      </li>

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
      <li className="nav-item">
        <a className="nav-link" href="documentation.html">
          <i className="iconoir-archive menu-icon"></i>
          <span>
            FAQs <span className="badge bg-warning ms-2">Soon</span>
          </span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="documentation.html">
          <i className="iconoir-submit-document menu-icon"></i>
          <span>
            Submit a Ticket <span className="badge bg-warning ms-2">Soon</span>
          </span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="documentation.html">
          <i className="iconoir-headset-help menu-icon"></i>
          <span>Contact IT/Admin/HR </span>
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="documentation.html">
          <i className="iconoir-book menu-icon"></i>
          <span>
            Documentation <span className="badge bg-warning ms-2">Soon</span>
          </span>
        </a>
      </li>
      <li className="nav-item">
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            await signOut({ callbackUrl: '/' });
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

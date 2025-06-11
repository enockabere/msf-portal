"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { usePageLoader } from "../../../context/PageLoaderContext";
import { useEffect, useState, startTransition } from "react";
import { getResource } from "../../../lib/api/http";
import { normalizeDocType } from "../../../utils/normalizeDocType";

export default function SidebarMenu() {
  const router = useRouter();
  const currentPath = usePathname();
  const [approvalCount, setApprovalCount] = useState(0);
  const { data: session, status } = useSession();
  const { loading, actions } = usePageLoader();
  const { dispatcher } = actions;

  const profile = session?.user?.profile;
  const isEmployee = profile?.type === "Employee";
  const normalizedType = normalizeDocType(profile?.type);
  const isExternalUser = ["visitor", "non resident"].includes(normalizedType);

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href !== currentPath && !loading) {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: "",
        },
      });
      startTransition(() => {
        router.push(href);
        dispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
      });
    }
  };

  // const isGroupActive = (prefix: string) =>
  //   !loading && currentPath.startsWith(prefix) && currentPath !== "/dashboard";

  useEffect(() => {
    if (!profile?.no || isExternalUser) return;

    const fetchApprovalCount = async () => {
      try {
        const res = await getResource("approvalEntries", {
          params: {
            filters: {
              status: "Open",
              approverID: profile.no,
            },
            $count: true,
          },
        });

        setApprovalCount(res["@odata.count"] || 0);
      } catch (error) {
        console.error("Failed to fetch approval count:", error);
      }
    };

    fetchApprovalCount();
  }, [profile?.no, isExternalUser]);

  // Prevent flicker
  if (status === "loading") return null;

  return (
    <ul className="navbar-nav mb-auto w-100">
      {/* Main Menu */}
      <li className="menu-label pt-0 mt-0">
        <small className="label-border">
          <div className="border_left hidden-xs"></div>
          <div className="border_right"></div>
        </small>
        <span>Main Menu</span>
      </li>

      {/* Dashboard - always visible */}
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

      {/* Visitor view only */}
      {isExternalUser && (
        <li className="nav-item">
          <a
            href="/dashboard/make-request/travel"
            className={`nav-link ${
              currentPath === "/dashboard/make-request/travel" ? "active" : ""
            }`}
            onClick={(e) => handleNav(e, "/dashboard/make-request/travel")}
          >
            <i className="iconoir-airplane menu-icon"></i>
            <span>Travel Request</span>
          </a>
        </li>
      )}

      {/* Employee view only */}
      {isEmployee && (
        <>
          {/* My Requests */}
          <li className="nav-item">
            <a
              className={`nav-link ${
                currentPath.startsWith("/dashboard/make-request")
                  ? "active"
                  : ""
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

          {/* Admin & Travel */}
          <li className="nav-item">
            <a
              className={`nav-link ${
                currentPath.startsWith("/dashboard/make-request")
                  ? "active"
                  : ""
              }`}
              href="#sidebarAdminTravel"
              data-bs-toggle="collapse"
              aria-expanded={currentPath.startsWith(
                "/dashboard/make-request/travel"
              )}
              aria-controls="sidebarAdminTravel"
            >
              <i className="iconoir-airplane menu-icon"></i>
              <span>Admin & Travel</span>
            </a>
            <div
              className={`collapse ${
                currentPath.startsWith("/dashboard/make-request/travel")
                  ? "show"
                  : ""
              }`}
              id="sidebarAdminTravel"
            >
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    href="/dashboard/make-request/travel"
                    className={`nav-link ${
                      currentPath === "/dashboard/make-request/travel"
                        ? "active"
                        : ""
                    }`}
                    onClick={(e) =>
                      handleNav(e, "/dashboard/make-request/travel")
                    }
                  >
                    Travel requests
                  </a>
                </li>
              </ul>
            </div>
          </li>

          {/* Finance Services */}
          <li className="nav-item">
            <a
              className={`nav-link ${
                currentPath.startsWith("/dashboard/make-request/advances") ||
                currentPath.startsWith("/dashboard/make-request/otherAdvances")
                  ? "active"
                  : ""
              }`}
              href="#sidebarFinance"
              data-bs-toggle="collapse"
              aria-expanded={currentPath.startsWith(
                "/dashboard/make-request/advances"
              )}
              aria-controls="sidebarFinance"
            >
              <i className="iconoir-wallet menu-icon"></i>
              <span>Finance Services</span>
            </a>
            <div
              className={`collapse ${
                currentPath.startsWith("/dashboard/make-request/travel")
                  ? "show"
                  : ""
              }`}
              id="sidebarFinance"
            >
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    href="/dashboard/make-request/advances"
                    className={`nav-link ${
                      currentPath === "/dashboard/make-request/advances"
                        ? "active"
                        : ""
                    }`}
                    onClick={(e) =>
                      handleNav(e, "/dashboard/make-request/advances")
                    }
                  >
                    Salary Advances
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    href="/dashboard/make-request/otherAdvances"
                    className={`nav-link ${
                      currentPath === "/dashboard/make-request/otherAdvances"
                        ? "active"
                        : ""
                    }`}
                    onClick={(e) =>
                      handleNav(e, "/dashboard/make-request/otherAdvances")
                    }
                  >
                    Other Advances
                  </a>
                </li>
              </ul>
            </div>
          </li>

          {/* Procurement Services */}
          <li className="nav-item">
            <a
              className={`nav-link ${
                currentPath.startsWith("/dashboard/make-request/requisitions")
                  ? "active"
                  : ""
              }`}
              href="#sidebarProcurement"
              data-bs-toggle="collapse"
              aria-expanded={currentPath.startsWith(
                "/dashboard/make-request/requisitions"
              )}
              aria-controls="sidebarProcurement"
            >
              <i className="iconoir-page menu-icon"></i>
              <span>Procurement Services</span>
            </a>
            <div
              className={`collapse ${
                currentPath.startsWith("/dashboard/make-request/requisitions")
                  ? "show"
                  : ""
              }`}
              id="sidebarProcurement"
            >
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a
                    href="/dashboard/make-request/requisitions"
                    className={`nav-link ${
                      currentPath === "/dashboard/make-request/requisitions"
                        ? "active"
                        : ""
                    }`}
                    onClick={(e) =>
                      handleNav(e, "/dashboard/make-request/requisitions")
                    }
                  >
                    Requisitions
                  </a>
                </li>
              </ul>
            </div>
          </li>

          <li className="nav-item">
            <a
              href="/dashboard/approvals"
              className={`nav-link ${
                currentPath === "/dashboard/approvals" ? "active" : ""
              }`}
              onClick={(e) => handleNav(e, "/dashboard/approvals")}
            >
              <i className="iconoir-check-circle menu-icon"></i>
              <span>
                Approvals & Reviews{" "}
                <span className="badge bg-danger text-white rounded-pill ms-2">
                  {approvalCount}
                </span>
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
          {["FAQs", "Submit a Ticket", "Documentation"].map((label, index) => (
            <li className="nav-item" key={index}>
              <a className="nav-link" href="#">
                <i
                  className={`iconoir-${
                    ["archive", "submit-document", "headset-help", "book"][
                      index
                    ]
                  } menu-icon`}
                ></i>
                <span>
                  {label} <span className="badge bg-warning ms-2">Soon</span>
                </span>
              </a>
            </li>
          ))}
        </>
      )}

      {/* Logout - always visible */}
      <li className="nav-item">
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
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

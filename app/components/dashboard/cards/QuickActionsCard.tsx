"use client";

import React, { startTransition } from "react";
import { useRouter } from "next/navigation";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import "./Cards.css";

export default function QuickActionsCard() {
  const router = useRouter();
  const { actions } = usePageLoader();
  const { dispatcher } = actions;

  const quickActions = [
    {
      href: "/dashboard/make-request/advances",
      icon: "iconoir-wallet",
      title: "Salary Advances",
      bgColor: "bg-success",
    },
    {
      href: "/dashboard/make-request/travel",
      icon: "iconoir-airplane",
      title: "Admin & Travel",
      bgColor: "bg-warning",
    },
    {
      href: "/dashboard/make-request/otherAdvances",
      icon: "iconoir-cash",
      title: "Other Advances",
      bgColor: "bg-info",
    },
  ];

  const handleNavigate = (href: string) => {
    dispatcher({
      type: "PATCH_LOADING_STATE",
      payload: { loading: true, message: "" },
    });

    // Navigate inside startTransition for responsiveness
    startTransition(() => {
      router.push(href);
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: false, message: "" },
      });
    });
  };

  return (
    <div className="card h-100 quick-actions-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 position-relative">
          <h5 className="card-title mb-0">
            <i className="iconoir-settings text-primary me-2"></i>
            Quick Actions
          </h5>
          <div className="blink-animation-circle">
            <i className="fa-solid fa-exclamation text-danger" />
          </div>
        </div>

        <div className="row g-1">
          {quickActions.map((action, index) => (
            <div key={index} className="col-4">
              <a
                href={action.href}
                className={`action-card ${action.bgColor} py-3 px-2 rounded-3 text-center d-block text-white text-decoration-none shadow-sm position-relative overflow-hidden transition-all`}
                style={{
                  minHeight: "90px",
                  transition: "all 0.2s ease-in-out",
                  border: "none",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate(action.href);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div className="d-flex justify-content-center mb-2">
                  <i
                    className={`${action.icon} fs-3`}
                    style={{ lineHeight: "1" }}
                  ></i>
                </div>
                <div
                  className="fw-semibold"
                  style={{ fontSize: "0.75rem", lineHeight: "1.2" }}
                >
                  {action.title}
                </div>

                <div
                  className="position-absolute top-0 end-0 opacity-10"
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "0 0.75rem 0 50%",
                  }}
                ></div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { JSX, useEffect, useState } from "react";
import { Send, Clock, CheckCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Advance {
  status: "Open" | "Released" | "Pending Approval";
  [key: string]: any;
}

interface Props {
  employee?: {
    number: string;
    nationalId: string;
    mobilePhone: string;
  };
}

export default function AdvanceStatsCard({ employee }: Props) {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdvances = async () => {
      if (!employee?.number) return;

      try {
        const res = await fetch(
          `/api/bc/advances/salary/requests?employeeNo=${employee.number}`
        );
        const json = await res.json();
        const fetched = json?.data?.value || [];
        setAdvances(fetched);
      } catch (error) {
        console.error("❌ Failed to fetch advances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvances();
  }, [employee]);

  const statusCount = (status: string) =>
    advances.filter((a) => a.status === status).length;

  const handleCardClick = () => {
    router.push("/dashboard/make-request/advances");
  };

  const renderCard = (
    icon: JSX.Element,
    title: string,
    statusKey: string,
    subtitle: string,
    iconColor: string,
    gradientStart: string,
    gradientEnd: string
  ) => (
    <div
      className="card shadow-none border mb-3 card-hover position-relative overflow-hidden"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* Color indicator strip */}
      <div
        className="color-indicator position-absolute"
        style={{
          background: `linear-gradient(to bottom, ${gradientStart}, ${gradientEnd})`,
          left: 0,
          top: 0,
          height: "100%",
          width: "3px",
        }}
      ></div>

      <div className="card-body py-2 px-3">
        <div className="d-flex align-items-center">
          {/* Circular background for icon */}
          <div
            className="icon-wrapper d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: `${gradientStart}20`,
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              transition: "transform 0.3s ease, background-color 0.3s ease",
            }}
          >
            {React.cloneElement(icon, {
              size: 18,
              className: `icon-transition ${iconColor}`,
              style: { transition: "transform 0.3s ease" },
            })}
          </div>

          <div className="flex-grow-1 text-truncate ms-2">
            <p className="text-dark mb-0 fw-semibold fs-13">{title}</p>
            <div className="d-flex align-items-center gap-2">
              <h3 className="mt-1 mb-0 fs-18 fw-bold d-flex align-items-center">
                {loading ? (
                  <div className="skeleton-count" />
                ) : (
                  statusCount(statusKey)
                )}
              </h3>
              <span className="fs-11 text-muted fw-normal">{subtitle}</span>
            </div>
          </div>

          <ChevronRight size={16} className="arrow-icon text-muted opacity-0" />
        </div>
      </div>

      <style jsx>{`
        .skeleton-count {
          display: inline-block;
          height: 20px;
          min-width: 30px;
          background: linear-gradient(
            90deg,
            #e0e0e0 25%,
            #f0f0f0 50%,
            #e0e0e0 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          border-left: 3px solid transparent;
        }

        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border-color: transparent;
        }

        .card-hover:hover .icon-wrapper {
          transform: scale(1.1);
          background-color: ${gradientStart}30 !important;
        }

        .card-hover:hover .color-indicator {
          width: 5px;
        }

        .card-hover:hover .arrow-icon {
          opacity: 1 !important;
          transform: translateX(0);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .arrow-icon {
          transform: translateX(-5px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .icon-transition:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="row">
          <div className="col-md-12">
            {renderCard(
              <Send />,
              "Open Requests",
              "Open",
              "Awaiting Submission",
              "text-primary",
              "#3b82f6",
              "#60a5fa"
            )}
          </div>
          <div className="col-md-12">
            {renderCard(
              <Clock />,
              "Pending Approval",
              "Pending Approval",
              "Under Review",
              "text-warning",
              "#f59e0b",
              "#fbbf24"
            )}
          </div>
          <div className="col-md-12">
            {renderCard(
              <CheckCircle />,
              "Released Advances",
              "Released",
              "Successfully Processed",
              "text-success",
              "#10b981",
              "#34d399"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

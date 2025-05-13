"use client";

import { JSX, useEffect, useState } from "react";
import { Send, Clock, CheckCircle } from "lucide-react";
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

  const renderCard = (
    icon: JSX.Element,
    title: string,
    statusKey: string,
    subtitle: string
  ) => (
    <div className="card shadow-none border mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center">
          {icon}
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
        </div>
      </div>

      {/* Skeleton shimmer styles */}
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
      `}</style>
    </div>
  );

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="row">
          <div className="col-md-12">
            {renderCard(
              <Send size={24} className="text-primary" />,
              "Open Requests",
              "Open",
              "Awaiting Submission"
            )}
          </div>
          <div className="col-md-12">
            {renderCard(
              <Clock size={24} className="text-warning" />,
              "Pending Approval",
              "Pending Approval",
              "Under Review"
            )}
          </div>
          <div className="col-md-12">
            {renderCard(
              <CheckCircle size={24} className="text-success" />,
              "Released Advances",
              "Released",
              "Successfully Processed"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

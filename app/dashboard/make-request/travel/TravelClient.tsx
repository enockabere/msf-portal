"use client";

import { useEffect, useState } from "react";
import { useEmployee } from "@/app/context/EmployeeContext";
import dynamic from "next/dynamic";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { Wallet, Bell, Coins, BarChart } from "lucide-react";
import SummaryCards from "@/app/components/cards/SummaryCards";
import TabbedTravelRequests from "@/app/components/travel/TabbedTravelRequests";

const TravelRequestTable = dynamic(
  () => import("@/app/components/travel/TravelRequestTable"),
  { ssr: false }
);

export default function TravelClient() {
  const { employee } = useEmployee();
  const { setBreadcrumb } = useBreadcrumb();

  const [placement, setPlacement] = useState<
    "right" | "top" | "bottom" | "left"
  >("bottom");
  useEffect(() => {
    const saved = localStorage.getItem("advancePlacement") as
      | "right"
      | "top"
      | "bottom"
      | "left"
      | null;

    if (saved && saved !== placement) {
      setPlacement(saved);
    }
  }, []);

  const handleChangePlacement = (
    newPlacement: "right" | "top" | "bottom" | "left"
  ) => {
    setPlacement(newPlacement);
    localStorage.setItem("advancePlacement", newPlacement);
  };

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      { label: "Make Request", path: "/dashboard/make-request" },
      { label: "Travel Request", path: "/dashboard/make-request/travel" },
    ]);
  }, [setBreadcrumb]);

  const cards = [
    {
      title: "Unsettled",
      value: "KES 52,400",
      description: "Unsettled Amount",
      icon: <Wallet size={28} />,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-warning",
      onClick: () => {}, // You can add modal trigger logic later
    },
    {
      title: "Open Travel Requests",
      value: "1 Pending",
      description: "Open Approvals",
      icon: <Bell size={28} />,
      bgColorClass: "bg-light-success",
      textColorClass: "text-success",
    },
    {
      title: "Pending Requests",
      value: "4",
      description: "Requests Pending Approval",
      icon: <Coins size={28} />,
      bgColorClass: "bg-light-info",
      textColorClass: "text-info",
    },
    {
      title: "Total",
      value: 13,
      description: "Total Requests",
      icon: <BarChart size={28} />,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-warning",
    },
  ];

  return (
    <div className="page-content dashboard-container p-3">
      {placement === "top" && (
        <div className="row gx-1 mb-1">
          <div className="col-12">
            <SummaryCards
              cards={cards}
              layout="horizontal"
              currentPlacement="top"
              onPlacementChange={handleChangePlacement}
              actionButton={
                <button className="btn bg-danger text-white btn-sm">
                  <i className="fa fa-plus me-1" />
                  New Travel Request
                </button>
              }
            />
          </div>
        </div>
      )}

      <div className="row gx-1">
        {placement === "left" && (
          <>
            <div className="col-lg-3">
              <SummaryCards
                cards={cards}
                layout="horizontal"
                currentPlacement="top"
                onPlacementChange={handleChangePlacement}
                actionButton={
                  <button className="btn bg-danger text-white btn-sm">
                    <i className="fa fa-plus me-1" />
                    New Request
                  </button>
                }
              />
            </div>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <TabbedTravelRequests />
              </div>
            </div>
          </>
        )}

        {placement === "right" && (
          <>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <TabbedTravelRequests />
              </div>
            </div>
            <div className="col-lg-3">
              <SummaryCards
                cards={cards}
                layout="horizontal"
                currentPlacement="top"
                onPlacementChange={handleChangePlacement}
                actionButton={
                  <button className="btn bg-danger text-white btn-sm">
                    <i className="fa fa-plus me-1" />
                    New Request
                  </button>
                }
              />
            </div>
          </>
        )}

        {(placement === "top" || placement === "bottom") && (
          <div className="col-12">
            <div className="card h-100 p-2">
              <TabbedTravelRequests />
            </div>
          </div>
        )}
      </div>

      {placement === "bottom" && (
        <div className="row gx-1 mt-2">
          <div className="col-12">
            <SummaryCards
              cards={cards}
              layout="horizontal"
              currentPlacement="top"
              onPlacementChange={handleChangePlacement}
              actionButton={
                <button className="btn bg-danger text-white btn-sm">
                  <i className="fa fa-plus me-1" />
                  New Request
                </button>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

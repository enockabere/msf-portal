"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import QuickActionsCard from "../components/dashboard/cards/QuickActionsCard";
import DashboardProfile from "../components/dashboard/cards/DashboardProfile";
import LeaveStatsCard from "../components/leave/LeaveStatsCard";

export default function DashboardClient() {
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([]);
  }, [setBreadcrumb]);

  return (
    <div className="page-content">
      <div className="container-xxl">
        <div className="row my-2 justify-content-center">
          <div className="col-md-6 col-lg-4">
            <LeaveStatsCard />
          </div>
          <div className="col-md-6 col-lg-4">
            <QuickActionsCard />
          </div>
          <div className="col-md-6 col-lg-4">
            <DashboardProfile />
          </div>
        </div>
        {/* <div className="row my-2">
          <div className="col-md-6 col-lg-4">
            <FavoriteCardsWrapper />
          </div>
          <div className="col-md-6 col-lg-4">
            <CarbonCreditsCard />
          </div>
        </div> */}
      </div>
    </div>
  );
}

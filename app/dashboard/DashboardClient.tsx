"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import QuickActionsCard from "../components/dashboard/cards/QuickActionsCard";
import DashboardProfile from "../components/dashboard/cards/DashboardProfile";
import AdvanceStatsCard from "../components/leave/AdvanceStatsCard";
import { useSession } from "next-auth/react";

export default function DashboardClient() {
  const { setBreadcrumb } = useBreadcrumb();
  const { data: session } = useSession();

  const employeeData = {
    number: session?.user?.profile?.no || "",
    nationalId: session?.user?.profile?.identificationDocumentNo || "",
    mobilePhone: session?.user?.profile?.phoneNo || "",
  };

  console.log(employee);

  useEffect(() => {
    setBreadcrumb([]);
  }, [setBreadcrumb]);

  return (
    <div className="page-content">
      <div className="container-xxl">
        <div className="row my-2 justify-content-center">
          <div className="col-md-6 col-lg-4">
            <AdvanceStatsCard employee={employeeData} />
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

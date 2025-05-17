"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { useSession } from "next-auth/react";
import ProfileSummaryCard from "@/app/components/profile/ProfileSummaryCard";
import PersonalInfoCard from "@/app/components/profile/PersonalInfoCard";
import ProfileTabs from "@/app/components/profile/ProfileTabs";

export default function ProfileClient() {
  const { setBreadcrumb } = useBreadcrumb();
  const { data: session } = useSession();

  const employeeData = {
    number: session?.user?.profile?.no || "",
    nationalId: session?.user?.profile?.identificationDocumentNo || "",
    mobilePhone: session?.user?.profile?.phoneNo || "",
  };

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      {
        label: "Profile",
        path: "/dashboard/profile",
      },
    ]);
  }, [setBreadcrumb]);

  return (
    <div className="page-content">
      <div className="container-xxl">
        <ProfileSummaryCard
          dependents={4}
          travelRequests={12}
          leaveBalance={21}
          carbonCredits={350}
        />
        <div className="row mt-4">
          <PersonalInfoCard />
          <ProfileTabs />
        </div>
      </div>
    </div>
  );
}

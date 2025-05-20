"use client";

import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { useSession } from "next-auth/react";
import ProfileSummaryCard from "@/app/components/profile/ProfileSummaryCard";
import PersonalInfoCard from "@/app/components/profile/PersonalInfoCard";
import ProfileTabs from "@/app/components/profile/ProfileTabs";

interface Dependent {
  name: string;
  relation: string;
  countryOfOrigin: string;
  dob?: string;
  gender?: string;
}

export default function ProfileClient() {
  const { setBreadcrumb } = useBreadcrumb();
  const { data: session, status } = useSession();
  const [dependents, setDependents] = useState<Dependent[]>([]);

  const employeeNo = session?.user?.profile?.no || "";

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      { label: "Profile", path: "/dashboard/profile" },
    ]);
  }, [setBreadcrumb]);

  useEffect(() => {
    const fetchDependents = async () => {
      if (!employeeNo) return;

      try {
        const res = await fetch(
          `/api/bc/users/dependants?employeeNo=${employeeNo}`
        );
        const result = await res.json();
        if (res.ok && Array.isArray(result?.data?.value)) {
          setDependents(result.data.value);
        } else {
          console.warn("Failed to load dependents:", result?.error);
        }
      } catch (error) {
        console.error("Error fetching dependents:", error);
      }
    };

    if (status === "authenticated") {
      fetchDependents();
    }
  }, [status, employeeNo]);

  return (
    <div className="page-content">
      <div className="container-xxl">
        <ProfileSummaryCard
          dependents={dependents.length}
          travelRequests={0}
          leaveBalance={21}
          carbonCredits={350}
        />
        <div className="row mt-4">
          <PersonalInfoCard />
          <ProfileTabs dependents={dependents} setDependents={setDependents} />
        </div>
      </div>
    </div>
  );
}

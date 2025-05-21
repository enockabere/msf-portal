"use client";

import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { useSession } from "next-auth/react";
import ProfileSummaryCard from "@/app/components/profile/ProfileSummaryCard";
import PersonalInfoCard from "@/app/components/profile/PersonalInfoCard";
import ProfileTabs from "@/app/components/profile/ProfileTabs";
import { getResource } from "@/app/lib/api/http";
import { toast } from "react-toastify";

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
  const [travelRequests, setTravelRequests] = useState<any[]>([]);

  const profile = session?.user?.profile;
  const profileNo = profile?.no || "";
  const profileType = profile?.type || "";

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      { label: "Profile", path: "/dashboard/profile" },
    ]);
  }, [setBreadcrumb]);

  useEffect(() => {
    const fetchDependents = async () => {
      if (!profileNo) return;

      try {
        const res = await fetch(
          `/api/bc/users/dependants?employeeNo=${profileNo}`
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

    const fetchVisitorTravelRequests = async () => {
      if (!profileNo || profileType !== "Visitor") return;

      try {
        const res = await getResource("travelRequests", {
          params: {
            filters: {
              travellerNo: profileNo,
            },
          },
        });

        if (res.error) {
          console.warn("Error fetching travel requests:", res.error);
          toast.error(res.error.message);
        } else {
          setTravelRequests([...res.value]);
        }
      } catch (error: any) {
        console.error("Error fetching travel requests!", error.message);
      }
    };

    if (status === "authenticated") {
      fetchDependents();
      fetchVisitorTravelRequests();
    }
  }, [status, profileNo, profileType]);

  return (
    <div className="page-content">
      <div className="container-xxl">
        <ProfileSummaryCard
          dependents={dependents.length}
          travelRequests={travelRequests.length}
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

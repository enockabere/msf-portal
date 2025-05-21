"use client";

import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import QuickActionsCard from "../components/dashboard/cards/QuickActionsCard";
import DashboardProfile from "../components/dashboard/cards/DashboardProfile";
import AdvanceStatsCard from "../components/leave/AdvanceStatsCard";
import { useSession } from "next-auth/react";
import ProfileModal from "../components/modals/ProfileModal";
import ProfileCreationForm from "../components/profile/visitor-profiles/ProfileCreationForm";
import Swal from "sweetalert2";
import { signOut } from "next-auth/react";

export default function DashboardClient() {
  const { setBreadcrumb } = useBreadcrumb();
  const { data: session } = useSession();

  const [showModal, setShowModal] = useState(false);

  const employeeData = {
    number: session?.user?.profile?.no || "",
    nationalId: session?.user?.profile?.identificationDocumentNo || "",
    mobilePhone: session?.user?.profile?.phoneNo || "",
  };

  useEffect(() => {
    setBreadcrumb([]);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (session?.needsProfileSetup) {
      setShowModal(true);
    }
  }, [session]);

  const handleModalClose = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will log you out of the session.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        signOut({ callbackUrl: "/" });
      }
    });
  };

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
      </div>

      <ProfileModal
        show={showModal}
        onClose={handleModalClose}
        backdrop="static"
        keyboard={false}
        title={`${session?.user?.email}'s Profile Setup`}
        size="lg"
        closable={true}
      >
        <ProfileCreationForm
          onSuccess={() => {
            setShowModal(false);
          }}
        />
      </ProfileModal>
    </div>
  );
}

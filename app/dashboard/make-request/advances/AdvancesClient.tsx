"use client";

import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import SummaryCards from "@/app/components/cards/SummaryCards";
import dynamic from "next/dynamic";
import SalaryAdvanceForm from "@/app/components/advances/forms/SalaryAdvanceForm";
import VerticalProgressCard from "@/app/components/advances/forms/VerticalProgressCard";
import CustomModal from "@/app/components/modals/CustomModal";
import {
  FileClock,
  ClipboardList,
  BadgeCheck,
  Layers3,
  Wallet,
} from "lucide-react";

const ReusableSalaryAdvanceTabs = dynamic(
  () => import("@/app/components/tables/ReusableSalaryAdvanceTabs"),
  { ssr: false }
);

export default function AdvancesClient() {
  const { setBreadcrumb } = useBreadcrumb();
  const [advanceCounts, setAdvanceCounts] = useState({
    open: 0,
    pending: 0,
    released: 0,
    total: 0,
  });

  const [placement, setPlacement] = useState<
    "right" | "top" | "bottom" | "left"
  >("bottom");
  const [showModal, setShowModal] = useState(false);

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
  }, [placement]);

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      { label: "Make Request", path: "/dashboard/make-request" },
      {
        label: "Salary Advance",
        path: "/dashboard/make-request/advance requests",
      },
    ]);
  }, [setBreadcrumb]);

  const handleChangePlacement = (
    newPlacement: "right" | "top" | "bottom" | "left"
  ) => {
    setPlacement(newPlacement);
    localStorage.setItem("advancePlacement", newPlacement);
  };

  const handleNewRequestClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const cards = [
    {
      title: "Open",
      value: `${advanceCounts.open} Open`,
      description: "Open Advances",
      icon: <FileClock size={28} />,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-warning",
    },
    {
      title: "Approvals",
      value: `${advanceCounts.pending} Pending`,
      description: "Pending Approval",
      icon: <ClipboardList size={28} />, // Represents approvals/tasks pending
      bgColorClass: "bg-light-success",
      textColorClass: "text-success",
    },
    {
      title: "Approved",
      value: `${advanceCounts.released} Approved`,
      description: "Released Advances",
      icon: <BadgeCheck size={28} />,
      bgColorClass: "bg-light-info",
      textColorClass: "text-info",
    },
    {
      title: "Total",
      value: `${advanceCounts.total} Total`,
      description: "Total Requests",
      icon: <Layers3 size={28} />,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-secondary",
    },
  ];

  const renderSummary = () => (
    <SummaryCards
      title="Advance Requests"
      cards={cards}
      layout="horizontal"
      currentPlacement={placement}
      onPlacementChange={handleChangePlacement}
      actionButton={
        <button
          className="btn bg-danger text-white btn-md"
          onClick={handleNewRequestClick}
        >
          <i className="fa fa-plus me-1" />
          New Advance Request
        </button>
      }
    />
  );

  return (
    <div className="page-content dashboard-container p-3">
      {placement === "top" && (
        <div className="row gx-1 mb-2">
          <div className="col-12">{renderSummary()}</div>
        </div>
      )}

      <div className="row gx-1">
        {placement === "left" && (
          <>
            <div className="col-lg-3">{renderSummary()}</div>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <ReusableSalaryAdvanceTabs onCountsUpdate={setAdvanceCounts} />
              </div>
            </div>
          </>
        )}

        {placement === "right" && (
          <>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <ReusableSalaryAdvanceTabs onCountsUpdate={setAdvanceCounts} />
              </div>
            </div>
            <div className="col-lg-3">{renderSummary()}</div>
          </>
        )}

        {(placement === "top" || placement === "bottom") && (
          <div className="col-12">
            <div className="card h-100 p-2">
              <ReusableSalaryAdvanceTabs onCountsUpdate={setAdvanceCounts} />
            </div>
          </div>
        )}
      </div>

      {placement === "bottom" && (
        <div className="row gx-1 mt-2">
          <div className="col-12">{renderSummary()}</div>
        </div>
      )}

      <CustomModal
        show={showModal}
        onClose={handleCloseModal}
        title="Request Salary Advance"
        size="xl"
        titleIcon={<Wallet size={18} className="text-white" />}
      >
        <div className="row">
          <div className="col-md-9">
            <SalaryAdvanceForm onSuccess={handleCloseModal} />
          </div>
          <div className="col-md-3">
            <VerticalProgressCard advance={null} />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}

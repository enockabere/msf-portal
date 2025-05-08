"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
import { Advance } from "@/app/types/advance";

const ReusableSalaryAdvanceTabs = dynamic(
  () => import("@/app/components/tables/ReusableSalaryAdvanceTabs"),
  { ssr: false }
);

export default function AdvancesClient() {
  const { data: session } = useSession();
  const [advanceData, setAdvanceData] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab, setActiveStatusTab] = useState<string>("open");

  const fetchAdvances = useCallback(async () => {
    const employeeNo = session?.user?.profile?.number;
    if (!employeeNo) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/bc/advances/salary/requests?employeeNo=${employeeNo}`
      );
      const json = await res.json();
      setAdvanceData(json["data"]["value"] || []);
    } catch (err) {
      console.error("❌ Parent failed to fetch advances:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]);

  const { setBreadcrumb } = useBreadcrumb();
  const [advanceCounts, setAdvanceCounts] = useState({
    open: 0,
    pending: 0,
    released: 0,
    total: 0,
  });

  const [placement, setPlacement] = useState<
    "right" | "top" | "bottom" | "left"
  >("top");
  const [showModal, setShowModal] = useState(false);

  const handleChangePlacement = (newPlacement: typeof placement) => {
    setPlacement(newPlacement);
    localStorage.setItem("advancePlacement", newPlacement);
  };

  useEffect(() => {
    const saved = localStorage.getItem("advancePlacement") as
      | typeof placement
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
      icon: <ClipboardList size={28} />,
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
      {(placement === "top" || placement === "bottom") && (
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
                <ReusableSalaryAdvanceTabs
                  key={activeStatusTab}
                  data={advanceData}
                  loading={loading}
                  onCountsUpdate={setAdvanceCounts}
                  initialTab={activeStatusTab}
                  refetch={fetchAdvances}
                />
              </div>
            </div>
          </>
        )}

        {placement === "right" && (
          <>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <ReusableSalaryAdvanceTabs
                  key={activeStatusTab}
                  data={advanceData}
                  loading={loading}
                  onCountsUpdate={setAdvanceCounts}
                  initialTab={activeStatusTab}
                  refetch={fetchAdvances}
                />
              </div>
            </div>
            <div className="col-lg-3">{renderSummary()}</div>
          </>
        )}

        {placement === "top" || placement === "bottom" ? (
          <div className="col-12">
            <div className="card h-100 p-2">
              <ReusableSalaryAdvanceTabs
                key={activeStatusTab}
                data={advanceData}
                loading={loading}
                onCountsUpdate={setAdvanceCounts}
                initialTab={activeStatusTab}
                refetch={fetchAdvances}
              />
            </div>
          </div>
        ) : null}
      </div>

      <CustomModal
        show={showModal}
        onClose={handleCloseModal}
        title="Request Salary Advance"
        size="xl"
        titleIcon={<Wallet size={18} className="text-white" />}
      >
        <div className="row">
          <div className="col-md-9">
            <SalaryAdvanceForm
              onSuccess={(status) => {
                const statusToTab: Record<string, string> = {
                  Open: "open",
                  "Pending Approval": "pending",
                  Released: "released",
                };
                if (status && statusToTab[status]) {
                  setActiveStatusTab(statusToTab[status]);
                }
                handleCloseModal();
                fetchAdvances();
              }}
            />
          </div>
          <div className="col-md-3">
            <VerticalProgressCard advance={null} />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}

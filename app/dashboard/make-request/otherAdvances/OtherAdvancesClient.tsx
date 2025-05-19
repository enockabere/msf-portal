"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import SummaryCards from "@/app/components/cards/SummaryCards";
import dynamic from "next/dynamic";
import OperationalAdvanceForm from "@/app/components/advances/forms/OperationalAdvanceForm";
import CustomModal from "@/app/components/modals/CustomModal";
import {
  FileClock,
  ClipboardList,
  BadgeCheck,
  Layers3,
  Wallet,
} from "lucide-react";
import { Advance } from "@/app/types/advance";
import { getResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { useMySetups } from "@/app/context/SetupContext";
import { useAdvance } from "@/app/context/AdvanceContext";

const ReusableSalaryAdvanceTabs = dynamic(
  () => import("@/app/components/tables/ReusableSalaryAdvanceTabs"),
  { ssr: false }
);

export default function OtherAdvancesClient() {
  const { data: session } = useSession();
  const [advanceData, setAdvanceData] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab] = useState<string>("open");
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
  const { setBreadcrumb } = useBreadcrumb();
  const { fetchSetups } = useMySetups();
  const { formData, actions } = useAdvance();
  const { dispatcher, handleFetchingSetup, fetchLineSetup } = actions;

  const fetchAdvances = useCallback(async () => {
    const employeeNo = session?.user?.profile?.no;
    if (!employeeNo) return;
    setLoading(true);

    try {
      const res = await getResource('imprest', {
        params: {
          filters: {
            employeeNo,
          },
        }
      });
      if (res.error) {
        return Swal.fire(res.error.code, res.error.message, 'error');
      }
      setAdvanceData(res.value);
    } catch (err: any) {
      Swal.fire('Error!', err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const handleChangePlacement = (newPlacement: typeof placement) => {
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

  const handleSetSelectedRow = (advance: Advance | null = null) => {
    if (advance) {
      handleFetchingSetup();
      dispatcher({
        type: 'OPEN_EXISTING_ADVANCE',
        payload: advance,
      });
      dispatcher({
        type: 'ADVANCE_CREATION_STATUSES',
        payload: { isNew: false, isEditing: advance.status === 'Open', setForView: true },
      });

      setShowModal(true);
    } else {
      setShowModal(false);
      dispatcher({
        type: 'OPEN_EXISTING_ADVANCE',
        payload: null,
      });
      dispatcher({
        type: 'ADVANCE_CREATION_STATUSES',
        payload: { isNew: false, isEditing: false, setForView: false },
      });
    }
  }
  useEffect(() => {
    const abortController = new AbortController();
    Promise.allSettled([
      fetchAdvances(),
      fetchSetups([
        'currencies',
      ]),
    ]);
    return () => abortController.abort('Duplicate fetch!');
  }, [fetchAdvances, fetchSetups]);

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
        label: "Advance Requests",
        path: "/dashboard/make-request/advance requests",
      },
    ]);
  }, [setBreadcrumb]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAdvanceLines = async () => {

      const res = await getResource('imprestLine', {
        params: {
          filters: {
            documentNo: formData.no,
          },
        },
      });
      if (res.error) {
        return Swal.fire(res.error.code, res.error.message, 'error');
      }
      dispatcher(
        {
          type: 'SET_EXISTING_ADVANCE_LINES',
          payload: res.value,
        },
      );
    }
    if (formData.no) {

    }
    Promise.all([
      fetchLineSetup(),
      fetchAdvanceLines(),
    ]);
    return () => abortController.abort('Duplicate request');
  }, [showModal, formData]);
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
                  setSelectedRowHandler={(advance: Advance) => handleSetSelectedRow(advance)}
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
                  setSelectedRowHandler={(advance: Advance) => handleSetSelectedRow(advance)}
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
                setSelectedRowHandler={(advance: Advance) => handleSetSelectedRow(advance)}
              />
            </div>
          </div>
        ) : null}
      </div>

      <CustomModal
        show={showModal}
        onClose={handleCloseModal}
        title="Request Advance"
        size="xl"
        titleIcon={<Wallet size={18} className="text-white" />}
      >
        <div className="row">
          <div className="col-md-12">
            <OperationalAdvanceForm />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}

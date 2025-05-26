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
import { Advance, FormData } from "@/app/types/advance";
import { getResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { useMySetups } from "@/app/context/SetupContext";
import { useAdvance } from "@/app/context/AdvanceContext";
import AdvanceSettlement from "@/app/components/advances/forms/AdvanceSettlement";
import { usePageLoader } from "@/app/context/PageLoaderContext";

const ReusableSalaryAdvanceTabs = dynamic(
  () => import("@/app/components/tables/ReusableSalaryAdvanceTabs"),
  { ssr: false }
);

export default function OtherAdvancesClient() {
  const { data: session } = useSession();
  const [advanceData, setAdvanceData] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab] = useState<string>("open");

  const [placement, setPlacement] = useState<
    "right" | "top" | "bottom" | "left"
  >("top");
  const [showModal, setShowModal] = useState(false);
  const { setBreadcrumb } = useBreadcrumb();
  const { fetchSetups } = useMySetups();
  const {
    formData,
    actions,
    advanceCounts,
    showAdvannceSettlementForm,
    showAdvanceAccountedLineDetailsModal,
  } = useAdvance();
  const { dispatcher, handleFetchingSetup, fetchLineSetup } = actions;
  const { actions: loaderActions } = usePageLoader();
  const { dispatcher: loaderDispatcher } = loaderActions;

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


  const handleSettlementClosing = () => {
    dispatcher({
      type: 'SET_SETTLEMENT_MODAL',
      payload: false,
    });
    dispatcher({
      type: 'OPEN_EXISTING_ADVANCE',
      payload: {
        imprestType: "",
        Purpose: "",
        amountToPayHeader: null,
        currencyCode: "",
        paymentMethod: "",
        cashCollectionDate: "",
        cashHours: "",
        idPassportNumber: "",
        accountNo: "",
        bankNo: "",
        branch: "",
        swiftCode: "",
        phoneNo: "",
        accountName: "",
        no: "",
        imprestStatus: "",
        status: "",
      },
    });
    dispatcher({
      type: 'SET_EXISTING_ADVANCE_LINES',
      payload: [],
    });
    dispatcher({
      type: 'ADVANCE_CREATION_STATUSES',
      payload: { isNew: false, isEditing: false, setForView: false },
    });

  }

  const handleClosingAdvanceAccountedLineDetailsModal = () => {
    dispatcher({
      type: 'SET_ADVANCE_ACCOUNTED_LINE_DETAILS_MODAL',
      payload: false,
    });
    dispatcher({
      type: 'SET_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS',
      payload: {},
    });
    dispatcher({
      type: 'SET_ACCOUNTING_LINES_FOR_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS',
      payload: [],
    });
    dispatcher({
      type: 'SET_SETTLEMENT_MODAL',
      payload: true,
    });
  }

  const handleNewRequestClick = async () => {
    await handleFetchingSetup();
    await fetchLineSetup();
    dispatcher({
      type: 'ADVANCE_CREATION_STATUSES',
      payload: { isNew: true, isEditing: false, setForView: false },
    });
    setShowModal(true);
  }
  const handleCloseModal = () => {
    dispatcher({
      type: 'OPEN_EXISTING_ADVANCE',
      payload: {
        imprestType: "",
        Purpose: "",
        amountToPayHeader: null,
        currencyCode: "",
        paymentMethod: "",
        cashCollectionDate: "",
        cashHours: "",
        idPassportNumber: "",
        accountNo: "",
        bankNo: "",
        branch: "",
        swiftCode: "",
        phoneNo: "",
        accountName: "",
        no: "",
        imprestStatus: "",
        status: "",
      },
    });
    dispatcher({
      type: 'ADVANCE_CREATION_STATUSES',
      payload: { isNew: false, isEditing: false, setForView: false },
    });
    setShowModal(false)
  };



  const cards = [
    {
      title: "Open",
      value: `${advanceCounts?.open} Open`,
      description: "Open Advances",
      icon: <FileClock size={28} />,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-warning",
    },
    {
      title: "Approvals",
      value: `${advanceCounts?.pending} Pending`,
      description: "Pending Approval",
      icon: <ClipboardList size={28} />,
      bgColorClass: "bg-light-success",
      textColorClass: "text-success",
    },
    {
      title: "Approved",
      value: `${advanceCounts?.released} Approved`,
      description: "Released Advances",
      icon: <BadgeCheck size={28} />,
      bgColorClass: "bg-light-info",
      textColorClass: "text-info",
    },
    {
      title: "Total",
      value: `${advanceCounts?.total} Total`,
      description: "Total Requests",
      icon: <Layers3 size={28} />,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-secondary",
    },
  ];

  const handleSetSelectedRow = async (advance: FormData | null = null, ...args: any) => {
    if (advance) {
      loaderDispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: '',
        }
      });
      await handleFetchingSetup();
      await fetchLineSetup();
      dispatcher({
        type: 'OPEN_EXISTING_ADVANCE',
        payload: advance,
      });
      dispatcher({
        type: 'ADVANCE_CREATION_STATUSES',
        payload: { isNew: false, isEditing: advance.status === 'Open', setForView: true },
      });
      if (args.length && args[0].length) {
        const [isSettlement] = args[0];
        if (isSettlement) {
          dispatcher({
            type: 'SET_SETTLEMENT_MODAL',
            payload: true,
          });
          loaderDispatcher({
            type: 'PATCH_LOADING_STATE',
            payload: {
              loading: false,
              message: '',
            }
          });
        }
      } else {
        setShowModal(true);
        loaderDispatcher({
          type: 'PATCH_LOADING_STATE',
          payload: {
            loading: false,
            message: '',
          }
        });
      }
    } else {
      setShowModal(false);
      dispatcher({
        type: 'OPEN_EXISTING_ADVANCE',
        payload: {
          imprestType: "",
          Purpose: "",
          amountToPayHeader: null,
          currencyCode: "",
          paymentMethod: "",
          cashCollectionDate: "",
          cashHours: "",
          idPassportNumber: "",
          accountNo: "",
          bankNo: "",
          branch: "",
          swiftCode: "",
          phoneNo: "",
          accountName: "",
          no: "",
          imprestStatus: "",
          status: "",
        },
      });
      dispatcher({
        type: 'ADVANCE_CREATION_STATUSES',
        payload: { isNew: false, isEditing: false, setForView: false },
      });
      loaderDispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
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
            documentNo: formData?.no,
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
    if (formData?.no) {

    }
    Promise.all([
      fetchLineSetup(),
      fetchAdvanceLines(),
    ]);
    return () => abortController.abort('Duplicate request');
  }, [showModal, formData, dispatcher, fetchLineSetup]);
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
    <>
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
                    initialTab={activeStatusTab}
                    refetch={fetchAdvances}
                    setSelectedRowHandler={(advance: FormData, ...args: any) => handleSetSelectedRow(advance, args)}
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
                    initialTab={activeStatusTab}
                    refetch={fetchAdvances}
                    setSelectedRowHandler={(advance: FormData, ...args: any) => handleSetSelectedRow(advance, args)}
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
                  initialTab={activeStatusTab}
                  refetch={fetchAdvances}
                  setSelectedRowHandler={(advance: FormData, ...args: any) => handleSetSelectedRow(advance, args)}
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
              <OperationalAdvanceForm closeModalHandler={handleCloseModal} openSettlmentModalFactory={handleSetSelectedRow} />
            </div>
          </div>
        </CustomModal>
      </div>
      <CustomModal
        show={showAdvannceSettlementForm}
        onClose={handleSettlementClosing}
        title="Settle Advance"
        titleIcon={<i className="las la-wallet fs-18" />}
        size="xl"
      >
        <AdvanceSettlement closeSettlementDialog={handleSettlementClosing} />
      </CustomModal>
      <CustomModal
        show={showAdvanceAccountedLineDetailsModal}
        onClose={handleClosingAdvanceAccountedLineDetailsModal}
        title="Acoounted Line Details"
        titleIcon={<i className="las la-wallet fs-18" />}
        size="xl"
      >
        <AdvanceSettlement />
      </CustomModal>
    </>
  );
}

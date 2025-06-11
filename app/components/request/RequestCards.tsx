"use client";

import { Wallet, Eye, PlusCircle, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState, startTransition } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../dashboard/cards/Cards.css";
import "./RequestCards.css";
import { useSession } from "next-auth/react";
import CustomModal from "../modals/CustomModal";
import SalaryAdvanceForm from "../advances/forms/SalaryAdvanceForm";
import OperationalAdvanceForm from "../advances/forms/OperationalAdvanceForm";
import RequisitionForm from "../requisitions/forms/RequisitionForm";
import AdvanceSettlementForm from "../advances/forms/AdvanceSettlement";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import { useRouter } from "next/navigation";
import { useAdvance } from "@/app/context/AdvanceContext";
import { AdvanceType } from "@/app/types/advance";

type AdvanceTypeKey = "Salary" | "Other" | null;
type RequestType = "Advance" | "Expense" | "Requisition" | null;

const captions = {
  Other: "",
};

export default function RequestCards() {
  const router = useRouter();
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<{
    pending: number;
    released: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [advanceType, setAdvanceType] = useState<AdvanceTypeKey>(null);
  const [requestType, setRequestType] = useState<RequestType>(null);
  const { data: session } = useSession();
  const { actions: loaderActions } = usePageLoader();
  const { dispatcher: dispatchLoader } = loaderActions;
  const { advanceTypes, actions } = useAdvance();
  const { dispatcher, handleFetchingSetup, fetchAdvances: otherAdvances } = actions;

  const handleNavigate = (e: React.MouseEvent, href: string) => {
    e.stopPropagation();
    dispatchLoader({
      type: "PATCH_LOADING_STATE",
      payload: {
        loading: true,
        message: "",
      },
    });
    requestAnimationFrame(() => {
      startTransition(
        () => (
          router.push(href),
          dispatchLoader({
            type: "PATCH_LOADING_STATE",
            payload: {
              loading: false,
              message: "",
            },
          })
        )
      );
    });
  };

  const handleOpenModal = (type: RequestType) => {
    setRequestType(type);
    setShowModal(true);
  };
  const handleSetAdvanceType = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const dataType = event.currentTarget.getAttribute(
      "datatype"
    ) as AdvanceTypeKey;
    switch (dataType) {
      case "Salary": {
        setAdvanceType(dataType);
        setShowNewDropdown(false);
        handleOpenModal("Advance");
        break;
      }
      case "Other": {
        await handleFetchingSetup();
        dispatcher({
          type: "ADVANCE_CREATION_STATUSES",
          payload: { isNew: true, isEditing: false, setForView: false },
        });
        setAdvanceType(dataType);
        setShowNewDropdown(false);
        handleOpenModal("Advance");
        break;
      }
    }
  };

  const handleCloseModal = (modal = '') => (
    setShowModal(false),
    dispatcher({
      type: "ADVANCE_CREATION_STATUSES",
      payload: { isNew: false, isEditing: false, setForView: false },
    }),
    dispatcher({
      type: "OPEN_EXISTING_ADVANCE",
      payload: {
        imprestType: "",
        Purpose: "",
        amountToPayHeader: null,
        currencyCode: "KES",
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
    }),
    (
      (
        async () => {
          if (modal === 'other') {
            await otherAdvances()
          }
        }
      )()
    )
  );

  const fetchAdvances = useCallback(async () => {
    if (!session?.user?.profile?.no) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/bc/advances/salary/requests?employeeNo=${session?.user?.profile?.no}`
      );
      const json = await res.json();
      const data = json?.data?.value || [];
      const pending = data.filter(
        (a: any) => a.status === "Pending Approval"
      ).length;
      const released = data.filter((a: any) => a.status === "Released").length;
      setMetrics({ pending, released });
    } catch (err) {
      console.error("\u274C Failed to fetch advances:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.profile?.no]);

  useEffect(() => {
    router.prefetch("/dashboard/make-request/advances");
    router.prefetch("/dashboard/make-request/travel");
  }, [router]); //
  useEffect(() => {
    if (activeIndex === 0 && !metrics && !isLoading) {
      fetchAdvances();
    }
  }, [activeIndex, metrics, isLoading, fetchAdvances]);

  return (
    <>
      <div className="row row-cols-1 row-cols-md-4 g-3">
        <div className="col">
          <div
            className={`card request-hover-card h-100 text-center d-flex flex-column p-2 position-relative ${activeIndex === 0 ? "active" : ""
              }`}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (
                !target.closest("a") &&
                !target.closest("button") &&
                !target.closest(".dropdown-menu")
              ) {
                setActiveIndex(activeIndex === 0 ? null : 0);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {/* <div className="ribbon4 rib4-danger">
              <span className="ribbon4-band ribbon4-band-danger text-white text-center">
                New
              </span>
            </div> */}

            <div className="card-body d-flex flex-column justify-content-center align-items-center py-3">
              <div className="mb-2">
                <Wallet className="text-primary card-icon" size={28} />
                <h6 className="card-title mt-2 fw-semibold small text-uppercase">
                  Advances
                </h6>
              </div>
              <div className="row g-2 mb-2 w-100">
                <div className="col-6">
                  <div className="p-2 bg-light-primary rounded">
                    <h6 className="mb-0 small">Pending</h6>
                    <h5 className="text-primary">
                      {isLoading ? (
                        <Skeleton width={30} />
                      ) : (
                        metrics?.pending ?? "--"
                      )}
                    </h5>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 bg-light-success rounded">
                    <h6 className="mb-0 small">Approved</h6>
                    <h5 className="text-success">
                      {isLoading ? (
                        <Skeleton width={30} />
                      ) : (
                        metrics?.released ?? "--"
                      )}
                    </h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer border-0 bg-transparent d-flex justify-content-center gap-3 pb-3 pt-0 position-relative">
              <div className="dropdown position-relative">
                <button
                  className="btn btn-sm btn-outline-info d-flex align-items-center gap-1 dropdown-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowViewDropdown(!showViewDropdown);
                    setShowNewDropdown(false);
                  }}
                >
                  <Eye size={16} /> View <ChevronDown size={14} />
                </button>
                {showViewDropdown && (
                  <div
                    className="dropdown-menu show shadow-sm"
                    style={{
                      top: "100%",
                      left: 0,
                      zIndex: 1000,
                    }}
                  >
                    {advanceTypes.map((type) => {
                      return (
                        <button
                          key={type.key}
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowViewDropdown(false);
                            handleNavigate(
                              e,
                              `/dashboard/make-request/${type.route}`
                            );
                          }}
                        >
                          {type.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="dropdown position-relative">
                <button
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 dropdown-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewDropdown(!showNewDropdown);
                    setShowViewDropdown(false);
                  }}
                >
                  <PlusCircle size={16} /> New <ChevronDown size={14} />
                </button>
                {showNewDropdown && (
                  <div
                    className="dropdown-menu show shadow-sm"
                    style={{
                      top: "100%",
                      left: 0,
                      zIndex: 1000,
                    }}
                  >
                    {advanceTypes.map((advance: AdvanceType) => {
                      return (
                        <button
                          className="dropdown-item"
                          key={advance.key}
                          datatype={advance.key}
                          onClick={handleSetAdvanceType}
                          disabled={advance.disabled}
                        >
                          {advance.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div
            className={`card request-hover-card h-100 text-center d-flex flex-column p-2 position-relative ${activeIndex === 1 ? "active" : ""
              }`}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (
                !target.closest("a") &&
                !target.closest("button") &&
                !target.closest(".dropdown-menu")
              ) {
                setActiveIndex(activeIndex === 1 ? null : 1);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body d-flex flex-column justify-content-center align-items-center py-3">
              <Wallet className="text-primary card-icon" size={28} />
              <h6 className="card-title mt-2 fw-semibold small text-uppercase">
                Travel Requests
              </h6>
            </div>
            <div className="card-footer border-0 bg-transparent d-flex justify-content-center gap-3 pb-3 pt-0">
              <button
                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                onClick={(e) =>
                  handleNavigate(e, "/dashboard/make-request/travel")
                }
              >
                <Eye size={16} /> View
              </button>

              {/* <button
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setAdvanceType("Travel");
                  handleOpenModal("Advance");
                }}
              >
                <PlusCircle size={16} /> New
              </button> */}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card request-hover-card h-100 text-center d-flex flex-column p-2 bg-light-secondary">
            <div className="card-body d-flex flex-column justify-content-center align-items-center py-3">
              <Wallet className="text-primary card-icon" size={28} />
              <h6 className="card-title mt-2 fw-semibold small text-uppercase">
                Requisitions
              </h6>
            </div>
            <div className="card-footer border-0 bg-transparent text-muted d-flex align-items-center justify-content-center gap-3">
              <button
                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                onClick={() => handleOpenModal("Requisition")}
              >
                <PlusCircle size={16} /> New
              </button>
              <button
                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                onClick={(e) =>
                  handleNavigate(e, "/dashboard/make-request/requisitions")
                }
              >
                <Eye size={16} /> View
              </button>
            </div>
          </div>
        </div>

        <div className="col">
          <div
            className="card request-hover-card h-100 text-center d-flex flex-column p-2 bg-light-secondary"
            style={{ opacity: 0.5, cursor: "not-allowed" }}
          >
            <div className="ribbon4 rib4-secondary">
              <span className="ribbon4-band ribbon4-band-secondary text-white text-center">
                Soon
              </span>
            </div>
            <div className="card-body d-flex flex-column justify-content-center align-items-center py-3">
              <Wallet className="text-muted card-icon" size={28} />
              <h6 className="card-title mt-2 fw-semibold small text-uppercase text-muted">
                Record Expenses
              </h6>
            </div>
            <div className="card-footer border-0 bg-transparent text-muted">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
      <CustomModal
        show={showModal}
        onClose={handleCloseModal}
        title={
          requestType === "Expense"
            ? "Record Expense"
            : requestType === "Requisition"
              ? "New Requisition"
              : `Request ${captions[advanceType]} Advance`
        }
        size="xl"
        titleIcon={<PlusCircle size={18} className="text-white" />}
      >
        <div className="row">
          {requestType === "Advance" && advanceType === "Salary" && (
            <>
              <SalaryAdvanceForm
                onSuccess={() => {
                  setShowModal(false);
                  fetchAdvances();
                }}
              />
            </>
          )}
          {requestType === "Advance" && advanceType === "Other" && (
            <div className="col-md-12">
              <OperationalAdvanceForm closeModalHandler={() => handleCloseModal('other')} />
            </div>
          )}
          {requestType === "Expense" && (
            <div className="col-md-12">
              <AdvanceSettlementForm />
            </div>
          )}
          {requestType === "Requisition" && (
            <div className="col-md-12">
              <RequisitionForm onClose={handleCloseModal} />
            </div>
          )}
        </div>
      </CustomModal>
    </>
  );
}

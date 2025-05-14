"use client";

import { Wallet, Eye, PlusCircle, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../dashboard/cards/Cards.css";
import "./RequestCards.css";
import { useSession } from "next-auth/react";
import CustomModal from "../modals/CustomModal";
import SalaryAdvanceForm from "../advances/forms/SalaryAdvanceForm";
import OperationalAdvanceForm from "../advances/forms/OperationalAdvanceForm";
import VerticalProgressCard from "../advances/forms/VerticalProgressCard";
import AdvanceSettlementForm from "../advances/forms/AdvanceSettlementForm";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import { useRouter } from "next/navigation";
import TravelRequestWizard from "../travel/TravelRequestWizard";
import { startTransition } from "react";

type AdvanceType = "Salary" | "Operational" | "Travel" | null;
type RequestType = "Advance" | "Expense" | null;

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
  const [advanceType, setAdvanceType] = useState<AdvanceType>(null);
  const [requestType, setRequestType] = useState<RequestType>(null);
  const { data: employee } = useSession();
  const { showLoader } = usePageLoader();

  useEffect(() => {
    router.prefetch("/dashboard/make-request/advances");
    router.prefetch("/dashboard/make-request/travel");
  }, [router]); //

  const handleNavigate = (e: React.MouseEvent, href: string) => {
    e.stopPropagation();
    showLoader();
    requestAnimationFrame(() => {
      startTransition(() => router.push(href));
    });
  };

  const handleOpenModal = (type: RequestType) => {
    setRequestType(type);
    setShowModal(true);
  };

  const fetchAdvances = useCallback(async () => {
    if (!employee?.user?.profile?.number) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/bc/advances/salary/requests?employeeNo=${employee?.user?.profile?.number}`
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
  }, [employee?.user?.profile?.number]);

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
            className={`card request-hover-card h-100 text-center d-flex flex-column p-2 position-relative ${
              activeIndex === 0 ? "active" : ""
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
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowViewDropdown(false);
                        handleNavigate(e, "/dashboard/make-request/advances");
                      }}
                    >
                      Salary Advances
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowViewDropdown(false);
                        handleNavigate(
                          e,
                          "/dashboard/make-request/otherAdvances"
                        );
                      }}
                    >
                      Other Advances
                    </button>
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
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdvanceType("Salary");
                        setShowNewDropdown(false);
                        handleOpenModal("Advance");
                      }}
                    >
                      Salary Advance
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdvanceType("Operational");
                        setShowNewDropdown(false);
                        handleOpenModal("Advance");
                      }}
                    >
                      Other Advance
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div
            className={`card request-hover-card h-100 text-center d-flex flex-column p-2 position-relative ${
              activeIndex === 1 ? "active" : ""
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

              <button
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setAdvanceType("Travel");
                  handleOpenModal("Advance");
                }}
              >
                <PlusCircle size={16} /> New
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

        {/* Placeholder Card for Requisitions */}
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
                Requisitions
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
        onClose={() => setShowModal(false)}
        title={
          requestType === "Expense"
            ? "Record Expense"
            : `Request ${advanceType} Advance`
        }
        size="xl"
        titleIcon={<PlusCircle size={18} className="text-white" />}
      >
        <div className="row">
          {requestType === "Advance" && advanceType === "Salary" && (
            <>
              <div className="col-md-8">
                <SalaryAdvanceForm
                  onSuccess={() => {
                    setShowModal(false);
                    fetchAdvances();
                  }}
                />
              </div>
              <div className="col-md-4">
                <VerticalProgressCard />
              </div>
            </>
          )}
          {requestType === "Advance" && advanceType === "Operational" && (
            <div className="col-md-12">
              <OperationalAdvanceForm />
            </div>
          )}
          {requestType === "Advance" && advanceType === "Travel" && (
            <div className="col-md-12">
              <TravelRequestWizard />
            </div>
          )}
          {requestType === "Expense" && (
            <div className="col-md-12">
              <AdvanceSettlementForm />
            </div>
          )}
        </div>
      </CustomModal>
    </>
  );
}

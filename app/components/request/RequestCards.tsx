"use client";

import { Wallet, Eye, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../dashboard/cards/Cards.css";
import "./RequestCards.css";
import { useEmployee } from "@/app/context/EmployeeContext";
import CustomModal from "../modals/CustomModal";
import SalaryAdvanceForm from "../advances/forms/SalaryAdvanceForm";
import OperationalAdvanceForm from "../advances/forms/OperationalAdvanceForm";
import VerticalProgressCard from "../advances/forms/VerticalProgressCard";
import AdvanceSettlementForm from "../advances/forms/AdvanceSettlementForm";

type AdvanceType = "Salary" | "Operational" | "Travel" | null;
type RequestType = "Advance" | "Expense" | null;

export default function RequestCards() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<{
    pending: number;
    released: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [advanceType, setAdvanceType] = useState<AdvanceType>(null);
  const [requestType, setRequestType] = useState<RequestType>(null);
  const { employee } = useEmployee();

  const handleOpenModal = (type: RequestType) => {
    setRequestType(type);
    setShowModal(true);
  };

  const fetchAdvances = async () => {
    if (!employee?.number) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/bc/advances/salary/requests?employeeNo=${employee.number}`
      );
      const json = await res.json();
      const data = json?.data?.value || [];
      const pending = data.filter(
        (a: any) => a.status === "Pending Approval"
      ).length;
      const released = data.filter((a: any) => a.status === "Released").length;
      setMetrics({ pending, released });
    } catch (err) {
      console.error("❌ Failed to fetch advances:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeIndex === 0 && !metrics && !isLoading) {
      fetchAdvances();
    }
  }, [activeIndex, metrics, isLoading]);

  return (
    <>
      <div className="row row-cols-1 row-cols-md-4 g-3">
        {/* Advances Card */}
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
            <div className="ribbon4 rib4-danger">
              <span className="ribbon4-band ribbon4-band-danger text-white text-center">
                New
              </span>
            </div>

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

            <div className="card-footer border-0 bg-transparent d-flex justify-content-center gap-3 pb-3 pt-0">
              <Link
                href="/dashboard/make-request/advances"
                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye size={16} /> View
              </Link>

              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-success dropdown-toggle d-flex align-items-center gap-1"
                  data-bs-toggle="dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PlusCircle size={16} /> New
                </button>
                <div
                  className="dropdown-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setAdvanceType("Salary");
                      handleOpenModal("Advance");
                    }}
                  >
                    Salary Advance
                  </a>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setAdvanceType("Operational");
                      handleOpenModal("Advance");
                    }}
                  >
                    Operational Advance
                  </a>
                  <a className="dropdown-item disabled" href="#">
                    Travel Advance
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Record Expenses Card (Active) */}
        <div className="col">
          <div
            className={`card request-hover-card h-100 text-center d-flex flex-column p-2 position-relative ${
              activeIndex === 1 ? "active" : ""
            }`}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest("a") && !target.closest("button")) {
                setActiveIndex(activeIndex === 1 ? null : 1);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="ribbon4 rib4-danger">
              <span className="ribbon4-band ribbon4-band-danger text-white text-center">
                New
              </span>
            </div>

            <div className="card-body d-flex flex-column justify-content-center align-items-center py-3">
              <div className="mb-2">
                <Wallet className="text-primary card-icon" size={28} />
                <h6 className="card-title mt-2 fw-semibold small text-uppercase">
                  Record Expenses
                </h6>
              </div>
            </div>

            <div className="card-footer border-0 bg-transparent d-flex justify-content-center gap-3 pb-3 pt-0">
              <Link
                href="/dashboard/make-request/advances"
                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye size={16} /> View
              </Link>
              <button
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal("Expense");
                }}
              >
                <PlusCircle size={16} /> New
              </button>
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

      {/* Modal */}
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
          <div className="col-md-8">
            {requestType === "Advance" && advanceType === "Salary" && (
              <SalaryAdvanceForm />
            )}
            {requestType === "Advance" && advanceType === "Operational" && (
              <OperationalAdvanceForm />
            )}
            {requestType === "Expense" && <AdvanceSettlementForm />}
          </div>
          <div className="col-md-4">
            <VerticalProgressCard />
          </div>
        </div>
      </CustomModal>
    </>
  );
}

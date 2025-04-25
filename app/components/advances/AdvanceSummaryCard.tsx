"use client";

import { useState } from "react";
import { Wallet, Bell, Coins, BarChart } from "lucide-react";
import "../dashboard/cards/Cards.css";
import CustomModal from "../modals/CustomModal";
import AdvanceSettlementForm from "./forms/AdvanceSettlementForm";
import VerticalProgressCard from "./forms/VerticalProgressCard";

type AdvanceSummaryCardProps = {
  filteredCount: number;
  statusFilter: string;
  typeFilter: string[];
  layout?: "horizontal" | "vertical";
  currentPlacement?: string;
  onPlacementChange?: (placement: "top" | "right" | "bottom" | "left") => void;
};

export default function AdvanceSummaryCard({
  filteredCount,
  statusFilter,
  typeFilter,
  layout = "vertical",
  currentPlacement = "right",
  onPlacementChange,
}: AdvanceSummaryCardProps) {
  const colClass = layout === "horizontal" ? "col-12 col-md-3" : "col-6";
  const unsettledAmount = 52400;

  const [showModal, setShowModal] = useState(false);

  const handleUnsettledClick = () => {
    if (unsettledAmount > 0) {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="card h-100 quick-actions-card w-100">
        <div className="card-body">
          {/* Header */}
          <div className="row align-items-center mb-3">
            <div className="col">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <i className="iconoir-coins text-primary me-2"></i>
                Advances Summary
              </h5>
            </div>
            <div className="col-auto">
              <div className="dropdown d-inline-block float-end">
                <a
                  className="dropdown-toggle arrow-none text-secondary"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="fa-solid fa-ellipsis fs-18"></i>
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  {["right", "top", "left", "bottom"].map((pos) => (
                    <a
                      key={pos}
                      className={`dropdown-item ${
                        currentPlacement === pos ? "active" : ""
                      }`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPlacementChange?.(pos as any);
                      }}
                    >
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="row g-1">
            <div className={colClass}>
              <div
                className="status-card bg-light-warning text-center rounded p-4 d-flex flex-column justify-content-center align-items-center h-100 cursor-pointer"
                onClick={handleUnsettledClick}
                style={{ cursor: unsettledAmount > 0 ? "pointer" : "default" }}
              >
                <Wallet className="mb-2 text-danger" size={28} />
                <h6 className="mb-1 fw-bold text-warning">
                  KES {unsettledAmount.toLocaleString()}
                </h6>
                <small className="text-muted">Unsettled Amount</small>
              </div>
            </div>

            <div className={colClass}>
              <div className="status-card bg-light-success text-center rounded p-4 d-flex flex-column justify-content-center align-items-center h-100">
                <Bell className="mb-2 text-success" size={28} />
                <h6 className="mb-1 fw-bold text-success">7 Pending</h6>
                <small className="text-muted">Approvals</small>
              </div>
            </div>

            <div className={colClass}>
              <div className="status-card bg-light-info text-center rounded p-4 d-flex flex-column justify-content-center align-items-center h-100">
                <Coins className="mb-2 text-info" size={28} />
                <h6 className="mb-1 fw-bold text-info">3 / 2 / 1</h6>
                <small className="text-muted">Advances by Type</small>
              </div>
            </div>

            <div className={colClass}>
              <div className="status-card bg-light-warning text-center rounded p-4 d-flex flex-column justify-content-center align-items-center h-100">
                <BarChart className="mb-2 text-warning" size={28} />
                <h6 className="mb-1 fw-bold text-warning">13</h6>
                <small className="text-muted">Total Requests Made</small>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          {currentPlacement !== "top" && currentPlacement !== "bottom" && (
            <div className="mt-3 text-center">
              <small className="text-muted fst-italic">
                <span className="text-info">{filteredCount}</span> Filtered{" "}
                <span className="text-info">{statusFilter}</span>{" "}
                <span className="text-info">
                  {typeFilter.length > 0
                    ? typeFilter.join(" and ")
                    : "Advances"}
                </span>{" "}
                <span>Advances</span>
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Modal with Settlement Form */}
      <CustomModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Settle Advance"
        size="xl"
      >
        <div className="row">
          <div className="col-md-9">
            <AdvanceSettlementForm />
          </div>
          <div className="col-md-3">
            <VerticalProgressCard />
          </div>
        </div>
      </CustomModal>
    </>
  );
}

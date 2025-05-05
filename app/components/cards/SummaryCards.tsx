import { useState } from "react";
import "../dashboard/cards/Cards.css";
import CustomModal from "../modals/CustomModal";

type CardMetric = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  bgColorClass: string;
  textColorClass: string;
  onClick?: () => void;
};

type SummaryCardsProps = {
  cards: CardMetric[];
  layout?: "horizontal" | "vertical";
  currentPlacement?: "top" | "right" | "bottom" | "left";
  onPlacementChange?: (placement: "top" | "right" | "bottom" | "left") => void;
  filteredCount?: number;
  statusFilter?: string;
  typeFilter?: string[];
  modalContent?: React.ReactNode;
  modalTitle?: string;
  actionButton?: React.ReactNode;
  title?: string;
};

export default function SummaryCards({
  cards,
  layout = "vertical",
  currentPlacement = "right",
  onPlacementChange,
  filteredCount,
  statusFilter,
  typeFilter = [],
  modalContent,
  modalTitle = "Details",
  actionButton,
  title,
}: SummaryCardsProps) {
  const colClass = layout === "horizontal" ? "col-12 col-md-3" : "col-6";
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="card h-100 quick-actions-card w-100">
        <div className="card-body" style={{ paddingBottom: "0.15rem" }}>
          <div className="d-flex justify-content-between align-items-center mb-2 pt-2">
            <div className="d-flex align-items-center gap-2">
              <div className="dropdown d-inline-block">
                <a
                  className="dropdown-toggle arrow-none text-secondary"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="fa-solid fa-ellipsis-vertical fs-16"></i>
                </a>
                <div className="dropdown-menu">
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

              <h5 className="card-title mb-0">{title || "Summary"}</h5>
            </div>

            {actionButton && <div>{actionButton}</div>}
          </div>

          <div className="row g-1">
            {cards.map((card, index) => (
              <div key={index} className={colClass}>
                <div
                  className={`status-card text-center rounded p-4 d-flex flex-column justify-content-center align-items-center h-100 ${card.bgColorClass}`}
                  style={{ cursor: card.onClick ? "pointer" : "default" }}
                  onClick={() => {
                    card.onClick?.();
                    if (modalContent && card.onClick) setShowModal(true);
                  }}
                >
                  <div className={`mb-2 ${card.textColorClass}`}>
                    {card.icon}
                  </div>
                  <h6 className={`mb-1 fw-bold ${card.textColorClass}`}>
                    {card.value}
                  </h6>
                  <small className="text-muted">{card.description}</small>
                </div>
              </div>
            ))}
          </div>

          {currentPlacement !== "top" && currentPlacement !== "bottom" && (
            <div className="mt-3 text-center">
              <small className="text-muted fst-italic">
                <span className="text-info">{filteredCount}</span> Filtered{" "}
                <span className="text-info">{statusFilter}</span>{" "}
                <span className="text-info">
                  {typeFilter.length > 0 ? typeFilter.join(" and ") : "Records"}
                </span>{" "}
                <span>Total</span>
              </small>
            </div>
          )}
        </div>
      </div>

      {modalContent && (
        <CustomModal
          show={showModal}
          onClose={() => setShowModal(false)}
          title={modalTitle}
          size="xl"
        >
          {modalContent}
        </CustomModal>
      )}
    </>
  );
}

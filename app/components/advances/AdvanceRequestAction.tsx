"use client";

import { useEffect, useState } from "react";
import CustomModal from "../modals/CustomModal";
import SalaryAdvanceForm from "../advances/forms/SalaryAdvanceForm";
import OperationalAdvanceForm from "../advances/forms/OperationalAdvanceForm";
import AdvanceSettlementForm from "../advances/forms/AdvanceSettlementForm";
import VerticalProgressCard from "../advances/forms/VerticalProgressCard";
import { Wallet, Plus } from "lucide-react";
import { Advance, SalaryAdvanceData } from "@/app/types/advance";

type AdvanceType =
  | "Salary"
  | "Operational"
  | "Settlement"
  | "Travel"
  | "Advance"
  | null;

interface AdvanceRequestActionProps {
  advance: Advance | null;
  refetch?: () => void;
  onCloseView?: () => void;
  employeeNo?: string;
}

export default function AdvanceRequestAction({
  advance,
  refetch,
  onCloseView,
  employeeNo,
}: AdvanceRequestActionProps) {
  const [showModal, setShowModal] = useState(false);
  const [advanceType, setAdvanceType] = useState<AdvanceType>(null);
  const [editingAdvance, setEditingAdvance] =
    useState<SalaryAdvanceData | null>(null);

  useEffect(() => {
    if (advance) {
      setAdvanceType(advance.advanceType);
      setEditingAdvance(advance as SalaryAdvanceData);
      setShowModal(true);
    }
  }, [advance]);

  const handleNewRequest = (type: AdvanceType) => {
    setAdvanceType(type);
    setEditingAdvance(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setAdvanceType(null);
    setEditingAdvance(null);
    setShowModal(false);
    if (refetch) refetch();
    if (onCloseView) onCloseView();
  };

  const renderForm = () => {
    const formType = editingAdvance?.advanceType || advanceType;
    switch (formType) {
      case "Salary":
      case "Advance":
        return (
          <SalaryAdvanceForm
            advance={editingAdvance}
            onSuccess={handleCloseModal}
            employeeNo={employeeNo}
          />
        );
      case "Operational":
        return <OperationalAdvanceForm />;
      case "Settlement":
        return <AdvanceSettlementForm />;
      case "Travel":
        return <div className="alert alert-info">Travel form coming soon!</div>;
      default:
        return <div className="text-muted">Select an advance type</div>;
    }
  };

  const modalTitle = editingAdvance
    ? `View/Edit ${editingAdvance.advanceType} Advance - ${editingAdvance.no}`
    : advanceType === "Settlement"
    ? "Settle Advance"
    : `Request ${advanceType || ""} Advance`;

  const renderModal = () => {
    const isSalary =
      advanceType === "Salary" || editingAdvance?.advanceType === "Salary";

    return (
      <CustomModal
        show={showModal}
        onClose={handleCloseModal}
        title={modalTitle}
        size="xl"
        titleIcon={<Wallet size={18} className="text-white" />}
      >
        <div className="row">
          <div className={isSalary ? "col-md-9" : "col-md-12"}>
            {renderForm()}
          </div>
          {isSalary && (
            <div className="col-md-3">
              <VerticalProgressCard advance={editingAdvance} />
            </div>
          )}
        </div>
      </CustomModal>
    );
  };

  return (
    <>
      {!editingAdvance && (
        <div className="dropdown">
          <a
            className="btn bg-danger text-white dropdown-toggle d-flex align-items-center"
            data-bs-toggle="dropdown"
            href="#"
            role="button"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <Plus size={15} className="text-white" /> New Request
            <i className="las la-angle-down ms-1"></i>
          </a>
          <div className="dropdown-menu shadow">
            <a
              className="dropdown-item d-flex align-items-center"
              href="#"
              onClick={() => handleNewRequest("Salary")}
            >
              <i className="fa-solid fa-money-bill me-2 text-success"></i>
              Salary Advance
            </a>
            <a
              className="dropdown-item d-flex align-items-center"
              href="#"
              onClick={() => handleNewRequest("Travel")}
            >
              <i className="fa-solid fa-plane me-2 text-info"></i>
              Travel Advance
            </a>
            <a
              className="dropdown-item d-flex align-items-center"
              href="#"
              onClick={() => handleNewRequest("Operational")}
            >
              <i className="fa-solid fa-gear me-2 text-warning"></i>
              Operational Advance
            </a>
            <a
              className="dropdown-item d-flex align-items-center"
              href="#"
              onClick={() => handleNewRequest("Settlement")}
            >
              <i className="fa-solid fa-file-invoice-dollar me-2 text-secondary"></i>
              Advance Settlement
            </a>
          </div>
        </div>
      )}
      {renderModal()}
    </>
  );
}

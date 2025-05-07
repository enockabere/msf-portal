"use client";

import { useEffect, useState } from "react";
import CustomModal from "../modals/CustomModal";
import SalaryAdvanceForm from "../advances/forms/SalaryAdvanceForm";
import OperationalAdvanceForm from "../advances/forms/OperationalAdvanceForm";
import AdvanceSettlementForm from "../advances/forms/AdvanceSettlementForm";
import VerticalProgressCard from "../advances/forms/VerticalProgressCard";
import TravelAdvanceForm from "./forms/TravelAdvanceForm";
import { Wallet } from "lucide-react";
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
  refetch?: (updatedStatus?: string) => void;
  onCloseView?: () => void;
  employee?: {
    [key: string]: any;
  };
}

export default function AdvanceRequestAction({
  advance,
  refetch,
  onCloseView,
  employee,
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

  const handleCloseModal = (updatedStatus?: string) => {
    setAdvanceType(null);
    setEditingAdvance(null);
    setShowModal(false);
    if (refetch) refetch(updatedStatus);
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
            employee={employee}
          />
        );
      case "Operational":
        return <OperationalAdvanceForm />;
      case "Settlement":
        return <AdvanceSettlementForm />;
      case "Travel":
        return <TravelAdvanceForm />;
      default:
        return <div className="text-muted">Select an advance type</div>;
    }
  };

  const modalTitle = editingAdvance
    ? `View/Edit ${editingAdvance.advanceType} Advance - ${editingAdvance.no}`
    : "Advance Request Details";

  const renderModal = () => {
    const formType = editingAdvance?.advanceType || advanceType;
    const isSalary = formType === "Salary" || formType === "Advance";

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

  return <>{renderModal()}</>;
}

"use client";

import { useEffect, useState } from "react";
import CustomModal from "../modals/CustomModal";
import SalaryAdvanceForm from "../advances/forms/SalaryAdvanceForm";
import OperationalAdvanceForm from "../advances/forms/OperationalAdvanceForm";
import AdvanceSettlementForm from "../advances/forms/AdvanceSettlementForm";
import VerticalProgressCard from "../advances/forms/VerticalProgressCard";
import TravelAdvanceForm from "./forms/TravelAdvanceForm";
import { Wallet } from "lucide-react";
import { Advance } from "@/app/types/advance";

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
  setSelectedRowHandlerCallback: (advance: Advance) => void;
  showCreate?: boolean;
}

export default function AdvanceRequestAction({
  advance,
  refetch,
  onCloseView,
  showCreate,
}: AdvanceRequestActionProps) {
  const [showModal, setShowModal] = useState(false);
  const [advanceType, setAdvanceType] = useState<AdvanceType>(null);

  useEffect(() => {
    if (advance) {
      setShowModal(true);
    } else if (showCreate) {
      console.log("🔄 Opening modal for creation");
      setAdvanceType("Salary");
      setShowModal(true);
    }
  }, [advance, showCreate]);

  const handleCloseModal = (updatedStatus?: string) => {
    setAdvanceType(null);
    setShowModal(false);
    if (refetch) refetch(updatedStatus);
    if (onCloseView) onCloseView?.();
  };

  const renderForm = () => {
    const formType = advance?.advanceType || advanceType;
    switch (formType) {
      case "Salary":
      case "Advance":
        return (
            <SalaryAdvanceForm
                advance={advance}
                onSuccess={handleCloseModal}
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

  const modalTitle = advance
      ? `View/Edit ${advance.advanceType} Advance - ${advance.no}`
      : "Advance Request Details";

  const renderModal = () => {
    const formType = advance?.advanceType || advanceType;
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
                  <VerticalProgressCard advance={advance} />
                </div>
            )}
          </div>
        </CustomModal>
    );
  };

  return <>{renderModal()}</>;
}

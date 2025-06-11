"use client";

import { useState } from "react";
import CustomModal from "../modals/CustomModal";
import SalaryAdvanceForm from "./forms/SalaryAdvanceForm";
import { Wallet } from "lucide-react";
import { Advance } from "../../types/advance";

interface AdvanceRequestActionProps {
  advance: Advance | null;
  refetch?: (updatedStatus?: string) => void;
  onCloseView?: () => void;
  setSelectedRowHandlerCallback: (advance: Advance) => void;
}

export default function AdvanceRequestAction({
  advance,
  refetch,
  onCloseView,
  setSelectedRowHandlerCallback,
}: AdvanceRequestActionProps) {
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = (updatedStatus?: string) => {
    setShowModal(false);
    if (refetch) refetch(updatedStatus);
    if (onCloseView) onCloseView();
  };

  return (
    <CustomModal
      show={showModal}
      onClose={handleCloseModal}
      title={
        advance
          ? `View/Edit Salary Advance - ${advance.no}`
          : "Salary Advance Details"
      }
      size="xl"
      titleIcon={<Wallet size={18} className="text-white" />}
    >
      {advance && (
        <SalaryAdvanceForm
          advance={advance}
          onSuccess={refetch}
          setSelectedRowHandler={setSelectedRowHandlerCallback}
        />
      )}
    </CustomModal>
  );
}

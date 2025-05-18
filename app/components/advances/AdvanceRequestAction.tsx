"use client";

import { useState } from "react";
import CustomModal from "../modals/CustomModal";
import SalaryAdvanceForm from "../advances/forms/SalaryAdvanceForm";
import VerticalProgressCard from "../advances/forms/VerticalProgressCard";
import { Wallet } from "lucide-react";
import { Advance } from "@/app/types/advance";

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
  setSelectedRowHandlerCallback
}: AdvanceRequestActionProps) {
  const [showModal, setShowModal] = useState(false);
  // const [editingAdvance, setEditingAdvance] =
  //   useState<SalaryAdvanceData | null>(null);

  // useEffect(() => {
  //   if (advance) {
  //     setEditingAdvance(advance as SalaryAdvanceData);
  //     setShowModal(true);
  //   }
  // }, [advance]);

  const handleCloseModal = (updatedStatus?: string) => {
    // setEditingAdvance(null);
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
      <div className="row">
        <div className="col-md-9">
          <SalaryAdvanceForm
            advance={advance}
            onSuccess={refetch}
            setSelectedRowHandler={setSelectedRowHandlerCallback}
          />
        </div>
        <div className="col-md-3">
          <VerticalProgressCard advance={advance} />
        </div>
      </div>
    </CustomModal>
  );
}
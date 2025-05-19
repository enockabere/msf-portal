"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import AdvanceRequestAction from "../advances/AdvanceRequestAction";
import { Advance, AdvanceTypeKey } from "@/app/types/advance";
import { usePathname } from "next/navigation";
import { GetColumnByType } from "../advances/AdvanceTableColumns";
import { useAdvance } from "@/app/context/AdvanceContext";
import CustomModal from "../modals/CustomModal";
import AdvanceSettlementForm from "../advances/forms/AdvanceSettlementForm";
import { useMySetups } from "@/app/context/SetupContext";

interface Props {
  data: Advance[];
  selectedAdvance?: Advance;
  loading: boolean;
  initialTab?: string;
  refetch: (updatedStatus?: string) => void;
  setSelectedRowHandler: (Advance: Advance | null) => void;
}

export default function ReusableSalaryAdvanceTabs({
  data,
  selectedAdvance,
  loading,
  initialTab,
  refetch,
  setSelectedRowHandler,
}: Props) {
  const [activeTab, setActiveTab] = useState("open");
  const didSetInitialTab = useRef(false);
  const path = usePathname();
  const { actions } = useAdvance();
  const { dispatcher } = actions;
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementAdvanceNo, setSettlementAdvanceNo] = useState<string | null>(
    null
  );
  const { imprestTypes, currencies, fetchSetups } = useMySetups();

  const advanceSet: AdvanceTypeKey = path.includes('otherAdvances') ? 'Other' : 'Salary';
  const columns = useMemo(() => {
    return GetColumnByType(advanceSet, setSelectedRowHandler, {
      currentTab: activeTab,
      currencies,
      imprestTypes,
      onSettleClick: (advanceNo: string) => {
        setSettlementAdvanceNo(advanceNo);
        setShowSettlementModal(true);
      },
    })
  }, [advanceSet, setSelectedRowHandler, activeTab]);


  const filteredByStatus = useMemo(() => {
    const advanceByStatus = Map.groupBy(data, ({ status }) => status);
    const open = advanceByStatus.get('Open') || [];
    const pending = advanceByStatus.get('Pending Approval') || [];
    const released = advanceByStatus.get('Released') || [];

    const counts = {
      open: open.length,
      pending: pending.length,
      released: released.length,
      total: open.length + pending.length + released.length,
    };

    if (counts.total > 0) {
      dispatcher({
        type: 'SET_ADVANCES_COUNTS',
        payload: counts,
      })
    }

    return {
      open,
      pending,
      released,
    };
  }, [data]);

  useEffect(() => {
    if (
      !didSetInitialTab.current &&
      initialTab &&
      ["open", "pending", "released"].includes(initialTab)
    ) {
      setActiveTab(initialTab);
      didSetInitialTab.current = true;
    }
  }, [initialTab]);

  useEffect(() => {
    fetchSetups([
      'imprestTypes',
    ]);
  })

  return (
    <div>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "open")}>
        <Tab eventKey="open" title={`Open (${filteredByStatus.open.length})`}>
          <div className="pt-3">
            <SkeletonDataTable
              columns={columns}
              data={filteredByStatus.open}
              searchPlaceholder="Search salary advances..."
              loading={loading}
            />
          </div>
        </Tab>
        <Tab
          eventKey="pending"
          title={`Pending (${filteredByStatus.pending.length})`}
        >
          <div className="pt-3">
            <SkeletonDataTable
              columns={columns}
              data={filteredByStatus.pending}
              searchPlaceholder="Search salary advances..."
              loading={loading}
            />
          </div>
        </Tab>
        <Tab
          eventKey="released"
          title={`Released (${filteredByStatus.released.length})`}
        >
          <div className="pt-3">
            <SkeletonDataTable
              columns={columns}
              data={filteredByStatus.released}
              searchPlaceholder="Search salary advances..."
              loading={loading}
            />
          </div>
        </Tab>
      </Tabs>

      <AdvanceRequestAction
        advance={selectedAdvance}
        refetch={(updatedStatus) => {
          setSelectedRowHandler(selectedAdvance);
          refetch(updatedStatus);
        }}
        setSelectedRowHandlerCallback={setSelectedRowHandler}
        onCloseView={() => setSelectedRowHandler(null)}
      />

      <CustomModal
        show={showSettlementModal}
        onClose={() => {
          setSettlementAdvanceNo(null);
          setShowSettlementModal(false);
        }}
        title="Settle Advance"
        titleIcon={<i className="las la-wallet fs-18" />}
        size="xl"
      >
        <AdvanceSettlementForm advanceNo={settlementAdvanceNo} />
      </CustomModal>
    </div>
  );
}

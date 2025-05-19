"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import AdvanceRequestAction from "../advances/AdvanceRequestAction";
import {Advance, AdvanceTypeKey} from "@/app/types/advance";
import { usePathname } from "next/navigation";
import { GetColumnByType } from "../advances/AdvanceTableColumns";

interface Props {
  data: Advance[];
  selectedAdvance?: Advance;
  loading: boolean;
  onCountsUpdate?: (counts: {
    open: number;
    pending: number;
    released: number;
    total: number;
  }) => void;
  initialTab?: string;
  refetch: (updatedStatus?: string) => void;
  setSelectedRowHandler: (Advance: Advance | null) => void;
}

export default function ReusableSalaryAdvanceTabs({
  data,
  selectedAdvance,
  loading,
  onCountsUpdate,
  initialTab,
  refetch,
  setSelectedRowHandler
}: Props) {
  const [activeTab, setActiveTab] = useState("open");
  const didSetInitialTab = useRef(false);
  const path = usePathname();






  const advanceSet: AdvanceTypeKey = path.includes('otherAdvances') ? 'Other' : 'Salary';
  const columns = GetColumnByType(advanceSet, setSelectedRowHandler);


  const filteredByStatus = useMemo(() => {
    const advanceByStatus = Map.groupBy(data, ({ status }) => status);
    const open = advanceByStatus.get('Open') || [];
    const pending = advanceByStatus.get('Pending Approval') || [];
    const released = advanceByStatus.get('Released') || [];

    const counts = {
      open: open.length,
      pending: pending.length,
      released: released.length,
      total: open.length + pending.length + released.length
    };

    // if (counts.total > 0) {
    //   onCountsUpdate(counts);
    // }

    return {
      open,
      pending,
      released
    };
  }, [data, onCountsUpdate]);

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
    </div>
  );
}
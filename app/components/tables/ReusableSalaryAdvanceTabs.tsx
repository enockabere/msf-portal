"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import AdvanceRequestAction from "../advances/AdvanceRequestAction";
import { Advance, AdvanceTypeKey } from "@/app/types/advance";
import { usePathname } from "next/navigation";
import { GetColumnByType } from "../advances/AdvanceTableColumns";
import { useAdvance } from "@/app/context/AdvanceContext";
import { useMySetups } from "@/app/context/SetupContext";
import { suggestImprestType } from "@/app/utils/helpers";

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
  const { imprestTypes, currencies, fetchSetups } = useMySetups();

  const isOtherAdvances = path.includes('otherAdvances');
  const advanceSet: AdvanceTypeKey = isOtherAdvances ? 'Other' : 'Salary';
  const searchPlaceHolder = isOtherAdvances ? 'Search advances...' : 'Search salary advances...'
  const getTypeIcon = useCallback((type: string, ...args: any) => {
    const icons: Record<AdvanceTypeKey, any> = {
      Salary: "fa-solid fa-money-bill",
      Other: {
        TRAVEL: "fa-solid fa-plane",
        OPERATION: "fa-solid fa-gear",
      },
    };
    if (isOtherAdvances) {
      let passedImprestType = '';
      for (const prop in icons[type]) {
        if (args.length && args[0].length) {
          const [value] = args;
          passedImprestType = suggestImprestType(prop, value);
          // if (value) {
          //   if (value.toLowerCase().split(' ').join("").includes(prop.toLowerCase())) {
          //     passedImprestType = prop;
          //   };
          // }
        }
      }
      return icons['Other'][passedImprestType] || "fa-solid fa-file-alt";
    }
    return icons[type] || "fa-solid fa-file-alt";
  }, [isOtherAdvances])

  const columns = useMemo(() => {
    return GetColumnByType(advanceSet, setSelectedRowHandler, {
      currentTab: activeTab,
      currencies,
      imprestTypes,
      getTypeIcon,

    })
  }, [advanceSet, setSelectedRowHandler, activeTab, getTypeIcon, imprestTypes, currencies]);

  const filteredByStatus = useMemo(() => {
    const advanceByStatus = Map.groupBy(data, ({ status }) => status);
    let open = advanceByStatus.get('Open') || [];
    let pending = advanceByStatus.get('Pending Approval') || [];
    let released = advanceByStatus.get('Released') || [];
    let settled = advanceByStatus.get('Settled') || [];
    let accounted = advanceByStatus.get('Accounted') || [];
    let rejected = advanceByStatus.get('Rejected') || [];
    let issued = advanceByStatus.get('Issued') || [];

    if (isOtherAdvances) {
      const advancesByImprestStatus = Map.groupBy(data, ({ imprestStatus }) => imprestStatus);
      open = advancesByImprestStatus.get('Draft') || [];
      pending = advancesByImprestStatus.get('Pending') || [];
      settled = advancesByImprestStatus.get('Settled') || [];
      accounted = advancesByImprestStatus.get('Accounted') || [];
      rejected = advancesByImprestStatus.get('Rejected') || [];
      issued = advancesByImprestStatus.get('Issued') || [];
      released = [
        ...advancesByImprestStatus.get('Approved') || [],
        ...advancesByImprestStatus.get('Posted') || [],
        ...advancesByImprestStatus.get('Pending Liquidation') || [],
        ...advancesByImprestStatus.get('Liquidation Rejected') || [],
        ...advancesByImprestStatus.get('Reversed') || [],
      ];

    }


    return {
      open,
      pending,
      settled,
      accounted,
      rejected,
      released,
      issued,
    };
  }, [data, isOtherAdvances]);

  useEffect(() => {
    const statuses = ['open', 'pending', 'released', 'settled', 'accounted', 'rejected', 'issued']
    const counts = {
      open: filteredByStatus.open.length,
      pending: filteredByStatus.pending.length,
      released: filteredByStatus.released.length,
      settled: filteredByStatus.settled.length,
      accounted: filteredByStatus.accounted.length,
      rejected: filteredByStatus.rejected.length,
      issued: filteredByStatus.issued.length,
      total: statuses.reduce((sum, status) => sum + filteredByStatus[status].length, 0),
    };

    if (counts.total > 0) {
      dispatcher({
        type: 'SET_ADVANCES_COUNTS',
        payload: counts,
      })
    }
  }, [filteredByStatus, dispatcher]);

  useEffect(() => {
    if (
      !didSetInitialTab.current &&
      initialTab &&
      ["open", "pending", "released", "Settled", "Accounted", "Rejected"].includes(initialTab)
    ) {
      setActiveTab(initialTab);
      didSetInitialTab.current = true;
    }
  }, [initialTab]);

  useEffect(() => {
    if (isOtherAdvances) {
      fetchSetups([
        'imprestTypes',
      ]);
    }
  });

  return (
    <div>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "open")}>
        <Tab eventKey="open" title={`Open (${filteredByStatus.open.length})`}>
          <div className="pt-3">
            <SkeletonDataTable
              columns={columns}
              data={filteredByStatus.open}
              searchPlaceholder={searchPlaceHolder}
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
              searchPlaceholder={searchPlaceHolder}
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
              searchPlaceholder={searchPlaceHolder}
              loading={loading}
            />
          </div>
        </Tab>
        <Tab
          eventKey="settled"
          title={`Settled (${filteredByStatus.settled.length})`}
        >
          <div className="pt-3">
            <SkeletonDataTable
              columns={columns}
              data={filteredByStatus.settled}
              searchPlaceholder={searchPlaceHolder}
              loading={loading}
            />
          </div>
        </Tab>
        <Tab
          eventKey="accounted"
          title={`Accounted (${filteredByStatus.accounted.length})`}
        >
          <div className="pt-3">
            <SkeletonDataTable
              columns={columns}
              data={filteredByStatus.accounted}
              searchPlaceholder={searchPlaceHolder}
              loading={loading}
            />
          </div>
        </Tab>
        <Tab
          eventKey="rejected"
          title={`Rejected (${filteredByStatus.rejected.length})`}
        >
          <div className="pt-3">
            <SkeletonDataTable
              columns={columns}
              data={filteredByStatus.rejected}
              searchPlaceholder={searchPlaceHolder}
              loading={loading}
            />
          </div>
        </Tab>
        <Tab
          eventKey="issued"
          title={`Issued (${filteredByStatus.issued.length})`}
        >
          <div className="pt-3">
            <SkeletonDataTable
              columns={columns}
              data={filteredByStatus.issued}
              searchPlaceholder={searchPlaceHolder}
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

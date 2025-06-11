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
  const eventKeys = {
    Other: [
      { key: 'open', value: 'Open'},
      { key: 'pending', value: 'Pending'},
      { key: 'rejected', value: 'Rejected'},
      { key: 'released', value: 'Released'},
      { key: 'issued', value: 'Issued'},
      { key: 'pendingVerification', value: 'Pending Verification'},
      { key: 'surrendered', value: 'Surrendered'},
      { key: 'surrenderRejected', value: 'Surrender Rejected'},
      { key: 'settled', value: 'Settled'},
    ],
    Salary: [
      { key: 'open', value: 'Open'},
      { key: 'pending', value: 'Pending'},
      { key: 'released', value: 'Released'},
    ],
  }
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
          const type = suggestImprestType(prop, value);
          if (type) {
            passedImprestType = type;
          }
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
    let rejected = advanceByStatus.get('Rejected') || [];
    let surrenderRejected = advanceByStatus.get('Surrender Rejected') || [];
    let issued = advanceByStatus.get('Issued') || [];
    let pendingVerification = advanceByStatus.get('Pending_x0020_Liquidation') || [];
    let surrendered = advanceByStatus.get('Surrendered') || [];

    if (isOtherAdvances) {
      const advancesByImprestStatus = Map.groupBy(data, ({ imprestStatus }) => imprestStatus);
      open = advancesByImprestStatus.get('Draft') || [];
      pending = advancesByImprestStatus.get('Pending') || [];
      settled = advancesByImprestStatus.get('Settled') || [];
      rejected = advancesByImprestStatus.get('Rejected') || [];
      surrenderRejected = advancesByImprestStatus.get('Surrender Rejected') || [];
      issued = advancesByImprestStatus.get('Issued') || [];
      pendingVerification = advancesByImprestStatus.get('Pending_x0020_Liquidation') || [];
      surrendered = advancesByImprestStatus.get('Surrendered') || [];
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
      released,
      issued,
      pendingVerification,
      surrenderRejected,
      surrendered,
      rejected,
      settled,
    };
  }, [data, isOtherAdvances]);

  useEffect(() => {
    const statuses = ['open', 'pending', 'released', 'issued', 'pendingVerification', 'surrenderRejected', 'surrendered', 'settled', 'rejected']
    const counts = {
      open: filteredByStatus.open.length,
      pending: filteredByStatus.pending.length,
      released: filteredByStatus.released.length,
      pendingVerification: filteredByStatus.pendingVerification.length,
      surrenderRejected: filteredByStatus.surrenderRejected.length,
      surrendered: filteredByStatus.surrendered.length,
      settled: filteredByStatus.settled.length,
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
      ["open", "pending", "released", "pendingVerification", "surrenderRejected", "surrendered", "partiallySettled", "Settled", "Accounted", "Rejected"].includes(initialTab)
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
        {
          eventKeys[advanceSet].map(item => {
            return <Tab eventKey={item.key} key={item.key} title={`${item.value} (${filteredByStatus[item.key].length})`}>
              <div className="pt-3">
                <SkeletonDataTable
                    columns={columns}
                    data={filteredByStatus[item.key]}
                    searchPlaceholder={searchPlaceHolder}
                    loading={loading}
                />
              </div>
            </Tab>
          })
        }
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

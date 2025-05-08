"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import AdvanceRequestAction from "../advances/AdvanceRequestAction";
import { Advance } from "@/app/types/advance";

interface Props {
  data: Advance[];
  loading: boolean;
  onCountsUpdate?: (counts: {
    open: number;
    pending: number;
    released: number;
    total: number;
  }) => void;
  initialTab?: string;
  refetch: (updatedStatus?: string) => void;
}

export default function ReusableSalaryAdvanceTabs({
  data,
  loading,
  onCountsUpdate,
  initialTab,
  refetch,
}: Props) {
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
  const [activeTab, setActiveTab] = useState("open");
  const didSetInitialTab = useRef(false);

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

  const filteredByStatus = useMemo(() => {
    const filterBy = (status: string) =>
      data.filter((item) => item.status === status);

    return {
      open: filterBy("Open"),
      pending: filterBy("Pending Approval"),
      released: filterBy("Released"),
    };
  }, [data]);

  useEffect(() => {
    if (onCountsUpdate) {
      onCountsUpdate({
        open: filteredByStatus.open.length,
        pending: filteredByStatus.pending.length,
        released: filteredByStatus.released.length,
        total:
          filteredByStatus.open.length +
          filteredByStatus.pending.length +
          filteredByStatus.released.length,
      });
    }
  }, [filteredByStatus, onCountsUpdate]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      Advance: "fa-solid fa-money-bill",
      Travel: "fa-solid fa-plane",
      Operational: "fa-solid fa-gear",
    };
    return icons[type] || "fa-solid fa-file-alt";
  };

  const columns = [
    {
      name: "Advance No",
      sortable: true,
      cell: (row: Advance) => (
        <span
          className="text-blue text-decoration-underline cursor-pointer"
          onClick={() => setSelectedAdvance(row)}
        >
          {row.no}
        </span>
      ),
    },
    {
      name: "Type",
      selector: (row: Advance) => row.advanceType,
      sortable: true,
      cell: (row: Advance) => (
        <div className="d-flex align-items-center gap-2">
          <div
            className="bg-primary-subtle rounded d-flex justify-content-center align-items-center"
            style={{ width: 32, height: 32 }}
          >
            <i className={`${getTypeIcon(row.advanceType)} text-primary`} />
          </div>
          <span>{row.advanceType}</span>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row: Advance) => row.status,
      sortable: true,
      cell: (row: Advance) => {
        const badgeMap = {
          Open: "badge bg-info-subtle text-info",
          Released: "badge bg-success-subtle text-success",
          "Pending Approval": "badge bg-warning-subtle text-warning",
        };
        const iconMap = {
          Open: "fas fa-folder-open me-1",
          Released: "fas fa-check-circle me-1",
          "Pending Approval": "fas fa-clock me-1",
        };
        return (
          <span className={badgeMap[row.status]}>
            <i className={iconMap[row.status]} /> {row.status}
          </span>
        );
      },
    },
    {
      name: "Amount",
      selector: (row: Advance) =>
        `${
          row.currencyCode || "KES"
        } ${row.applicationAmount.toLocaleString()}`,
      sortable: true,
    },
    {
      name: "Application Date",
      selector: (row: Advance) => formatDate(row.applicationDate),
      sortable: true,
    },
    {
      name: "Disbursement Date",
      selector: (row: Advance) => formatDate(row.preferredDisbursementDate),
      sortable: true,
    },
    {
      name: "Disbursed",
      selector: (row: Advance) => (row.disbursed ? "Yes" : "No"),
      sortable: true,
      cell: (row: Advance) => (
        <span
          className={`badge ${
            row.disbursed
              ? "bg-success-subtle text-success"
              : "bg-secondary-subtle text-muted"
          }`}
        >
          {row.disbursed ? "Yes" : "No"}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row: Advance) => (
        <div className="d-flex gap-2">
          {row.status === "Open" && (
            <button
              className="text-primary border-0 bg-transparent"
              onClick={() => setSelectedAdvance(row)}
              title="Edit"
            >
              <i className="las la-pen fs-18" />
            </button>
          )}
          <button
            className="text-success border-0 bg-transparent"
            onClick={() => setSelectedAdvance(row)}
            title="View"
          >
            <i className="las la-eye fs-18" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

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
          setSelectedAdvance(null);
          refetch(updatedStatus);
        }}
        onCloseView={() => setSelectedAdvance(null)}
      />
    </div>
  );
}

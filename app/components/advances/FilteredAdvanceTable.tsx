"use client";

import { useEffect, useState, useCallback } from "react";
import AdvanceRequestAction from "./AdvanceRequestAction";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { Advance } from "@/app/types/advance";

interface AdvanceDataTableProps {
  employee?: {
    number: string;
    nationalId: string;
    mobilePhone: string;
  };
}

export default function AdvanceDataTable({ employee }: AdvanceDataTableProps) {
  const [data, setData] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [search, setSearch] = useState("");
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  const employeeNo = employee?.number;

  const fetchAdvances = useCallback(async () => {
    if (!employeeNo) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/bc/advances/salary/requests?employeeNo=${employeeNo}`
      );
      const json = await res.json();
      setData(json["data"]["value"] || []);
    } catch (err) {
      console.error("❌ Failed to fetch advances:", err);
    } finally {
      setLoading(false);
      setForceRefresh(false);
    }
  }, [employeeNo, forceRefresh]);

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]);

  const filteredData = data.filter((item) => {
    const searchValue = search.toLowerCase();
    return (
      item.advanceType.toLowerCase().includes(searchValue) ||
      item.employeeName.toLowerCase().includes(searchValue)
    );
  });

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
      cell: (row: Advance) => (
        <span style={{ fontSize: "0.775rem" }}>
          {row.currencyCode || "KES"} {row.applicationAmount.toLocaleString()}
        </span>
      ),
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
    <SkeletonDataTable
      title="Advance Requests"
      columns={columns}
      data={loading ? [] : filteredData}
      actions={
        <AdvanceRequestAction
          advance={selectedAdvance}
          refetch={() => setForceRefresh(true)}
          onCloseView={() => setSelectedAdvance(null)}
          employee={employee}
        />
      }
      searchPlaceholder="Search by type or name..."
      loading={loading}
    />
  );
}

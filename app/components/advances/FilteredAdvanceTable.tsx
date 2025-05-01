"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import AdvanceTableFilter from "./AdvanceTableFilter";
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);
  const employeeNo = employee?.number;

  const fetchAdvances = useCallback(async () => {
    if (!employeeNo) return;

    if (!forceRefresh) {
      console.log(`🔁 Fetching advances for ${employeeNo} (no local cache)`);
    }

    setLoading(true);
    const start = performance.now();

    try {
      const res = await fetch(
        `/api/bc/advances/salary/requests?employeeNo=${employeeNo}`
      );
      const json = await res.json();
      const advanceData: Advance[] = json["data"]["value"];

      setData(advanceData);
    } catch (err) {
      console.error("❌ Failed to fetch advances:", err);
    } finally {
      const end = performance.now();
      console.log(`⏳ Fetched advances in ${(end - start).toFixed(2)} ms`);
      setLoading(false);
      setForceRefresh(false);
    }
  }, [employeeNo, forceRefresh]);

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus = status === "All" || item.status === status;
      const matchesType = type === "All" || item.advanceType === type;
      const matchesSearch =
        item.advanceType.toLowerCase().includes(search.toLowerCase()) ||
        item.employeeName.toLowerCase().includes(search.toLowerCase());
      const itemDate = new Date(item.applicationDate);
      const matchesStart = startDate ? itemDate >= new Date(startDate) : true;
      const matchesEnd = endDate ? itemDate <= new Date(endDate) : true;
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [search, status, type, startDate, endDate, data]);

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
      style: { minWidth: "140px" },
      cell: (row: Advance) => (
        <span
          className="text-blue text-decoration-underline cursor-pointer"
          style={{ cursor: "pointer" }}
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
      grow: 2,
      cell: (row: Advance) => (
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-inline-flex justify-content-center align-items-center bg-primary-subtle rounded"
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
      grow: 1,
      style: { minWidth: "160px" },
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
      grow: 1.2,
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
      style: { minWidth: "120px" },
    },
    {
      name: "Disbursement Date",
      selector: (row: Advance) => formatDate(row.preferredDisbursementDate),
      sortable: true,
      style: { minWidth: "140px" },
    },
    {
      name: "Actions",
      cell: (row: Advance) => (
        <div className="d-flex gap-2">
          {row.status === "Open" && (
            <button
              className="text-primary border-0 bg-transparent"
              title="Edit"
              onClick={() => setSelectedAdvance(row)}
            >
              <i className="las la-pen fs-18" />
            </button>
          )}
          <button
            className="text-success border-0 bg-transparent"
            title="View"
            onClick={() => setSelectedAdvance(row)}
          >
            <i className="las la-eye fs-18" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      style: { minWidth: "100px" },
    },
  ];

  return (
    <SkeletonDataTable
      title="Advance Requests"
      columns={columns}
      data={loading ? [] : filteredData}
      filters={
        <AdvanceTableFilter
          status={status}
          setStatus={setStatus}
          type={type}
          setType={setType}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          setSearch={setSearch}
          search={search}
        />
      }
      actions={
        <AdvanceRequestAction
          advance={selectedAdvance}
          refetch={() => setForceRefresh(true)}
          onCloseView={() => setSelectedAdvance(null)}
          employee={employee}
        />
      }
      searchPlaceholder="Search..."
      loading={loading}
    />
  );
}

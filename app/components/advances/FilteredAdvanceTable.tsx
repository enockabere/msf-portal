"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import AdvanceTableFilter from "./AdvanceTableFilter";
import AdvanceRequestAction from "./AdvanceRequestAction";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { Advance } from "@/app/types/advance";

interface AdvanceDataTableProps {
  employeeNo?: string;
}

export default function AdvanceDataTable({
  employeeNo,
}: AdvanceDataTableProps) {
  const [data, setData] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);

  const fetchAdvances = useCallback(async () => {
    if (!employeeNo) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/selfservice/api/bc/advances/salary/requests?employeeNo=${employeeNo}`
      );
      const json = await res.json();
      const advanceData: Advance[] = json["data"]["value"];
      const sorted = [...advanceData].sort(
        (a, b) =>
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
      );
      setData(sorted);
    } catch (err) {
      console.error("❌ Failed to fetch advances:", err);
    } finally {
      setLoading(false);
    }
  }, [employeeNo]);

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
        <button
          className="btn btn-link text-dark"
          onClick={() => setSelectedAdvance(row)}
        >
          {row.no}
        </button>
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
        `${row.currencyCode ?? ""} ${row.applicationAmount.toLocaleString()}`,
      sortable: true,
      grow: 1.2,
      cell: (row: Advance) => (
        <span style={{ fontSize: "0.775rem" }}>
          {row.currencyCode ?? ""} {row.applicationAmount.toLocaleString()}
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
              onClick={() => setSelectedAdvance(row)} // ✅ Show modal for edit
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
          refetch={fetchAdvances}
          onCloseView={() => setSelectedAdvance(null)}
          employeeNo={employeeNo}
        />
      }
      searchPlaceholder="Search by Type or Employee Name"
      loading={loading}
    />
  );
}

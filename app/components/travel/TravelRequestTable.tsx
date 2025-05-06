"use client";

import { useState, useMemo } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { Advance } from "@/app/types/advance";

interface TravelRequestTableProps {
  data: Advance[];
  loading: boolean;
}

export default function TravelRequestTable({
  data,
  loading,
}: TravelRequestTableProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return (
        item.advanceType?.toLowerCase().includes(search.toLowerCase()) ||
        item.employeeName?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, data]);

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
          onClick={() => console.log("View", row)}
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
    },
    {
      name: "Application Date",
      selector: (row: Advance) => formatDate(row.applicationDate),
    },
    {
      name: "Disbursement Date",
      selector: (row: Advance) => formatDate(row.preferredDisbursementDate),
    },
    {
      name: "Actions",
      cell: (row: Advance) => (
        <div className="d-flex gap-2">
          {row.status === "Open" && (
            <button
              className="text-primary border-0 bg-transparent"
              title="Edit"
            >
              <i className="las la-pen fs-18" />
            </button>
          )}
          {row.status === "Pending Approval" && (
            <button
              className="text-success border-0 bg-transparent"
              title="View"
            >
              <i className="las la-eye fs-18" />
            </button>
          )}
          {row.status === "Released" && (
            <>
              <button
                className="text-success border-0 bg-transparent"
                title="View"
              >
                <i className="las la-eye fs-18" />
              </button>
              <button
                className="text-warning border-0 bg-transparent"
                title="Settle"
              >
                <i className="las la-coins fs-18" />
              </button>
            </>
          )}
        </div>
      ),
      ignoreRowClick: true,
      style: { minWidth: "120px" },
    },
  ];

  return (
    <SkeletonDataTable
      title=""
      columns={columns}
      data={loading ? [] : filteredData}
      searchPlaceholder="Search travel requests..."
      loading={loading}
    />
  );
}

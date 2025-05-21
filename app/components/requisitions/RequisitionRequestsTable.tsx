"use client";

import { useState, useMemo } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { formatDate } from "@/app/utils/dateFormats";

interface RequisitionRequestsTableProps {
    data: Array<Record<string, any>>;
    loading: boolean;
}

export default function RequisitionRequestsTable({data, loading}: RequisitionRequestsTableProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [search, setSearch] = useState("");

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            return (
                item.no.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, data]);

    const columns = [
        {
            name: "Reference",
            sortable: true,
            cell: (row: Record<string, any>) => (
                <span
                    className="text-blue text-decoration-underline cursor-pointer"
                    onClick={() => console.log("View", row)}
                >
          {row.no}
        </span>
            ),
        },
        {
            name: "Title",
            selector: (row: Record<string, any>) => row.description,
        },
        {
            name: "Amount",
            selector: (row: Record<string, any>) =>
                `${
                    row.currencyCode || "KES"
                } ${row.amount.toLocaleString()}`,
        },
        {
            name: "Order Date",
            selector: (row: Record<string, any>) => formatDate(row.orderDate),
        },
        {
            name: "Due Date",
            selector: (row: Record<string, any>) => formatDate(row.dueDate),
        },
        {
            name: "Requested For",
            selector: (row: Record<string, any>) => row.RequestedForName,
        },
        {
            name: "Status",
            cell: (row: Record<string, any>) => {
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
            <i className={iconMap[row.status]}/> {row.status}
          </span>
                );
            },
        },
        {
            name: "Actions",
            cell: (row: Record<string, any>) => (
                <div className="d-flex gap-2">
                    <button
                        className="text-primary border-0 bg-transparent"
                        title="View"
                        onClick={() => console.log("open", row)}
                    >
                        <i className="las la-eye fs-18"/>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            style: {minWidth: "120px"},
        },
    ];

    return (
        <>
            <SkeletonDataTable
                title=""
                columns={columns}
                data={loading ? [] : filteredData}
                searchPlaceholder="Search travel requests..."
                loading={loading}
            />
        </>
    );
}

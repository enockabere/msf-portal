"use client";

import { useState, useMemo } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { formatDate } from "@/app/utils/dateFormats";
import { decodeValue, formatNumber } from "@/app/utils/helpers";
import { EyeIcon } from "lucide-react";
import RequisitionForm from "@/app/components/requisitions/forms/RequisitionForm";
import CustomModal from "@/app/components/modals/CustomModal";

interface RequisitionRequestsTableProps {
    data: Array<Record<string, any>>;
    loading: boolean;
    onRefresh?: () => void;
}

export default function RequisitionRequestsTable({data, loading, onRefresh}: RequisitionRequestsTableProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [search, setSearch] = useState("");
    const [requisitionId, setRequisitionId] = useState(null);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            return (
                item.no.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, data]);

    const handleCloseModal = () => setRequisitionId(null)
    const handleOpenModal = (id: string) => {
        setRequisitionId(id);
    }

    const columns = [
        {
            name: "Reference",
            sortable: true,
            cell: (row: Record<string, any>) => (
                <span
                    className="text-blue text-decoration-underline cursor-pointer"
                    onClick={() => handleOpenModal(row.id)}
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
                } ${formatNumber(row.amount)}`,
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

                const status = decodeValue(row.status);
                return (
                    <span className={badgeMap[status]}>
            <i className={iconMap[status]}/> {status}
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
                        onClick={() => handleOpenModal(row.id)}
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
                searchPlaceholder="Search requisition requests..."
                loading={loading}
                includeStatusFilter={true}
                includeDateFilter={true}
            />

            <CustomModal
              show={!!requisitionId}
              onClose={handleCloseModal}
              title="View Requisition"
              size="xl"
              titleIcon={<EyeIcon size={18} className="text-white" />}
            >
                <div className="row">
                    <div className="col-md-12">
                        <RequisitionForm requisitionId={requisitionId} onClose={handleCloseModal} onSuccess={onRefresh} />
                    </div>
                </div>
            </CustomModal>
        </>
    );
}

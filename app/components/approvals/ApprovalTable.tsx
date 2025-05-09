"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { Approval } from "@/app/types/approval";
import {getResource} from "@/app/lib/api/http";
import ApprovalDetailsModal from "@/app/components/approvals/ApprovalDetailsModal";
import ApprovalStatsCard from "@/app/components/approvals/StatsCard";
import Swal from "sweetalert2";

interface ApprovalDataTableProps {
    employeeNo?: string;
}

export default function ApprovalDataTable({
                                             employeeNo,
                                         }: ApprovalDataTableProps) {
    const [data, setData] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedApprovalDocument, setSelectedApprovalDocument] = useState(null);
    const [selectedApprovalAttachments, setSelectedApprovalAttachments] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const fetchApprovals = useCallback(async () => {
        if (!employeeNo) return;
        setLoading(true);
        try {
           const res = await getResource('approvalEntries', {
                    params: {
                        filters: {
                            status: "Open",
                            approverID: "KINETIC"
                        }
                    }
            })

            const advanceData =  res.value;
            console.log('approval entries', advanceData)
            const sorted = [...advanceData].sort(
                (a, b) =>
                    new Date(b.dateTimeSentForApproval).getTime() -
                    new Date(a.dateTimeSentForApproval).getTime()
            );
            setData(sorted);
        } catch (err) {
            console.error("❌ Failed to fetch advances:", err);
        } finally {
            setLoading(false);
        }
    }, [employeeNo]);


    async function fetchApprovalAttactments(approval: Approval) {
        const approvalAttachment = await getResource('approvalAttachments', {
            params: {
                filters: {
                    no: approval.documentNo,
                }
            }
        })

        setSelectedApprovalAttachments(approvalAttachment)
    }

    const fetchApprovalDetails = async (approval: Approval) => {
       setShowModal(true)
       setLoading(true);
       const approvalDocument = await getResource('approvalEntry', {
           params: {
               filters: {
                   entryNo: approval.entryNo
               }
           }
        })

        setLoading(false);
        if(approvalDocument.error) {
            Swal.fire("Error", "Error fetching approval document", "error");
            return;
        }

        setSelectedApprovalDocument(approvalDocument)
        await fetchApprovalAttactments(approval);
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const groupAndCountBy = (array, key) => {
        return array.reduce((acc, item) => {
            const groupKey = item[key];
            if (!acc[groupKey]) {
                acc[groupKey] = { count: 0, items: [] };
            }
            acc[groupKey].count += 1;
            acc[groupKey].items.push(item);
            return acc;
        }, {});
    };

    const grouped = groupAndCountBy(data, 'approveForType');

    const columns = [
        {
            name: "Document No",
            sortable: true,
            style: { minWidth: "140px" },
            cell: (row: Approval) => (
                <span className="text-dark"
                >
                    {row.documentNo}
                </span>
            ),
        },
        {
            name: "Submitted By",
            selector: (row: Approval) => row.sendByName,
            sortable: true,
            grow: 2,
            cell: (row: Approval) => (
                <span>{row.sendByName}</span>
            ),
        },
        {
            name: "Status",
            selector: (row: Approval) => row.status,
            sortable: true,
            grow: 1,
            style: { minWidth: "160px" },
            cell: (row: Approval) => {
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
            name: "dueDate",
            selector: (row: Approval) => row.dueDate,
            sortable: true,
            grow: 1.2,
            cell: (row: Approval) => (
                <span>
                  {row.dueDate ?? ""}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row: Approval) => (
                <div className="d-flex gap-2">
                    <button
                        className="text-success border-0 bg-transparent"
                        title="View"
                        onClick={() => fetchApprovalDetails(row)}
                    >
                        <i className="las la-eye fs-18" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            style: { minWidth: "100px" },
        },
    ];


    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch =
                item.sendByName.toLowerCase().includes(search.toLowerCase());
            const itemDate = new Date(item.dueDate);
            return (
                matchesSearch
            );
        });
    }, [search, status, data]);

    useEffect(() => {

    }, [selectedApprovalDocument]);

    return (
        <>
            <div className="card quick-actions-card w-100">
                <div className="card-body">
                    {/* Header */}
                    <div className="row align-items-center mb-3">
                        <div className="col">
                            <h5 className="card-title mb-0 d-flex align-items-center">
                                <i className="iconoir-coins text-primary me-2"></i>
                                Approvals Summary
                            </h5>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="row gx-1">
                        <div className="col-lg-12">
                            <div className="row g-1">
                                {Object.entries(grouped).map(([groupKey, groupData]) => (
                                    <ApprovalStatsCard key={groupKey} header={groupKey} headerCount={groupData?.count}/>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>


            <div className="card h-100 p-2">
            <ApprovalDetailsModal showModal={ showModal }
                                  setShowModal={ setShowModal }
                                  loading={loading}
                                  selectedApprovalDocument={selectedApprovalDocument} selectedApprovalAttachments={selectedApprovalAttachments}>
                <div></div>
            </ApprovalDetailsModal>
            <SkeletonDataTable
                title="Approval Requests"
                columns={columns}
                data={loading ? [] : filteredData}
                searchPlaceholder="Search by Document Number"
                loading={loading}
            />


            </div>
        </>
    );
}

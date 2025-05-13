"use client";

import { useEffect, useState, useMemo, useCallback, useReducer } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { getResource } from "@/app/lib/api/http";
import ApprovalDetailsModal from "@/app/components/approvals/ApprovalDetailsModal";
import ApprovalStatsCard from "@/app/components/approvals/StatsCard";
import Swal from "sweetalert2";
import { Approval, ApprovalDocs } from "@/app/types/approval";

interface ApprovalDataTableProps {
    employeeNo?: string;
}

interface ApprovalReducerAction {
    type: string
    payload: Array<Record<string, any>>
}

export const approvalDocumentsReducer = (state: ApprovalDocs[], action: ApprovalReducerAction) => {
    if (!action.payload && action.type !== 'CLEAR_DOCS') return;
    switch (action.type) {
        case 'MERGE_DOCS': {
            return [
                ...state,
                ...action.payload,
            ];
        }
        case 'CLEAR_DOCS':
            return [];
        default:
            return state;
    }
}

const initialState: ApprovalDocs[] = [];

export default function ApprovalDataTable({
    employeeNo,
}: ApprovalDataTableProps) {
    const [data, setData] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(false);
    const [search] = useState("");
    const [allApprovalDocuments, dispatch] = useReducer(approvalDocumentsReducer, initialState);
    const [currentDocument, setCurrentDocument] = useState(0)

    const [showModal, setShowModal] = useState(false);

    const fetchApprovals = useCallback(async () => {
        if (!employeeNo) return;
        setLoading(true);
        try {
            const res = await getResource('approvalEntries', {
                params: {
                    filters: {
                        status: "Open",
                        approverID: employeeNo
                    }
                }
            })

            const advanceData = res.value;
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

    const documentNavigationHandler = (index: number) => {
        setCurrentDocument((prev) => prev + index)
    }


    async function fetchApprovalAttactments(approval: Approval) {
        const approvalAttachment = await getResource('approvalAttachments', {
            params: {
                filters: {
                    no: approval.documentNo,
                }
            }
        })

        return approvalAttachment.value;
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
        if (approvalDocument.error) {
            setShowModal(false);
            Swal.fire("Error", "Error fetching approval document", "error");
            return
        }

        dispatch({ type: 'MERGE_DOCS', payload: approvalDocument?.value });
        let res = await fetchApprovalAttactments(approval);

        if (!Array.isArray(res)) res = [res];
        res = res.map(function (item: Record<string, any>) {
            item.pdfAttachment = item.base64Attachment;
            return item;
        })
        dispatch({ type: "MERGE_DOCS", payload: res })
    }

    const groupAndCountBy = <T extends Record<string, any>>(
        array: T[],
        key: keyof T
    ): Record<string, { count: number; items: T[] }> => {
        return array.reduce((acc, item) => {
            const groupKey = item[key] as string;
            if (!acc[groupKey]) {
                acc[groupKey] = { count: 0, items: [] };
            }
            acc[groupKey].count += 1;
            acc[groupKey].items.push(item);
            return acc;
        }, {} as Record<string, { count: number; items: T[] }>);
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
            // const itemDate = new Date(item.dueDate);
            return (
                matchesSearch
            );
        });
    }, [search, data]);

    const handleModalToggle = (value: boolean) => {
        if (!value) {
            dispatch({ type: 'CLEAR_DOCS', payload: [] }); // Clear docs on modal close
            setCurrentDocument(0); // Reset navigation index
        }
        setShowModal(value);
    };

    useEffect(() => {

    }, [currentDocument]);

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
                                    <ApprovalStatsCard key={groupKey} header={groupKey} headerCount={groupData?.count} />
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>


            <div className="card h-100 p-2">
                <ApprovalDetailsModal showModal={showModal}
                    setShowModal={handleModalToggle}
                    loading={loading}
                    currentDocument={currentDocument}
                    documentNavigationHandler={documentNavigationHandler}
                    onActionCompleted={fetchApprovals}
                    allApprovalDocuments={allApprovalDocuments}>
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
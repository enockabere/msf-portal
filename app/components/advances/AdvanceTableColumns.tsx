import { Advance, AdvanceTypeKey } from "@/app/types/advance";
import { formatDateToLcateDateString } from "@/app/utils/dateFormats";
import { findObjectFromArray } from "@/app/utils/helpers";

export const GetColumnByType = (
    type: string,
    cb: (data: Advance | null, ...args: any) => void,
    options?: {
        currentTab?: string;
        currencies?: Record<string, any>[];
        imprestTypes?: Record<string, any>[];
        getTypeIcon?: (type: string, ...args: any) => ''
    }
) => {
    const isReleasedTab = options?.currentTab === "released";
    const { currencies, imprestTypes } = options;

    const issuedStatus = [
        'Issued',
        'Accounted',
        'Settled',
        'Posted',
        'Pending Liquidation',
        'Rejected',
        'Liquidation Rejected',
        'Reversed'
    ];
    const columns: Record<AdvanceTypeKey, any> = {
        Salary: [
            {
                name: "Advance No",
                sortable: true,
                cell: (row: Advance) => (
                    <span
                        className="text-blue text-decoration-underline cursor-pointer"
                        onClick={() => cb(row)}
                    >
                        {row.no}
                    </span>
                ),
            },
            {
                name: "Type",
                selector: (row: Advance) => row.advanceType || row.imprestType || "Unknown",
                sortable: true,
                cell: () => (
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="bg-primary-subtle rounded d-flex justify-content-center align-items-center"
                            style={{ width: 32, height: 32 }}
                        >
                            <i className={`${options.getTypeIcon(type)} text-primary`} />
                        </div>

                        <span>{type}</span>
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
                    `${row.currencyCode || "KES"
                    } ${row.applicationAmount.toLocaleString()}`,
                sortable: true,
            },
            {
                name: "Application Date",
                selector: (row: Advance) => formatDateToLcateDateString(row.applicationDate),
                sortable: true,
            },
            {
                name: "Disbursement Date",
                selector: (row: Advance) => formatDateToLcateDateString(row.preferredDisbursementDate),
                sortable: true,
            },
            {
                name: "Disbursed",
                selector: (row: Advance) => (row.disbursed ? "Yes" : "No"),
                sortable: true,
                cell: (row: Advance) => (
                    <span
                        className={`badge ${row.disbursed
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
                                onClick={() => cb(row)}
                                title="Edit"
                            >
                                <i className="las la-pen fs-18" />
                            </button>
                        )}
                        <button
                            className="text-success border-0 bg-transparent"
                            onClick={() => cb(row)}
                            title="View"
                        >
                            <i className="las la-eye fs-18" />
                        </button>
                    </div>
                ),
                ignoreRowClick: true,
            },
        ],
        Other: [
            {
                name: "Advance No",
                sortable: true,
                cell: (row: Advance) => (
                    <span
                        className="text-blue text-decoration-underline cursor-pointer"
                        onClick={() => cb(row)}
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
                            <i className={`${options.getTypeIcon(type, row.imprestType)} text-primary`} />
                        </div>
                        <span>{findObjectFromArray(imprestTypes, 'code', row.imprestType)?.description as string}</span>
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
                    `${findObjectFromArray(currencies, 'code', row.currencyCode)?.description || "KES"
                    } ${row.amountToPayHeader.toLocaleString()}`,
                sortable: true,
            },
            {
                name: "Application Date",
                selector: (row: Advance) => formatDateToLcateDateString(row.postingDate),
                sortable: true,
            },
            {
                name: "Issued",
                selector: (row: Advance) => (issuedStatus.includes(row.imprestStatus) ? "Yes" : "No"),
                sortable: true,
                cell: (row: Advance) => (
                    <span
                        className={`badge ${issuedStatus.includes(row.imprestStatus)
                            ? "bg-success-subtle text-success"
                            : "bg-secondary-subtle text-muted"
                            }`}
                    >
                        {issuedStatus.includes(row.imprestStatus) ? "Yes" : "No"}
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
                                onClick={() => cb(row)}
                                title="Edit"
                            >
                                <i className="las la-pen fs-18" />
                            </button>
                        )}

                        {(row.imprestStatus === "Issued" || row.imprestStatus === "Accounted") && isReleasedTab && (
                            <button
                                key="settle"
                                className="text-danger border-0 bg-transparent"
                                onClick={() => cb(row, 'isSettlement')}
                                title="Settle"
                            >
                                <i className="las la-wallet fs-18" /> Settle
                            </button>
                        )}

                        <button
                            className="text-success border-0 bg-transparent"
                            onClick={() => cb(row)}
                            title="View"
                        >
                            <i className="las la-eye fs-18" />
                        </button>
                    </div>
                ),
                ignoreRowClick: true,
            },
        ]
    }
    return columns[type]
}
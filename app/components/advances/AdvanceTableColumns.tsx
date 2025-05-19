import { Advance } from "@/app/types/advance";
import { formatDateToLcateDateString } from "@/app/utils/dateFormats";
import { findObjectFromArray } from "@/app/utils/helpers";

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    Advance: "fa-solid fa-money-bill",
    Travel: "fa-solid fa-plane",
    Operational: "fa-solid fa-gear",
  };
  return icons[type as keyof typeof icons] || "fa-solid fa-file-alt";
};

export const getColumnByType = (
  type: string,
  cb: (data: Advance | null) => void,
  options?: {
    currentTab?: string;
    currencies?: any[];
    onSettleClick?: (advanceNo: string) => void;
  }
) => {
  const isReleasedTab = options?.currentTab === "released";
  const currencies = options?.currencies || [];

  const columns = {
    salaryAdvance: [
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
        selector: (row: Advance) =>
          row.advanceType || row.imprestType || "Unknown",
        sortable: true,
        cell: (row: Advance) => {
          const rawType = row.advanceType || row.imprestType || "Unknown";
          const normalizedType = String(rawType)
            .toLowerCase()
            .includes("travel")
            ? "Travel"
            : String(rawType).toLowerCase().includes("operational")
            ? "Operational"
            : String(rawType).toLowerCase().includes("salary")
            ? "Advance"
            : "Advance";

          return (
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-primary-subtle rounded d-flex justify-content-center align-items-center"
                style={{ width: 32, height: 32 }}
              >
                <i className={`${getTypeIcon(normalizedType)} text-primary`} />
              </div>
              <span>{rawType}</span>
            </div>
          );
        },
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
        selector: (row: Advance) =>
          formatDateToLcateDateString(row.applicationDate),
        sortable: true,
      },
      {
        name: "Disbursement Date",
        selector: (row: Advance) =>
          formatDateToLcateDateString(row.preferredDisbursementDate),
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

    otherAdvances: [
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
        selector: (row: Advance) =>
          row.advanceType || row.imprestType || "Unknown",
        sortable: true,
        cell: (row: Advance) => {
          const rawType = row.advanceType || row.imprestType || "Unknown";
          const normalizedType = rawType.toLowerCase().includes("travel")
            ? "Travel"
            : rawType.toLowerCase().includes("operational")
            ? "Operational"
            : rawType.toLowerCase().includes("salary")
            ? "Advance"
            : "Advance";

          const toTitleCase = (text: string): string =>
            text
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

          return (
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-primary-subtle rounded d-flex justify-content-center align-items-center"
                style={{ width: 32, height: 32 }}
              >
                <i className={`${getTypeIcon(normalizedType)} text-primary`} />
              </div>
              <span>{toTitleCase(rawType)}</span>
            </div>
          );
        },
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
            findObjectFromArray(currencies, "code", row.currencyCode)
              ?.description || "KES"
          } ${row.amountToPayHeader.toLocaleString()}`,
        sortable: true,
      },
      {
        name: "Application Date",
        selector: (row: Advance) =>
          formatDateToLcateDateString(row.postingDate),
        sortable: true,
      },
      {
        name: "Released",
        selector: (row: Advance) =>
          row.imprestStatus === "Issued" ? "Yes" : "No",
        sortable: true,
        cell: (row: Advance) => (
          <span
            className={`badge ${
              row.imprestStatus === "Issued"
                ? "bg-success-subtle text-success"
                : "bg-secondary-subtle text-muted"
            }`}
          >
            {row.imprestStatus === "Issued" ? "Yes" : "No"}
          </span>
        ),
      },
      {
        name: "Actions",
        cell: (row: Advance) => {
          const actions = [];

          if (row.status === "Open") {
            actions.push(
              <button
                key="edit"
                className="text-primary border-0 bg-transparent"
                onClick={() => cb(row)}
                title="Edit"
              >
                <i className="las la-pen fs-18" />
              </button>
            );
          }

          actions.push(
            <button
              key="view"
              className="text-success border-0 bg-transparent"
              onClick={() => cb(row)}
              title="View"
            >
              <i className="las la-eye fs-18" />
            </button>
          );

          if (isReleasedTab && row.status === "Released") {
            actions.push(
              <button
                key="settle"
                className="text-danger border-0 bg-transparent"
                onClick={() => options?.onSettleClick?.(row.no)}
                title="Settle"
              >
                <i className="las la-wallet fs-18" /> Settle
              </button>
            );
          }

          return <div className="d-flex gap-2">{actions}</div>;
        },
        ignoreRowClick: true,
      },
    ],
  };

  return columns[type];
};

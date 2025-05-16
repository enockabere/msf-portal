"use client";

import { useState, useMemo } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { Wallet } from "lucide-react";
import TravelRequestWizard from "@/app/components/travel/TravelRequestWizard";
import CustomModal from "@/app/components/modals/CustomModal";

interface TravelRequestTableProps {
  data: Array<Record<string, any>>;
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
        item.no.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, data]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const [selectedRequestNo, setSelectedRequestNo] = useState(null)

  const handleCloseModal = () => setSelectedRequestNo(null)

  // const getTypeIcon = (type: string) => {
  //   const icons: Record<string, string> = {
  //     Advance: "fa-solid fa-money-bill",
  //     Travel: "fa-solid fa-plane",
  //     Operational: "fa-solid fa-gear",
  //   };
  //   return icons[type] || "fa-solid fa-file-alt";
  // };

  const columns = [
    {
      name: "Request No",
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
    // {
    //   name: "Type",
    //   selector: (row: Record<string, any>) => row.advanceType,
    //   sortable: true,
    //   cell: (row: Advance) => (
    //     <div className="d-flex align-items-center gap-2">
    //       <div
    //         className="d-inline-flex justify-content-center align-items-center bg-primary-subtle rounded"
    //         style={{ width: 32, height: 32 }}
    //       >
    //         <i className={`${getTypeIcon(row.advanceType)} text-primary`} />
    //       </div>
    //       <span>{row.advanceType}</span>
    //     </div>
    //   ),
    // },
    {
      name: "Status",
      selector: (row: Record<string, any>) => row.approvalStatus,
      sortable: true,
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
          <span className={badgeMap[row.approvalStatus]}>
            <i className={iconMap[row.approvalStatus]} /> {row.approvalStatus}
          </span>
        );
      },
    },
    {
      name: "Amount",
      selector: (row: Record<string, any>) =>
        `${
          row.currencyCode || "KES"
        } ${row.totalAmount.toLocaleString()}`,
    },
    {
      name: "Application Date",
      selector: (row: Record<string, any>) => formatDate(row.documentDate),
    },
    {
      name: "Actions",
      cell: (row: Record<string, any>) => (
        <div className="d-flex gap-2">
          {row.approvalStatus === "Open" && (
            <button
              className="text-primary border-0 bg-transparent"
              title="Edit"
              onClick={() => setSelectedRequestNo(row.no)}
            >
              <i className="las la-pen fs-18" />
            </button>
          )}
          {row.approvalStatus === "Pending Approval" && (
            <button
              className="text-success border-0 bg-transparent"
              title="View"
            >
              <i className="las la-eye fs-18" />
            </button>
          )}
          {row.approvalStatus === "Released" && (
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
    <>
      <SkeletonDataTable
        title=""
        columns={columns}
        data={loading ? [] : filteredData}
        searchPlaceholder="Search travel requests..."
        loading={loading}
      />

      <CustomModal
        show={!!selectedRequestNo}
        onClose={handleCloseModal}
        title="Update Travel Request"
        size="xl"
        titleIcon={<Wallet size={18} className="text-white" />}
      >
        <div className="row">
          <div className="col-md-12">
            <TravelRequestWizard requestNo={selectedRequestNo} />
          </div>
        </div>
      </CustomModal>
    </>
  );
}

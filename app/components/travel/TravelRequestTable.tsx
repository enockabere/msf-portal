"use client";

import { useState, useMemo } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { Wallet } from "lucide-react";
import TravelRequestWizard from "@/app/components/travel/TravelRequestWizard";
import CustomModal from "@/app/components/modals/CustomModal";
import { formatDate } from "@/app/utils/dateFormats";

interface TravelRequestTableProps {
  data: Array<Record<string, any>>;
  loading: boolean;
  profile: Record<string, any>;
}

export default function TravelRequestTable({
                                             data,
                                             loading,
                                             profile,
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

  const [selectedRequestNo, setSelectedRequestNo] = useState(null)
  const [action, setAction] = useState('Update')

  const handleCloseModal = () => setSelectedRequestNo(null)
  const handleOpenModal = (requestNo: string, action: string) => {
    setAction(action)
    setSelectedRequestNo(requestNo)
  }

  const columns = [
    {
      name: "Request No",
      sortable: true,
      cell: (row: Record<string, any>) => (
        <span
          className="text-blue text-decoration-underline cursor-pointer"
          onClick={() => handleOpenModal(row.no, 'View')}
        >
          {row.no}
        </span>
      ),
    },
    {
      name: "Application Date",
      selector: (row: Record<string, any>) => formatDate(row.documentDate),
    },
    {
      name: "Departure Date",
      selector: (row: Record<string, any>) => formatDate(row.departureDate),
    },
    {
      name: "Return Date",
      selector: (row: Record<string, any>) => formatDate(row.returnDate),
    },
    {
      name: "Amount",
      selector: (row: Record<string, any>) =>
        `${
          row.currencyCode || "KES"
        } ${row.totalAmount.toLocaleString()}`,
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
          <span className={badgeMap[row.approvalStatus]}>
            <i className={iconMap[row.approvalStatus]}/> {row.approvalStatus}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row: Record<string, any>) => (
        <div className="d-flex gap-2">
          {row.approvalStatus === "Open"
            ? (
              <button
                className="text-primary border-0 bg-transparent"
                title="Edit"
                onClick={() => handleOpenModal(row.no, 'Update')}
              >
                <i className="las la-pen fs-18"/>
              </button>
            )
            : <button
              className="text-primary border-0 bg-transparent"
              title="Edit"
              onClick={() => handleOpenModal(row.no, 'View')}
            >
              <i className="las la-eye fs-18"/>
            </button>
          }
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

      <CustomModal
        show={!!selectedRequestNo}
        onClose={handleCloseModal}
        title={`${action} Travel Request (${selectedRequestNo})`}
        size="xl"
        titleIcon={<Wallet size={18} className="text-white"/>}
      >
        <div className="row">
          <div className="col-md-12">
            <TravelRequestWizard requestNo={selectedRequestNo} profile={profile}/>
          </div>
        </div>
      </CustomModal>
    </>
  );
}

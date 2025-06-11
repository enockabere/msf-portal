"use client";

import { useState, useMemo } from "react";
import { EyeIcon, Pencil } from "lucide-react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import { formatDate } from "@/app/utils/dateFormats";
import { decodeValue, formatNumber } from "@/app/utils/helpers";
import RequisitionForm from "@/app/components/requisitions/forms/RequisitionForm";
import CustomModal from "@/app/components/modals/CustomModal";
import FormInput from "@/app/components/inputs/FormInput";

interface RequisitionRequestsTableProps {
    data: Array<Record<string, any>>;
    loading: boolean;
    onRefresh?: () => void;
}

interface FilterState {
    search: string;
    category: string;
    orderDate: string | null;
}

export default function RequisitionRequestsTable({ data, loading, onRefresh }: RequisitionRequestsTableProps) {
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        category: "all",
        orderDate: null,
    });
    const [requisitionNo, setRequisitionNo] = useState<string | null>(null);
    const [clickAction, setClickAction] = useState<'View' | 'Edit'>('View');

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // Search filter
            const matchesSearch = item.no.toLowerCase().includes(filters.search.toLowerCase());

            // Category filter
            const matchesCategory = filters.category === "all" ||
              decodeValue(item.documentType) === filters.category;

            // Order date filter
            const matchesOrderDate = !filters.orderDate ||
              new Date(item.orderDate).toDateString() === new Date(filters.orderDate).toDateString();

            return matchesSearch && matchesCategory && matchesOrderDate;
        });
    }, [data, filters]);

    const handleCloseModal = () => setRequisitionNo(null);

    const handleOpenModal = (no: string, action: 'View' | 'Edit') => {
        setRequisitionNo(no);
        setClickAction(action);
    };

    const handleFilterChange = (name: keyof FilterState, value: string | null) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const columns = [
        {
            name: "Reference",
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
            name: "Title",
            selector: (row: Record<string, any>) => row.title,
        },
        {
            name: "Amount",
            selector: (row: Record<string, any>) =>
              `${row.currencyCode || "KES"} ${formatNumber(row.amount)}`,
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
            name: "Category",
            cell: (row: Record<string, any>) => {
                const documentType = decodeValue(row.documentType);

                const badgeClasses = {
                    "User Requisition": "badge bg-info-subtle text-info",
                    "Store Requisition": "badge bg-success-subtle text-success",
                    "Purchase Requisition": "badge bg-warning-subtle text-warning",
                };

                const iconClasses = {
                    "User Requisition": "fas fa-user me-1",
                    "Store Requisition": "fas fa-store me-1",
                    "Purchase Requisition": "fas fa-cart-shopping me-1",
                };

                return (
                  <span className={badgeClasses[documentType]}>
            <i className={iconClasses[documentType]} /> {documentType}
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
                    onClick={() => handleOpenModal(row.no, 'View')}
                  >
                      <i className="las la-eye fs-18" />
                  </button>
                  {row.status === "Open" && (
                    <button
                      className="text-primary border-0 bg-transparent"
                      title="Edit"
                      onClick={() => handleOpenModal(row.no, 'Edit')}
                    >
                        <i className="la la-pencil fs-18" />
                    </button>
                  )}
              </div>
            ),
            ignoreRowClick: true,
            style: { minWidth: "120px" },
        },
    ];

    const renderFilters = () => (
      <>
          <OrderDateFilter
            disabled={loading}
            value={filters.orderDate}
            onChange={(date) => handleFilterChange('orderDate', date)}
          />
          <CategoryFilter
            disabled={loading}
            value={filters.category}
            onChange={(category) => handleFilterChange('category', category)}
          />
      </>
    );

    return (
      <>
          <SkeletonDataTable
            title=""
            columns={columns}
            data={loading ? [] : filteredData}
            searchPlaceholder="Search request..."
            loading={loading}
            filters={renderFilters()}
          />

          <CustomModal
            show={!!requisitionNo}
            onClose={handleCloseModal}
            title={`${clickAction} Requisition (${requisitionNo})`}
            size="xl"
            titleIcon={clickAction === 'Edit' ?
              <Pencil size={18} className="text-white" /> :
              <EyeIcon size={18} className="text-white" />}
          >
              <div className="row">
                  <div className="col-md-12">
                      <RequisitionForm
                        requisitionNo={requisitionNo}
                        onClose={handleCloseModal}
                        onSuccess={onRefresh}
                      />
                  </div>
              </div>
          </CustomModal>
      </>
    );
}

interface OrderDateFilterProps {
    disabled: boolean;
    value: string | null;
    onChange: (date: string | null) => void;
}

const OrderDateFilter = ({ disabled, value, onChange }: OrderDateFilterProps) => (
  <div className="d-flex ps-2">
      <FormInput
        type="date"
        id="orderDate"
        placeholder="Order Date"
        value={value || ""}
        onChange={(value) => onChange(value || null)}
        disabled={disabled}
        styles="mb-0"
      />
  </div>
);

interface CategoryFilterProps {
    disabled: boolean;
    value: string;
    onChange: (category: string) => void;
}

const CategoryFilter = ({ disabled, value, onChange }: CategoryFilterProps) => (
  <div className="d-flex">
      <select
        className="form-select"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
          <option value="all">All Categories</option>
          <option value="User Requisition">User Requisition</option>
          <option value="Purchase Requisition">Purchase Requisition</option>
          <option value="Store Requisition">Store Requisition</option>
      </select>
  </div>
);
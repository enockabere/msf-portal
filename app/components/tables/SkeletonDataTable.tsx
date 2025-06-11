"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import DataTable from "react-data-table-component";
import { Search, Download } from "lucide-react";
import { Button } from "react-bootstrap";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import "./datatable-custom.css";

interface SkeletonDataTableProps {
  title?: string;
  columns: any[]; // Consider defining a proper type for columns
  data: any[]; // Consider defining a proper type for your data
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  loading?: boolean;
}

export default function SkeletonDataTable({
                                            title,
                                            columns,
                                            data,
                                            filters,
                                            actions,
                                            searchPlaceholder = "Search...",
                                            loading = false,
                                          }: SkeletonDataTableProps) {
  const [search, setSearch] = useState("");
  const { data: session } = useSession();

  const filteredData = data?.filter((item) => {
    const values = Object.values(item).join(" ").toLowerCase();
    return values.includes(search.toLowerCase());
  });

  const handleExportCSV = () => {
    if (!title || !session?.user?.profile?.number) return;

    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const fileName = `${title.split(" ").join("")}-${session.user.profile.number}-${Date.now()}.csv`;
    saveAs(blob, fileName);
  };

  const renderSearchAndFilters = () => (
    <div className="d-flex align-items-center">
      <div className="d-flex gap-2 align-items-center flex-grow-1">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={searchPlaceholder}
          disabled={loading}
        />
        {filters}
        {actions}
      </div>
    </div>
  );

  const renderExportButton = () => (
    <Button variant="secondary" onClick={handleExportCSV} disabled={loading}>
      <Download size={16} className="me-1" /> Export CSV
    </Button>
  );

  const renderLoadingSkeleton = () => (
    <div className="table-responsive">
      <div className="table">
        {[...Array(6)].map((_, index) => (
          <div className="skeleton-row" key={index}>
            {[...Array(7)].map((_, colIndex) => (
              <div
                className={`skeleton-cell skeleton-col-${colIndex + 1}`}
                key={colIndex}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-center text-muted mt-2">Loading data...</div>
    </div>
  );

  return (
    <div className="container mt-1">
      {title && <h5 className="fw-bold mb-3">{title}</h5>}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        {renderSearchAndFilters()}
        {renderExportButton()}
      </div>

      {loading ? (
        renderLoadingSkeleton()
      ) : (
        <DataTable
          className="react-data-table"
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          responsive
          selectableRows
          persistTableHead
          defaultSortFieldId={1}
        />
      )}
    </div>
  );
}

// Sub-components for better organization
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
}

const SearchInput = ({ value, onChange, placeholder, disabled }: SearchInputProps) => (
  <div className="position-relative me-2">
    <Search
      className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
      size={16}
    />
    <input
      type="text"
      className="form-control ps-4"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  </div>
);
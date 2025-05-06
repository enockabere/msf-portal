"use client";

import DataTable from "react-data-table-component";
import { Search, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import "./datatable-custom.css";

interface SkeletonDataTableProps {
  title?: string;
  columns: any[];
  data: any[];
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

  const filtered = data.filter((item) => {
    const values = Object.values(item).join(" ").toLowerCase();
    return values.includes(search.toLowerCase());
  });

  const exportCSV = () => {
    const csv = Papa.unparse(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "data-export.csv");
  };

  return (
    <div className="container mt-1">
      {title && <h5 className="fw-bold mb-3">{title}</h5>}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div className="d-flex gap-2 align-items-center flex-grow-1">
          <div className="position-relative me-2">
            <Search
              className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
              size={16}
            />
            <input
              type="text"
              className="form-control ps-4"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
          </div>
          {filters}
          {actions}
        </div>

        <div>
          <Button variant="secondary" onClick={exportCSV} disabled={loading}>
            <Download size={16} className="me-1" /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="table-responsive">
          <div className="table">
            {[...Array(6)].map((_, index) => (
              <div className="skeleton-row" key={index}>
                <div className="skeleton-cell skeleton-col-1"></div>
                <div className="skeleton-cell skeleton-col-2"></div>
                <div className="skeleton-cell skeleton-col-3"></div>
                <div className="skeleton-cell skeleton-col-4"></div>
                <div className="skeleton-cell skeleton-col-5"></div>
                <div className="skeleton-cell skeleton-col-6"></div>
                <div className="skeleton-cell skeleton-col-7"></div>
              </div>
            ))}
          </div>
          <div className="text-center text-muted mt-2">
            Loading advance data...
          </div>
        </div>
      ) : (
        <DataTable
          className="react-data-table"
          columns={columns}
          data={filtered}
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

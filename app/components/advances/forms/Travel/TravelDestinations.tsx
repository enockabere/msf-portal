"use client";

import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Save, Trash2 } from "lucide-react";

interface DestinationItem {
  id: string;
  documentType: string;
  documentNo: string;
  originCountryCode: string;
  originCity: string;
  destinationCountryCode: string;
  destinationCity: string;
  travelDate: string;
  modeOfTransport: string;
  visaRequired: string;
}

interface TravelDestinationsProps {
  destinations: DestinationItem[];
  onDestinationChange: <K extends keyof DestinationItem>(
    index: number,
    field: K,
    value: DestinationItem[K]
  ) => void;
  onRemoveDestination: (index: number) => void;
}

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Japan",
  "China",
  "Australia",
  "South Africa",
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
];

const TRANSPORT_MODES = ["Air", "Rail", "Road"];

export default function TravelDestinations({
  destinations,
  onDestinationChange,
  onRemoveDestination,
}: TravelDestinationsProps) {
  const columns: TableColumn<DestinationItem>[] = [
    {
      name: "#",
      width: "50px",
      cell: (_row, index) => index + 1,
    },
    {
      name: "Origin Country",
      cell: (row, index) => (
        <select
          className="form-select"
          value={row.originCountryCode}
          onChange={(e) =>
            onDestinationChange(index, "originCountryCode", e.target.value)
          }
        >
          <option value="">-- Select --</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      ),
    },
    {
      name: "Origin City",
      cell: (row, index) => (
        <input
          type="text"
          className="form-control"
          value={row.originCity}
          onChange={(e) =>
            onDestinationChange(index, "originCity", e.target.value)
          }
        />
      ),
    },
    {
      name: "Destination Country",
      cell: (row, index) => (
        <select
          className="form-select"
          value={row.destinationCountryCode}
          onChange={(e) =>
            onDestinationChange(index, "destinationCountryCode", e.target.value)
          }
        >
          <option value="">-- Select --</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      ),
    },
    {
      name: "Destination City",
      cell: (row, index) => (
        <input
          type="text"
          className="form-control"
          value={row.destinationCity}
          onChange={(e) =>
            onDestinationChange(index, "destinationCity", e.target.value)
          }
        />
      ),
    },
    {
      name: "Travel Date",
      cell: (row, index) => (
        <input
          type="date"
          className="form-control"
          value={row.travelDate}
          onChange={(e) =>
            onDestinationChange(index, "travelDate", e.target.value)
          }
        />
      ),
    },
    {
      name: "Transport Mode",
      cell: (row, index) => (
        <select
          className="form-select"
          value={row.modeOfTransport}
          onChange={(e) =>
            onDestinationChange(index, "modeOfTransport", e.target.value)
          }
        >
          <option value="">-- Select --</option>
          {TRANSPORT_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      ),
    },
    {
      name: "Visa Required",
      cell: (row, index) => (
        <select
          className="form-select"
          value={row.visaRequired}
          onChange={(e) =>
            onDestinationChange(index, "visaRequired", e.target.value)
          }
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      ),
    },
    {
      name: "Actions",
      width: "100px",
      cell: (_row, index) => (
        <div className="d-flex justify-content-center gap-1">
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            title="Save"
          >
            <Save size={16} />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onRemoveDestination(index)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="card mb-4">
      <div className="card-body">
        <DataTable
          columns={columns}
          data={destinations}
          dense
          responsive
          highlightOnHover
          persistTableHead
          customStyles={{
            table: {
              style: {
                border: "1px solid #dee2e6", // outer border
              },
            },
            headRow: {
              style: {
                backgroundColor: "#f1f1f1", // light grey
                borderBottom: "1px solid #dee2e6",
              },
            },
            headCells: {
              style: {
                fontSize: "14px",
                paddingLeft: "12px",
                paddingRight: "12px",
                borderRight: "1px solid #dee2e6",
              },
            },
            rows: {
              style: {
                borderBottom: "1px solid #dee2e6",
              },
            },
            cells: {
              style: {
                padding: "6px 12px",
                borderRight: "1px solid #dee2e6",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

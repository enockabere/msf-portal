"use client";

import React from "react";
import { Save, Trash2 } from "lucide-react";

interface DestinationItem {
  id: string;
  country: string;
  startDate: string;
  endDate: string;
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

export default function TravelDestinations({
  destinations,
  onDestinationChange,
  onRemoveDestination,
}: TravelDestinationsProps) {
  return (
    <>
      <div className="card mb-4">
        <div className="card-body">
          <table className="table table-bordered mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Country</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((dest, idx) => (
                <tr key={dest.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <select
                      className="form-select"
                      value={dest.country}
                      onChange={(e) =>
                        onDestinationChange(idx, "country", e.target.value)
                      }
                      required
                    >
                      <option value="">-- Select Country --</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      className="form-control"
                      value={dest.startDate}
                      onChange={(e) =>
                        onDestinationChange(idx, "startDate", e.target.value)
                      }
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      className="form-control"
                      value={dest.endDate}
                      min={dest.startDate}
                      onChange={(e) =>
                        onDestinationChange(idx, "endDate", e.target.value)
                      }
                      required
                    />
                  </td>
                  <td className="text-center">
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
                        onClick={() => onRemoveDestination(idx)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

"use client";

import React, {useEffect} from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Save, Trash2 } from "lucide-react";
import { useMySetups } from "@/app/context/SetupContext";
import {createResource} from "@/app/lib/api/http";
import {  Destination } from "@/app/types/Destination";

interface TravelDestinationsProps {
  destinations: Destination[];
  onDestinationChange: <K extends keyof Destination>(
    index: number,
    field: K,
    value: Destination[K]
  ) => void;
  onRemoveDestination: (index: number) => void;
}

export default function TravelDestinations({
  destinations,
  onDestinationChange,
  onRemoveDestination,
}: TravelDestinationsProps) {
  const {
    countries,
    cities,
    modeOfTransport,
    fetchSetups,
  } = useMySetups();

  const columns: TableColumn<Destination>[] = [
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
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country?.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      name: "Origin City",
      cell: (row, index) => (
        // <input
        //   type="text"
        //   className="form-control"
        //   value={row.originCity}
        //   onChange={(e) =>
        //     onDestinationChange(index, "originCity", e.target.value)
        //   }
        // />

        <select
            className="form-select"
            value={row.originCity}
            onChange={(e) =>
                onDestinationChange(index, "originCity", e.target.value)
            }
        >
          <option value="">-- Select --</option>
          {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city?.name}
              </option>
          ))}
        </select>
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
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      name: "Destination City",
      cell: (row, index) => (
        // <input
        //   type="text"
        //   className="form-control"
        //   value={row.destinationCity}
        //   onChange={(e) =>
        //     onDestinationChange(index, "destinationCity", e.target.value)
        //   }
        // />

          <select
              className="form-select"
              value={row.destinationCity}
              onChange={(e) =>
                  onDestinationChange(index, "destinationCity", e.target.value)
              }
          >
            <option value="">-- Select --</option>
            {cities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city?.name}
                </option>
            ))}
          </select>
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
          {modeOfTransport.map((mode) => (
            <option key={mode.code} value={mode.code}>
              {mode.description	}
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
            onClick={() => saveDestination(index)}
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

  const saveDestination = async (index: number) => {
    let destination = destinations[index];
    destination['documentType'] = 'Employee';
    destination['documentNo'] = '8w45ndfgn';
    destination['sequenceNo'] = '12349213';
    const keysToRemove = ['id', 'originCountry', 'destinationCountry','transportMode', 'visaRequired'];

    keysToRemove.forEach((key) => {
      delete destination[key as keyof typeof destination];
    });

    // Replace this with actual API call
    console.log("Saving destination:", destination);

    const res = await createResource('travelRoutes', {
      data: {
        ...destination
      },
    });

    console.log('create routes res', res)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSetups([
          "countries",
          "cities",
          "modeOfTransport",
        ]);
      } catch (err) {
        console.log(err)
      }
    };

    loadData();
  }, []);

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

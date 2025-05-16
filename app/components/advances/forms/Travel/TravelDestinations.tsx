"use client";

import React, {useEffect, useState} from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Save, Trash2 } from "lucide-react";
import { useMySetups } from "@/app/context/SetupContext";
import {createResource, deleteResource, getResource} from "@/app/lib/api/http";
import {  Destination } from "@/app/types/Destination";
import {Approval} from "@/app/types/approval";
import Swal from "sweetalert2";

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
    modeOfTransport,
    fetchSetups,
  } = useMySetups();
  const [originCities, setOriginCities] = useState([])
  const [destinationCities, setDestinationCities] = useState([])
  const [travelRequests, setTravelRequests] = useState([])

  const saveDestination = async (index: number) => {
    const destination = destinations[index];
    destination['documentType'] = 'Employee';
    destination['documentNo'] = 'ETR003';
    // destination['sequenceNo'] = '';
    const keysToRemove = ['id', 'originCountry', 'destinationCountry','transportMode', 'sequenceNo'];

    keysToRemove.forEach((key) => {
      delete destination[key as keyof typeof destination];
    });

    // Replace this with actual API call
    console.log("Saving destination:", destination);


    try {
      const res = await createResource('travelRoutes', {
          data: {
              ...destination
          },
      });

      if(res.error) {
         return Swal.fire('Error!', res.error.message)
      }
      console.log('create routes res', res)
      Swal.fire("Success", 'Travel route was created successfully!' );
    } catch (e) {
        Swal.fire('Error!', e.message)
    }

  }

    const deleteTravelRequest = async (row: Destination) => {
        try {
            const res =  await deleteResource('travelRoutes', {
                params: {
                    documentType: "",
                    documentNo: "",
                    sequenceNo: ""
                }
            });

            if(res.error) {
                return Swal.fire('Error!', res.error.message)
            }
            console.log('create routes res', res)
            Swal.fire("Success", 'Travel route was deleted successfully!' );
        } catch (e) {
            Swal.fire('Error!', e.message)
        }
    }

  const fetchCities = async (countryCode, countryField) => {
    try {
      if (countryCode) {
        const res = await getResource('cities', {
          params: {
            filters: {
              countryRegionCode: countryCode,
            }
          }
        })

        if (res.error) {
          console.log('Error!', res.error)
        }

        if (countryField === 'originCountryCode') {
          setOriginCities([...res.value])
        } else if (countryField === 'destinationCountryCode') {
          setDestinationCities([...res.value])
        }
      } else {
        if (countryField === 'originCountryCode') {
          setOriginCities([])
        } else if (countryField === 'destinationCountryCode') {
          setDestinationCities([])
        }
      }
    } catch (error: any) {
      console.log('Error!', error.message)
    }
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
    userTravelRoutes()
  });

    const userTravelRoutes = async () => {
       const res = await getResource('travelRoutes', {
            params: {
                filters: {
                    documentNo: "ETR003"
                }
            }
        })

        setTravelRequests(res?.value)
    }


    const columns: TableColumn<Destination>[] = [
        {
            name: "Destination Details",
            cell: (row, index) => (
                <div className="row g-2">
                    <div className="col-4">
                        <select
                            className="form-select"
                            value={row.originCountryCode}
                            onChange={async (e) => {
                                onDestinationChange(index, "originCountryCode", e.target.value);
                                await fetchCities(e.target.value, 'originCountryCode');
                            }}
                        >
                            <option value="">-- Origin Country --</option>
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.displayName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-4">
                        <select
                            className="form-select"
                            value={row.originCity}
                            onChange={(e) => onDestinationChange(index, "originCity", e.target.value)}
                        >
                            <option value="">-- Origin City --</option>
                            {originCities.map((city) => (
                                <option key={city.code} value={city.city}>
                                    {city.city}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-4">
                        <select
                            className="form-select"
                            value={row.destinationCountryCode}
                            onChange={async (e) => {
                                onDestinationChange(index, "destinationCountryCode", e.target.value);
                                await fetchCities(e.target.value, 'destinationCountryCode');
                            }}
                        >
                            <option value="">-- Destination Country --</option>
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.displayName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-4">
                        <select
                            className="form-select"
                            value={row.destinationCity}
                            onChange={(e) => onDestinationChange(index, "destinationCity", e.target.value)}
                        >
                            <option value="">-- Destination City --</option>
                            {destinationCities.map((city) => (
                                <option key={city.code} value={city.city}>
                                    {city.city}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-4">
                        <input
                            type="date"
                            className="form-control"
                            value={row.travelDate}
                            onChange={(e) => onDestinationChange(index, "travelDate", e.target.value)}
                        />
                    </div>

                    <div className="col-4">
                        <select
                            className="form-select"
                            value={row.modeOfTransport}
                            onChange={(e) => onDestinationChange(index, "modeOfTransport", e.target.value)}
                        >
                            <option value="">-- Transport Mode --</option>
                            {modeOfTransport.map((mode) => (
                                <option key={mode.code} value={mode.code}>
                                    {mode.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-4 d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() => saveDestination(index)}
                            title="Save"
                        >
                            <Save size={16} />
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onRemoveDestination(index)}
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ),
        },
    ];


    const routesColumns = [
        {
            name: "Document No",
            sortable: true,
            cell: (row: Destination) => (
                <span className="text-dark"
                >
                    {row.documentNo}
                </span>
            ),
        },
        {
            name: "origin Country",
            selector: (row: Destination) => row.originCountryCode,
            sortable: true,
            cell: (row: Destination) => (
                <span>{row.originCountryCode}</span>
            ),
        },
        {
            name: "origin City",
            selector: (row: Destination) => row.originCity,
            sortable: true,
            cell: (row: Destination) => (
                <span>{row.originCity}</span>
            ),
        },
        {
            name: "destination Country",
            selector: (row: Destination) => row.destinationCountryCode,
            sortable: true,
            cell: (row: Destination) => (
                <span>{row.destinationCountryCode}</span>
            ),
        },
        {
            name: "destination City",
            selector: (row: Destination) => row.destinationCity,
            sortable: true,
            cell: (row: Destination) => (
                <span>{row.destinationCity}</span>
            ),
        },
        {
            name: "Date",
            selector: (row: Destination) => row.travelDate,
            sortable: true,
            cell: (row: Destination) => (
                <span>
                    {row.travelDate ?? ""}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row: Destination) => (
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deleteTravelRequest(row)}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            style: { minWidth: "100px" },
        },
    ];

  return (
    <div className="card mb-4">
        {destinations.length > 0 && (
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
                                border: "1px solid #dee2e6",
                            },
                        },
                        headRow: {
                            style: {
                                backgroundColor: "#f1f1f1",
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
        )}

        <div className="card-body">
            <DataTable
                columns={routesColumns}
                data={travelRequests}
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

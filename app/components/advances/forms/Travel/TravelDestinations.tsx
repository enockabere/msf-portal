"use client";

import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Save, Trash2 } from "lucide-react";
import { useMySetups } from "@/app/context/SetupContext";
import { createResource, deleteResource, getResource } from "@/app/lib/api/http";
import { Destination } from "@/app/types/Destination";
import Swal from "sweetalert2";
import { TravelRequest } from "@/app/types/travel";
import { formatDate } from "@/app/utils/dateFormats";

interface TravelDestinationsProps {
    travelRequestHeader: TravelRequest;
    isReadOnly: boolean;
    onSubmit: (requestNo: string) => void;
}

export default function TravelDestinations({
    travelRequestHeader,
    isReadOnly,
    onSubmit,
}: TravelDestinationsProps) {
    const {
        countries,
        modeOfTransport,
        fetchSetups,
    } = useMySetups();
    const [originCities, setOriginCities] = useState([])
    const [destinationCities, setDestinationCities] = useState([])
    const [destinations, setDestinations] = useState<Destination[]>([]);

    const handleDestinationChange = <K extends keyof Destination>(
        index: number,
        field: K,
        value: Destination[K]
    ) => {
        const updated = [...destinations];
        updated[index][field] = value;
        setDestinations(updated);
    };

    const removeDestination = (index: number) => {
        setDestinations((prev) => prev.filter((_, i) => i !== index));
    };

    const addDestination = () => {
        setDestinations((prev) => [
            ...prev,
            {
                originCountryCode: "",
                originCity: "",
                destinationCountryCode: "",
                destinationCity: "",
                travelDate: "",
                modeOfTransport: "",
                documentNo: travelRequestHeader.documentNo,
                documentType: travelRequestHeader.documentType,
            },
        ]);
    };

    const saveDestination = async (index: number) => {
        const destination = destinations[index];
        destination['documentType'] = travelRequestHeader.documentType;
        destination['documentNo'] = travelRequestHeader.no;

        try {
            const res = await createResource('travelRoutes', {
                data: destination,
            });

            if (res.error) {
                return Swal.fire('Error!', res.error.message)
            }
            Swal.fire("Success", 'Travel route was created successfully!');
            removeDestination(index)
            onSubmit(travelRequestHeader.no);
        } catch (e) {
            Swal.fire('Error!', e.message)
        }

    }

    const deleteDestination = async (row: Destination) => {
        try {
            console.log(row)
            const res = await deleteResource('travelRoutes', {
                data: row,
                primaryKey: ['documentType', 'documentNo', 'sequenceNo'],
            });

            if (res.error) {
                return Swal.fire('Error!', res.error.message)
            }
            Swal.fire("Success", 'Travel route was deleted successfully!');
            onSubmit(travelRequestHeader.no);
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
    }, [fetchSetups]);

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
                                handleDestinationChange(index, "originCountryCode", e.target.value);
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
                            onChange={(e) => handleDestinationChange(index, "originCity", e.target.value)}
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
                                handleDestinationChange(index, "destinationCountryCode", e.target.value);
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
                            onChange={(e) => handleDestinationChange(index, "destinationCity", e.target.value)}
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
                            onChange={(e) => handleDestinationChange(index, "travelDate", e.target.value)}
                        />
                    </div>

                    <div className="col-4">
                        <select
                            className="form-select"
                            value={row.modeOfTransport}
                            onChange={(e) => handleDestinationChange(index, "modeOfTransport", e.target.value)}
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
                            onClick={() => removeDestination(index)}
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ),
        },
    ];


    const routesColumns: Array<Record<string, any>> = [
        {
            name: "Ref No",
            cell: (row: Destination) => (
                <span className="text-dark">{row.documentNo}</span>
            ),
        },
        {
            name: "From",
            cell: (row: Destination) => (
                <span>{`${row.originCountryCode} - ${row.originCity}`}</span>
            ),
        },
        {
            name: "To",
            cell: (row: Destination) => (
                <span>{`${row.destinationCountryCode} - ${row.destinationCity}`}</span>
            ),
        },
        {
            name: 'Travel Date',
            selector: (row: Destination) => row.travelDate,
            sortable: true,
            cell: (row: Destination) => (
                <span>{formatDate(row.travelDate)}</span>
            ),
        },
    ];

    if (!isReadOnly) {
        routesColumns.push({
            name: "Actions",
            cell: (row: Destination) => (
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deleteDestination(row)}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            style: { minWidth: "100px" },
        },)
    }

    return (
        <div className="card mb-4">
            {!isReadOnly && (
                <div className="d-flex justify-content-end align-items-center  ">
                    <button
                        type="button"
                        className="btn btn-danger mb-2"
                        onClick={addDestination}
                    >
                        <i className="fa fa-plus me-1"></i>
                        Add Destination
                    </button>
                </div>
            )}
            {destinations?.length > 0 && (
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
                    data={travelRequestHeader.travelRequestRoutes}
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

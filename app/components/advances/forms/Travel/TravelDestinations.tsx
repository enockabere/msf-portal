"use client";

import React, { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { useMySetups } from "@/app/context/SetupContext";
import { createResource, deleteResource, getResource } from "@/app/lib/api/http";
import { Destination } from "@/app/types/Destination";
import Swal from "sweetalert2";
import { TravelRequest } from "@/app/types/travel";
import { formatDate } from "@/app/utils/dateFormats";
import SectionLoader from "@/app/components/loaders/SectionLoader";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
            setIsSubmitting(true);

            const res = await createResource('travelRoutes', {
                data: destination,
            });

            if (res.error) {
                setIsSubmitting(false);
                return Swal.fire('Error!', res.error.message)
            }
            removeDestination(index)
            setIsSubmitting(false);
            onSubmit(travelRequestHeader.no);
        } catch (e) {
            setIsSubmitting(false);
            Swal.fire('Error!', e.message)
        }

    }

    const deleteDestination = async (row: Destination) => {
        try {
            setIsDeleting(true);
            const res = await deleteResource('travelRoutes', {
                data: row,
                primaryKey: ['documentType', 'documentNo', 'sequenceNo'],
            });

            if (res.error) {
                setIsDeleting(false);
                return Swal.fire('Error!', res.error.message)
            }

            setIsDeleting(false);
            onSubmit(travelRequestHeader.no);
        } catch (e) {
            setIsDeleting(false);
            Swal.fire('Error!', e.message);
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

    function TravelDestinationForm({destination, index}: {destination: Destination; index: number;}) {
        return (
          <div className="row g-2 mb-2 pb-2 border-bottom m-1">
              <div className="col-4">
                  <label className="form-label">
                      Origin Country <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={destination.originCountryCode}
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
                  <label className="form-label">
                      Origin City <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={destination.originCity}
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
                  <label className="form-label">
                      Destination Country <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={destination.destinationCountryCode}
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
                  <label className="form-label">
                      Destination City <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={destination.destinationCity}
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
                  <label className="form-label">
                      Travel Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={destination.travelDate}
                    onChange={(e) => handleDestinationChange(index, "travelDate", e.target.value)}
                  />
              </div>

              <div className="col-4">
                  <label className="form-label">
                      Mode of Transport <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={destination.modeOfTransport}
                    onChange={(e) => handleDestinationChange(index, "modeOfTransport", e.target.value)}
                  >
                      <option value="">-- Select Mode --</option>
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
                      {isSubmitting ?
                        (<SectionLoader size={16} classes={'button-icon'}/>)
                        : (<Save size={16} className="button-icon" />)}
                      Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeDestination(index)}
                    title="Delete"
                  >
                      <Trash2 size={16} className="button-icon" />
                      Drop
                  </button>
              </div>
          </div>
        );
    }

    return (
        <div className="card">
            {!isReadOnly && (
                <div className="d-flex justify-content-end align-items-center">
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

            {destinations.length > 0 && (
              <h5 className="text-dark bg-light p-2">Add Route Details</h5>
            )}
            {destinations.map((destination: Destination, key: number) => (
              <TravelDestinationForm key={key} destination={destination} index={key}/>
            ))}

            <table className="table table-bordered align-middle">
                <thead className="table-light">
                <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Travel Date</th>
                    {!isReadOnly && (
                      <th className="text-center">Action</th>
                    )}
                </tr>
                </thead>
                <tbody>
                {travelRequestHeader.travelRequestRoutes.length === 0 ? (
                  <tr>
                      <td colSpan={4} className="text-center text-muted">
                          No destinations added so far.
                      </td>
                  </tr>
                ) : (
                  travelRequestHeader.travelRequestRoutes.map((route, key) => (
                    <tr key={`${route.originCountryCode}-${key}`}>
                        <td>{`${route.originCountryCode} - ${route.originCity}`}</td>
                        <td>{`${route.destinationCountryCode} - ${route.destinationCity}`}</td>
                        <td>{formatDate(route.travelDate)}</td>
                        {!isReadOnly && (
                          <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteDestination(route)}
                              >
                                  {isDeleting ?
                                    (<SectionLoader size={16} classes={'button-icon'}/>)
                                    : (<Trash2 size={16} className="button-icon" />)}
                                  Delete
                              </button>
                          </td>
                        )}
                    </tr>
                  ))
                )}
                </tbody>
            </table>
        </div>
    );
}

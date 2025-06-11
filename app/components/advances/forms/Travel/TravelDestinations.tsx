"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Save, Trash2 } from "lucide-react";
import { useMySetups } from "../../../../context/SetupContext";
import { createResource, deleteResource, getResource } from "../../../../lib/api/http";
import Swal from "sweetalert2";
import { TravelRequest } from "../../../../types/travel";
import { formatDate } from "../../../../utils/dateFormats";
import { usePageLoader } from "../../../../context/PageLoaderContext";

interface Destination {
    documentType: string;
    documentNo: string;
    originCountryCode: string;
    originCountryName?: string;
    originCity: string;
    destinationCountryCode: string;
    destinationCountryName?: string;
    destinationCity: string;
    travelDate: string;
    modeOfTransport: string;
    visaRequired?: string;
    [key: string]: any;
}

interface TravelDestinationsProps {
    travelRequestHeader: TravelRequest;
    isReadOnly: boolean;
    onSubmit: (requestNo: string) => void;
}

const TravelDestinationForm = ({
                                   destination,
                                   index,
                                   originCities,
                                   destinationCities,
                                   modeOfTransport,
                                   countries,
                                   isLocal,
                                   isRegional,
                                   onFieldChange,
                                   onSave,
                                   onRemove,
                               }: {
    destination: Destination;
    index: number;
    originCities: any[];
    destinationCities: any[];
    modeOfTransport: any[];
    countries: any[];
    isLocal: boolean;
    isRegional: boolean;
    onFieldChange: (index: number, field: string, value: string) => void;
    onSave: (index: number) => void;
    onRemove: (index: number) => void;
}) => (
  <div className="row g-2 mb-2 pb-2 border-bottom m-1">
      <div className="col-md-6 col-lg-4">
          <label className="form-label">
              Origin Country <span className="text-danger">*{isRegional} </span>
          </label>
          <select
            className="form-select"
            value={destination.originCountryCode}
            onChange={(e) => onFieldChange(index, "originCountryCode", e.target.value)}
          >
              {isLocal ? (
                countries
                  .filter((country) => country.code === 'KE')
                  .map((country) => (
                    <option key={country.code} value={country.code}>
                        {country.name}
                    </option>
                  ))
              ): isRegional ? (
                  // Regional: East African countries
                  <>
                      <option value="">-- Origin Country --</option>
                      {countries
                      .filter((country) => country.regional)
                      .map((country) => (
                      <option key={country.code} value={country.code}>
                          {country.name}
                      </option>
                      ))}
                  </>
              ) : (
                <>
                    <option value="">-- Origin Country --</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                          {country.name}
                      </option>
                    ))}
                </>
              )}
          </select>
      </div>

      <div className="col-md-6 col-lg-4">
          <label className="form-label">
              Origin City <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={destination.originCity}
            onChange={(e) => onFieldChange(index, "originCity", e.target.value)}
          >
              <option value="">-- Origin City --</option>
              {originCities.map((city) => (
                <option key={city.code} value={city.city}>
                    {city.city}
                </option>
              ))}
          </select>
      </div>

      <div className="col-md-6 col-lg-4">
          <label className="form-label">
              Destination Country <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={destination.destinationCountryCode}
            onChange={(e) => onFieldChange(index, "destinationCountryCode", e.target.value)}
          >
              {isLocal ? (
                countries
                  .filter((country) => country.code === 'KE')
                  .map((country) => (
                    <option key={country.code} value={country.code}>
                        {country.name}
                    </option>
                  ))
              ) : isRegional ? (
                  // Regional: East African countries
                  <>
                      <option value="">-- Origin Country --</option>
                      {countries
                          .filter((country) => country.regional)
                          .map((country) => (
                              <option key={country.code} value={country.code}>
                                  {country.name}
                              </option>
                      ))}
                  </>
              ): (
                <>
                    <option value="">-- Destination Country --</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                          {country.name}
                      </option>
                    ))}
                </>
              )}
          </select>
      </div>

      <div className="col-md-6 col-lg-4">
          <label className="form-label">
              Destination City <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={destination.destinationCity}
            onChange={(e) => onFieldChange(index, "destinationCity", e.target.value)}
          >
              <option value="">-- Destination City --</option>
              {destinationCities.map((city) => (
                <option key={city.code} value={city.city}>
                    {city.city}
                </option>
              ))}
          </select>
      </div>

      <div className="col-md-6 col-lg-4">
          <label className="form-label">
              Travel Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={destination.travelDate}
            onChange={(e) => onFieldChange(index, "travelDate", e.target.value)}
          />
      </div>

      <div className="col-md-6 col-lg-4">
          <label className="form-label">
              Mode of Transport <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={destination.modeOfTransport}
            onChange={(e) => onFieldChange(index, "modeOfTransport", e.target.value)}
          >
              <option value="">-- Select Mode --</option>
              {modeOfTransport.map((mode) => (
                <option key={mode.code} value={mode.code}>
                    {mode.description}
                </option>
              ))}
          </select>
      </div>

      <div className="col-12 d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={() => onSave(index)}
            title="Save"
          >
              <Save size={16} className="button-icon" />
              Save
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => onRemove(index)}
            title="Delete"
          >
              <Trash2 size={16} className="button-icon" />
              Drop
          </button>
      </div>
  </div>
);

export default function TravelDestinations({
                                               travelRequestHeader,
                                               isReadOnly,
                                               onSubmit,
                                           }: TravelDestinationsProps) {
    const { countries, modeOfTransport, fetchSetups } = useMySetups();
    const [originCities, setOriginCities] = useState<any[]>([]);
    const [destinationCities, setDestinationCities] = useState<any[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const { actions } = usePageLoader();
    const { dispatcher } = actions;
    const isLocal = travelRequestHeader.TypeOfTravel === 'Local';
    const isRegional = travelRequestHeader.TypeOfTravel === 'Regional';

    const fetchCities = useCallback(async (countryCode: string, countryField: string) => {
        try {
            if (!countryCode) {
                if (countryField === 'originCountryCode') setOriginCities([]);
                if (countryField === 'destinationCountryCode') setDestinationCities([]);
                return;
            }

            const res = await getResource('cities', {
                params: { filters: { countryRegionCode: countryCode } }
            });

            if (res.error) throw new Error(res.error.message);

            if (countryField === 'originCountryCode') {
                setOriginCities(res.value);
            } else if (countryField === 'destinationCountryCode') {
                setDestinationCities(res.value);
            }
        } catch (error: any) {
            console.log('Error!', error.message);
        }
    }, []);

    const handleDestinationChange = useCallback(async(index: number, field: string, value: any) => {
          setDestinations(prev => {
              const updated = [...prev];
              updated[index][field] = value;
              return updated;
          });

          if (["originCountryCode", "destinationCountryCode"].includes(field)) {
              await fetchCities(value, field);
          }
      }, [fetchCities]);

    const removeDestination = useCallback((index: number) => {
        setDestinations(prev => prev.filter((_, i) => i !== index));
    }, []);

    const addDestination = useCallback(() => {
        setDestinations(prev => [
            ...prev,
            {
                originCountryCode: isLocal ? 'KE' : '',
                originCity: "",
                destinationCountryCode: isLocal ? 'KE' : '',
                destinationCity: "",
                travelDate: "",
                modeOfTransport: "",
                documentNo: travelRequestHeader.documentNo,
                documentType: travelRequestHeader.documentType,
            },
        ]);

        if (isLocal) {
            fetchCities('KE', 'originCountryCode');
            fetchCities('KE', 'destinationCountryCode');
        }
    }, [fetchCities, isLocal, isRegional, travelRequestHeader.documentNo, travelRequestHeader.documentType]);

    const saveDestination = useCallback(async (index: number) => {
        const destination = destinations[index];
        destination.documentType = travelRequestHeader.documentType;
        destination.documentNo = travelRequestHeader.no;

        try {
            dispatcher({
                type: 'PATCH_LOADING_STATE',
                payload: { loading: true, message: 'Submitting...' }
            });

            const res = await createResource('travelRoutes', { data: destination });

            if (res.error) {
                throw new Error(res.error.message);
            }

            removeDestination(index);
            onSubmit(travelRequestHeader.no);
        } catch (e: any) {
            Swal.fire('Error!', e.message);
        } finally {
            dispatcher({
                type: 'PATCH_LOADING_STATE',
                payload: { loading: false, message: '' }
            });
        }
    }, [destinations, travelRequestHeader, dispatcher, removeDestination, onSubmit]);

    const deleteDestination = useCallback(async (row: Destination) => {
        try {
            dispatcher({
                type: 'PATCH_LOADING_STATE',
                payload: { loading: true, message: 'Deleting...' }
            });

            const res = await deleteResource('travelRoutes', {
                data: row,
                primaryKey: ['documentType', 'documentNo', 'sequenceNo'],
            });

            if (res.error) throw new Error(res.error.message);

            onSubmit(travelRequestHeader.no);
        } catch (error: any) {
            Swal.fire('Error!', error.message);
        } finally {
            dispatcher({
                type: 'PATCH_LOADING_STATE',
                payload: { loading: false, message: '' }
            });
        }
    }, [dispatcher, onSubmit, travelRequestHeader.no]);

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchSetups(["countries", "cities", "modeOfTransport"]);
            } catch (err) {
                console.log(err);
            }
        };

        loadData();
    }, [fetchSetups]);

    return (
      <div className="row">
          {!isReadOnly && (
            <div className="col-12">
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
            </div>
          )}

          {destinations.length > 0 && (
            <div className="col-12">
                <h5 className="text-dark bg-light p-2">Add Route Details</h5>
            </div>
          )}

          {destinations.map((destination, key) => (
            <div key={key} className="col-12">
                <TravelDestinationForm
                  destination={destination}
                  index={key}
                  originCities={originCities}
                  destinationCities={destinationCities}
                  modeOfTransport={modeOfTransport}
                  countries={countries}
                  isLocal={isLocal}
                  isRegional={isRegional}
                  onFieldChange={handleDestinationChange}
                  onSave={saveDestination}
                  onRemove={removeDestination}
                />
            </div>
          ))}

          <div className="col-12">
              <table className="table table-bordered align-middle">
                  <thead className="table-light">
                  <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Travel Date</th>
                      {!isReadOnly && <th className="text-center">Action</th>}
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
                          <td>{`${route.originCountryName} - ${route.originCity}`}</td>
                          <td>{`${route.destinationCountryName} - ${route.destinationCity}`}</td>
                          <td>{formatDate(route.travelDate)}</td>
                          {!isReadOnly && (
                            <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteDestination(route)}
                                >
                                    <Trash2 size={16} className="button-icon" />
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
      </div>
    );
}
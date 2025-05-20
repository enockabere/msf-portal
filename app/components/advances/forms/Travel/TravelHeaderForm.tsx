"use client";

import React, { useEffect, useState } from "react";
import { TravelInfo } from "./TravelAdvanceHeader";
import { useMySetups } from "@/app/context/SetupContext";
import { TravelRequest } from "@/app/types/travel";
import { getResource } from "@/app/lib/api/http";
import { decodeValue } from "@/app/utils/helpers";
import { Loader } from "lucide-react";

const travelTypes = [
  {code: "Local", description: "Local"},
  {code: "International", description: "International"},
];

const accommodationTypes = [
  {code: "Self-Arranged", description: "Self Arranged"},
  {code: "Full Board", description: "Full Board"},
  {code: "Half Board", description: "Half Board"},
  {code: "Bed & Breakfast", description: "Bed & Breakfast"},
];

const yesNoOptions = [
  {code: 'true', description: 'Yes'},
  {code: 'false', description: 'No'},
];

interface Props {
  formData: TravelRequest;
  requiredFields: Array<string>;
  isReadOnly: boolean;
  isLoading: boolean;
  onFormChange: (field: keyof TravelInfo, value: any) => void;
}

export default function TravelHeaderForm({formData, requiredFields, isReadOnly, isLoading, onFormChange}: Props) {
  const {
    purposeOfTravel,
    modesOfTransport,
    dimensions,
    countries,
    perDiemAllotments,
    fetchSetups,
  } = useMySetups();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSetups([
          'purposeOfTravel',
          'modesOfTransport',
          'countries',
          'perDiemAllotments',
          {
            dimensions: {
              filters: {dimensionCode: 'OC'}
            },
          },
        ]);
      } finally {
        //
      }
    };

    loadData();
  }, [fetchSetups]);

  const [originCities, setOriginCities] = useState([])
  const [canSetRequiresPerDiem, setCanSetRequiresPerDiem] = useState(false)
  const requiresPerDiemChecker = (accommodationType: string) => {
    const allotment = perDiemAllotments.find((item: Record<string, any>) => decodeValue(item.accommodationType) === accommodationType)
    if (!allotment) return false
    return allotment.perDiemAllocated > 0
  }

  const fetchCities = async (countryCode: string) => {
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

        setOriginCities([...res.value])
      } else {
        setOriginCities([])
      }
    } catch (error: any) {
      console.log('Error!', error.message)
    }
  }

  function CabDetails({travelRequest}: { travelRequest: TravelRequest }) {
    return (
      <>
        <div className={'card bg-light-subtle border mt-2'}>
          <div className="card-body">
            <h5 className="card-title fs-14 fw-bold">Cab Details</h5>
            <div className="row">
              <div className="col-12">
                <label className="col-form-label">Pickup Location:</label>
                <span className="text-dark mx-1">
                {travelRequest.pickupLocation || 'N/A'}
              </span>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <label className="col-form-label">Drop-off Location:</label>
                <span className="text-dark mx-1">
                {travelRequest.dropOffLocation || 'N/A'}
              </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="border rounded p-3 bg-light-subtle mt-3">
        <h6 className="text-dark fw-bold">Travel Details</h6>
        <div className="row g-3">
          {isLoading
            ? (
              <div className={'col-12 text-center'}>
                <Loader size={32} className={'blink-animation'}/>
              </div>
            )
            : (
              <>
                {requiredFields.includes('originCountryCode') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Origin Country <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.originCountryCode}
                      onChange={async (e) => {
                        onFormChange('originCountryCode', e.target.value)
                        onFormChange('originCity', '')
                        await fetchCities(e.target.value)
                      }}
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">-- Select Country --</option>
                      {countries.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {requiredFields.includes('originCity') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Origin City <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.originCity}
                      onChange={(e) => onFormChange('originCity', e.target.value)}
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">-- Select City --</option>
                      {originCities.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {requiredFields.includes('TypeOfTravel') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Type of Travel <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.TypeOfTravel}
                      onChange={(e) => onFormChange("TypeOfTravel", e.target.value)}
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">-- Select Type --</option>
                      {travelTypes.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {requiredFields.includes('modeOfTransport') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Mode of Transport <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.modeOfTransport}
                      onChange={(e) => onFormChange("modeOfTransport", e.target.value)}
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">-- Select Mode --</option>
                      {modesOfTransport.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {requiredFields.includes('purposeOfTravel') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Purpose of Travel <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.purposeOfTravel}
                      onChange={(e) => onFormChange('purposeOfTravel', e.target.value)}
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">-- Select Purpose --</option>
                      {purposeOfTravel.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {requiredFields.includes('annualTrip') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Annual Trip <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={String(formData.annualTrip)}
                      onChange={(e) => onFormChange('annualTrip', e.target.value === 'true')}
                      required
                      disabled={isReadOnly}
                    >
                      {yesNoOptions.map((item) => (
                        <option key={item.code} value={item.code}>{item.description}</option>
                      ))}
                    </select>
                  </div>
                )}

                {requiredFields.includes('passportNo') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      ID/Passport Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.passportNo}
                      onChange={(e) =>
                        onFormChange("passportNo", e.target.value)
                      }
                      placeholder="Enter ID or Passport number"
                      required
                      disabled={isReadOnly}
                    />
                  </div>
                )}

                {requiredFields.includes('departureDate') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Departure Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.departureDate}
                      onChange={(e) =>
                        onFormChange('departureDate', e.target.value)
                      }
                      required
                      disabled={isReadOnly}
                    />
                  </div>
                )}

                {requiredFields.includes('arrivalDate') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Arrival Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.arrivalDate}
                      onChange={(e) =>
                        onFormChange('arrivalDate', e.target.value)
                      }
                      required
                      disabled={isReadOnly}
                    />
                  </div>
                )}

                {requiredFields.includes('estimatedTimeOfArrival') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Expected Time of Arrival <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.estimatedTimeOfArrival}
                      onChange={(e) =>
                        onFormChange('estimatedTimeOfArrival', `${e.target.value}:00`)
                      }
                      required
                      disabled={isReadOnly}
                    />
                  </div>
                )}

                {requiredFields.includes('returnDate') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Return Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.returnDate}
                      onChange={(e) =>
                        onFormChange('returnDate', e.target.value)
                      }
                      required
                      disabled={isReadOnly}
                    />
                  </div>
                )}

                {requiredFields.includes('accommodationType') && (
                  <div className="col-md-4">
                    <label className="form-label">Accommodation Type</label>
                    <select
                      className="form-select"
                      value={decodeValue(formData.accommodationType)}
                      onChange={(e) => {
                        onFormChange("accommodationType", e.target.value)
                        setCanSetRequiresPerDiem(requiresPerDiemChecker(e.target.value))
                      }}
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">-- Select Accommodation --</option>
                      {accommodationTypes.map((type) => (
                        <option key={type.code} value={type.code}>
                          {type.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {requiredFields.includes('requirePerDiem') && canSetRequiresPerDiem && (
                  <div className="col-md-4">
                    <label className="form-label">Require Per Diem</label>
                    <select
                      className="form-select"
                      value={formData.requirePerDiem}
                      onChange={(e) => onFormChange('requirePerDiem', e.target.value === 'true')}
                      required
                      disabled={isReadOnly}
                    >
                      {yesNoOptions.map((item) => (
                        <option key={item.code} value={item.code}>{item.description}</option>
                      ))}
                    </select>
                  </div>
                )}

                {requiredFields.includes('shortcutDimension1Code') && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Cost Center <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.shortcutDimension1Code}
                      onChange={(e) => onFormChange('shortcutDimension1Code', e.target.value)}
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">-- Select Cost Center --</option>
                      {dimensions.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
        </div>
      </div>

      {formData.documentType === 'Visitor'
        && (formData.pickupLocation || formData.dropOffLocation)
        && <CabDetails travelRequest={formData}/>}
    </>
  );
}

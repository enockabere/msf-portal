"use client";

import React, { useEffect } from "react";
import { TravelInfo } from "./TravelAdvanceHeader";
import { useMySetups } from "@/app/context/SetupContext";
import { TravelRequest } from "@/app/types/travel";
import { EndpointOptions } from "@/app/types/global";
import { ENDPOINTMAP } from "@/app/utils/endpointMap";

const travelTypes = [
  { code: "Local", description: "Local" },
  { code: "International", description: "International" },
];

const accommodationTypes = [
  { code: "Self-Arranged", description: "Self Arranged" },
  { code: "Full Board", description: "Full Board" },
  { code: "Half Board", description: "Half Board" },
  { code: "Bed & Breakfast", description: "Bed & Breakfast" },
];

const yesNoOptions = [
  { code: 'true', description: 'Yes' },
  { code: 'false', description: 'No' },
];

interface Props {
  formData: TravelRequest;
  onFormChange: (field: keyof TravelInfo, value: any) => void;
}

export default function TravelHeaderForm({ formData, onFormChange }: Props) {
  const {
    purposeOfTravel,
    modesOfTransport,
    dimensions,
    fetchSetups,
  } = useMySetups();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSetups([
          'purposeOfTravel',
          'modesOfTransport',
          {
            dimensions: {
              filters: { dimensionCode: 'OC' }
            },
          },
        ]);
      } finally {
        //
      }
    };

    loadData();
  }, [fetchSetups]);

  useEffect(() => {
    if (formData.travelType && formData.costCenter) {
      const randomTrips = Math.floor(Math.random() * 5) + 1;
      onFormChange("remainingTrips", randomTrips);
    }
  }, [formData.travelType, formData.costCenter, onFormChange]);

  return (
    <>
      <div className="border rounded p-3 bg-light-subtle mt-3">
        <h6 className="text-dark fw-bold">Travel Details</h6>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">
              Type of Travel <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.TypeOfTravel}
              onChange={(e) => onFormChange("TypeOfTravel", e.target.value)}
              required
            >
              <option value="">-- Select Type --</option>
              {travelTypes.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.description}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Mode of Transport <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.modeOfTransport}
              onChange={(e) => onFormChange("modeOfTransport", e.target.value)}
              required
            >
              <option value="">-- Select Mode --</option>
              {modesOfTransport.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.description}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Purpose of Travel <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.purposeOfTravel}
              onChange={(e) => onFormChange("reason", e.target.value)}
              required
            >
              <option value="">-- Select Purpose --</option>
              {purposeOfTravel.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.description}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Annual Trip <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={String(formData.annualTrip)}
              onChange={(e) => onFormChange('annualTrip', e.target.value === 'true')}
              required
            >
              {yesNoOptions.map((item) => (
                <option key={item.code} value={item.code}>{item.description}</option>
              ))}
            </select>
          </div>

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
            />
          </div>

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
            />
          </div>

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
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Expected Time of Arrival <span className="text-danger">*</span>
            </label>
            <input
              type="time"
              className="form-control"
              value={formData.estimatedTimeOfArrival}
              onChange={(e) =>
                onFormChange('estimatedTimeOfArrival', e.target.value)
              }
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Accommodation Type</label>
            <select
                className="form-select"
                value={formData.accommodationType || ""}
                onChange={(e) => onFormChange("accommodationType", e.target.value)}
            >
              <option value="">-- Select Accommodation --</option>
              {accommodationTypes.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.description}
                  </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Require Per Diem</label>
            <select
                className="form-select"
                value={formData.requirePerDiem }
                onChange={(e) => onFormChange('requirePerDiem', e.target.value === 'true')}
            >
              {yesNoOptions.map((item) => (
                <option key={item.code} value={item.code}>{item.description}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Cost Center <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.shortcutDimension1Code}
              onChange={(e) => onFormChange('shortcutDimension1Code', e.target.value)}
            >
              <option value="">-- Select Cost Center --</option>
              {dimensions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

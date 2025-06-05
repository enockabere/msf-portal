"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useMySetups } from "@/app/context/SetupContext";
import { TravelRequest } from "@/app/types/travel";
import { getResource } from "@/app/lib/api/http";
import FormSelect from "@/app/components/inputs/FormSelect";
import FormInput from "@/app/components/inputs/FormInput";

// Constants moved outside the component
const TRAVEL_TYPES = [
  { code: "Local", description: "Local" },
  { code: "International", description: "International" },
  { code: "Regional", description: "Regional" },
];

interface Props {
  formData: TravelRequest;
  requiredFields: Array<string>;
  isReadOnly: boolean;
  onFormChange: (field: keyof TravelRequest, value: any) => void;
}

const CabDetails = ({ travelRequest }: { travelRequest: TravelRequest }) => (
  <div className="card bg-light-subtle border mt-2">
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
);

export default function TravelHeaderForm({ formData, requiredFields, isReadOnly, onFormChange }: Props) {
  const {
    purposeOfTravel,
    modesOfTransport,
    dimensions,
    countries,
    fetchSetups,
  } = useMySetups();

  const [originCities, setOriginCities] = useState([]);

  const fetchCities = useCallback(async (countryCode: string) => {
    try {
      if (!countryCode) {
        setOriginCities([]);
        return;
      }

      const res = await getResource('cities', {
        params: {
          filters: {
            countryRegionCode: countryCode,
          }
        }
      });

      if (res.error) {
        console.error('Error fetching cities:', res.error);
        return;
      }

      setOriginCities([...res.value]);
    } catch (error: any) {
      console.error('Error fetching cities:', error.message);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      await fetchSetups([
        'purposeOfTravel',
        'modesOfTransport',
        'countries',
        'perDiemAllotments',
        {
          dimensions: {
            $filter: `dimensionCode eq 'OC' or dimensionCode eq 'DEPARTMENTS'`,
          },
        },
        {
          missionTypes: {
            filters: { inActive: false }
          }
        }
      ]);

      if (formData.originCountryCode) {
        await fetchCities(formData.originCountryCode);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    }
  }, [fetchCities, fetchSetups, formData.originCountryCode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCountryChange = useCallback(async (value: string) => {
    onFormChange('originCountryCode', value);
    onFormChange('originCity', '')
    await fetchCities(value);
  }, [fetchCities, onFormChange]);

  const handleTimeChange = useCallback((value: string) => {
    onFormChange('estimatedTimeOfArrival', `${value}:00`);
  }, [onFormChange]);

  const showCabDetails = formData.pickupLocation || formData.dropOffLocation;

  return (
    <>
      <div className="border rounded p-3 bg-light-subtle mt-3">
        <h6 className="text-dark fw-bold">General information</h6>
        <div className="row g-3">
          {requiredFields.includes('originCountryCode') && (
            <div className="col-md-4">
              <FormSelect
                label="Origin Country"
                value={formData.originCountryCode}
                onChange={handleCountryChange}
                options={countries.map(item => ({ code: item.code, description: item.name }))}
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('originCity') && (
            <div className="col-md-4">
              <FormSelect
                label="Origin City"
                value={formData.originCity}
                onChange={(value) => onFormChange('originCity', value)}
                options={originCities.map(city => ({ code: city.city, description: city.city }))}
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('TypeOfTravel') && (
            <div className="col-md-4">
              <FormSelect
                label="Type of Travel"
                value={formData.TypeOfTravel}
                onChange={(value) => onFormChange("TypeOfTravel", value)}
                options={TRAVEL_TYPES}
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('modeOfTransport') && (
            <div className="col-md-4">
              <FormSelect
                label="Mode of Transport"
                value={formData.modeOfTransport}
                onChange={(value) => onFormChange("modeOfTransport", value)}
                options={modesOfTransport.map(item => ({ code: item.code, description: item.description }))}
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('purposeOfTravel') && !formData.annualTrip && (
            <div className="col-md-4">
              <FormSelect
                label="Purpose of Travel"
                value={formData.purposeOfTravel}
                onChange={(value) => onFormChange('purposeOfTravel', value)}
                options={purposeOfTravel.map(item => ({ code: item.code, description: item.description }))}
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('annualTrip') && formData.citizenNonCitizen === 'Non-Citizen' && (
            <div className="col-md-4">
              <label className="form-label d-block">
                Annual Trip <span className="text-danger">*</span>
              </label>
              <div className="form-check form-switch">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="annualTripSwitch"
                    checked={formData.annualTrip}
                    onChange={(e) => {
                      const isAnnual = e.target.checked;
                      onFormChange('annualTrip', isAnnual);
                      if (isAnnual) {
                        onFormChange('purposeOfTravel', '');
                      }
                    }}
                    disabled={isReadOnly}
                  />

                <label className="form-check-label" htmlFor="annualTripSwitch">
                  {formData.annualTrip ? 'Yes' : 'No'}
                </label>
              </div>
            </div>
          )}


          {requiredFields.includes('passportNo') && (
            <div className="col-md-4">
              <FormInput
                label="ID/Passport Number"
                value={formData.passportNo}
                onChange={(value) => onFormChange("passportNo", value)}
                placeholder="Enter ID or Passport number"
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('departureDate') && (
            <div className="col-md-4">
              <FormInput
                label="Departure Date"
                value={formData.departureDate}
                onChange={(value) => onFormChange('departureDate', value)}
                type="date"
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('arrivalDate') && (
            <div className="col-md-4">
              <FormInput
                label="Arrival Date"
                value={formData.arrivalDate}
                onChange={(value) => onFormChange('arrivalDate', value)}
                type="date"
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('estimatedTimeOfArrival') && (
            <div className="col-md-4">
              <FormInput
                label="Expected Time of Arrival"
                value={formData.estimatedTimeOfArrival?.split(':').slice(0, 2).join(':')}
                onChange={handleTimeChange}
                type="time"
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('returnDate') && (
            <div className="col-md-4">
              <FormInput
                label="Return Date"
                value={formData.returnDate}
                onChange={(value) => onFormChange('returnDate', value)}
                type="date"
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('shortcutDimension1Code') && (
            <div className="col-md-4">
              <FormSelect
                label="Cost Center"
                value={formData.shortcutDimension1Code}
                onChange={(value) => onFormChange('shortcutDimension1Code', value)}
                options={dimensions.filter(d => d.dimensionCode === "OC").map(d => ({ code: d.code, description: d.name }))}
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('shortcutDimension2Code') && (
            <div className="col-md-4">
              <FormSelect
                label="Department"
                value={formData.shortcutDimension2Code}
                onChange={(value) => onFormChange('shortcutDimension2Code', value)}
                options={dimensions.filter(d => d.dimensionCode === "DEPARTMENTS").map(d => ({ code: d.code, description: d.name }))}
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>
          )}

          {requiredFields.includes('budgetCode') && (
            <div className="col-md-4">
              <FormInput
                label="Budget Code"
                value={formData.budgetCode}
                onChange={(value) => onFormChange("budgetCode", value)}
                placeholder="Enter Budget Code"
                disabled={isReadOnly}
              />
            </div>
          )}
        </div>
      </div>

      {showCabDetails && <CabDetails travelRequest={formData} />}
    </>
  );
}
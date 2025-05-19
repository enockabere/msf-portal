"use client";

import React from "react";
import { Phone, MapPin, Flag, IdCard } from "lucide-react";
import VisitorProfileFormField from "./VisitorProfileFormField";

interface Option {
  value: string;
  label: string;
}

interface ProfileFormStepTwoProps {
  formData: {
    passportIDNo: string;
    countryRegionCode: string;
    city: string;
    phone: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  filteredCityOptions: Option[];
  countryOptions: Option[];
}

export default function ProfileFormStepTwo({
  formData,
  onChange,
  filteredCityOptions,
  countryOptions,
}: ProfileFormStepTwoProps) {
  return (
    <div className="row row-cols-1 row-cols-md-3 gx-4">
      <VisitorProfileFormField
        label="Passport/ID No"
        name="passportIDNo"
        value={formData.passportIDNo}
        onChange={onChange}
        disabled={false}
        icon={IdCard}
      />
      <VisitorProfileFormField
        label="Country/Region"
        name="countryRegionCode"
        value={formData.countryRegionCode}
        onChange={onChange}
        disabled={false}
        type="select"
        icon={Flag}
        options={countryOptions}
      />
      <VisitorProfileFormField
        label="City"
        name="city"
        value={formData.city}
        onChange={onChange}
        disabled={!formData.countryRegionCode}
        type="select"
        icon={MapPin}
        options={filteredCityOptions}
      />
      <VisitorProfileFormField
        label="Phone"
        name="phone"
        value={formData.phone}
        onChange={onChange}
        disabled={false}
        type="tel"
        icon={Phone}
        options={undefined}
      />
    </div>
  );
}

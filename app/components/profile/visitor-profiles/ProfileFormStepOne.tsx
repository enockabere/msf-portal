"use client";

import { User, Cake } from "lucide-react";
import VisitorProfileFormField from "./VisitorProfileFormField";

interface Option {
  value: string;
  label: string;
}

interface StepOneProps {
  formData: Record<string, any>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  titleOptions: Option[];
  genderOptions: Option[];
}

export default function ProfileFormStepOne({
  formData,
  onChange,
  titleOptions,
  genderOptions,
}: StepOneProps) {
  return (
    <div className="row row-cols-1 row-cols-md-3 gx-4">
      <VisitorProfileFormField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={onChange}
        disabled={false}
        icon={User}
      />
      <VisitorProfileFormField
        label="Middle Name"
        name="middleName"
        value={formData.middleName}
        onChange={onChange}
        disabled={false}
        icon={User}
      />
      <VisitorProfileFormField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={onChange}
        disabled={false}
        icon={User}
      />
      <VisitorProfileFormField
        label="Date of Birth"
        name="dateOfBirth"
        value={formData.dateOfBirth}
        onChange={onChange}
        disabled={false}
        type="date"
        icon={Cake}
      />
      <VisitorProfileFormField
        label="Title"
        name="title"
        value={formData.title}
        onChange={onChange}
        disabled={false}
        type="select"
        icon={User}
        options={titleOptions}
      />
      <VisitorProfileFormField
        label="Gender"
        name="gender"
        value={formData.gender}
        onChange={onChange}
        disabled={false}
        type="select"
        icon={User}
        options={genderOptions}
      />
    </div>
  );
}

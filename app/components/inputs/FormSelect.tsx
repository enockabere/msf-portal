import React from "react";

const FormSelect = ({
                      label,
                      value,
                      onChange,
                      options,
                      required,
                      disabled,
                      placeholder = "-- Select --",
                      showAsterisk = false
                    }: {
  label: string;
  value: any;
  onChange: (value: any) => void;
  options: Array<{ code: string; description: string }>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showAsterisk?: boolean;
}) => (
  <div className="col-md-4">
    <label className="form-label">
      {label} {showAsterisk && <span className="text-danger">*</span>}
    </label>
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((item) => (
        <option key={item.code} value={item.code}>
          {item.description}
        </option>
      ))}
    </select>
  </div>
);

export default FormSelect;
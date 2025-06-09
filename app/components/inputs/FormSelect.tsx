import React from "react";

const FormSelect = ({
                      label,
                      id,
                      value,
                      onChange,
                      options,
                      required,
                      disabled,
                      placeholder = "-- Select --",
                    }: {
  label?: string;
  id?: string;
  value: any;
  onChange: (value: any) => void;
  options: Array<{ code: string; description: string }>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) => (
  <div className="form-group">
    {label && (
      <label className="form-label" htmlFor={id || label}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
    )}
    <select
      className="form-select"
      id={id || ""}
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
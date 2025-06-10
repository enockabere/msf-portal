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
                      styles,
                    }: {
  label?: string;
  id?: string;
  value: any;
  onChange: (value: any) => void;
  options: Array<{ code: string; description: string }>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  styles?: string
}) => (
  <div className={`form-group ${styles || ''}`}>
    {label && (
      <label className="form-label" htmlFor={id || 'select'}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
    )}
    <select
      className="form-select"
      id={id || "select"}
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
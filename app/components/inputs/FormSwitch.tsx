import React from "react";

const FormSwitch = ({
                      label,
                      id,
                      value,
                      onChange,
                      required,
                      disabled
                    }: {
  label: string;
  id: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  disabled?: boolean;
}) => (
  <div className="form-group form-check form-switch">
    <input
      className="form-check-input"
      type="checkbox"
      id={id}
      role="switch"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      required={required}
      disabled={disabled}
    />
    <label
      className="form-check-label"
      htmlFor={id}>
      {label} {required && <span className="text-danger">*</span>}
    </label>
  </div>
);

export default FormSwitch;
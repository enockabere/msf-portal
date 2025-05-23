import React from "react";

const FormInput = ({
                     label,
                     value,
                     onChange,
                     type = "text",
                     placeholder = "",
                     required,
                     disabled,
                     showAsterisk = false
                   }: {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showAsterisk?: boolean;
}) => (
  <div className="col-md-4">
    <label className="form-label">
      {label} {showAsterisk && <span className="text-danger">*</span>}
    </label>
    <input
      type={type}
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
    />
  </div>
);

export default FormInput;
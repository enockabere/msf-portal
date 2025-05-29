import React from "react";

const FormInput = ({
                     label,
                     id,
                     value,
                     onChange,
                     type = "text",
                     placeholder = "",
                     required,
                     disabled,
                     showAsterisk = false
                   }: {
  label: string;
  id: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showAsterisk?: boolean;
}) => (
  <>
    <label className="form-label">
      {label} {showAsterisk && <span className="text-danger">*</span>}
    </label>
    <input
      type={type}
      className="form-control"
      id={id || label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
    />
  </>
);

export default FormInput;
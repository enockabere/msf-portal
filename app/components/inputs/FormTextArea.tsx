import React, { useState } from "react";

const FormInput = ({
                     label,
                     id,
                     value,
                     onChange,
                     type = "text",
                     placeholder = "",
                     required,
                     disabled,
                   }: {
  label: string;
  id?: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Show placeholder only for date inputs when empty and not focused
  const showDatePlaceholder = type === "date" && !value && !isFocused;

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          className="form-control"
          id={id || label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={type === "date" ? undefined : placeholder} // Don't use placeholder for date inputs
          required={required}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            position: "relative",
            zIndex: 1,
            color: showDatePlaceholder ? "transparent" : "inherit",
          }}
        />
        {showDatePlaceholder && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "12px",
              transform: "translateY(-50%)",
              zIndex: 1,
              color: "#6c757d",
              pointerEvents: "none",
            }}
          >
            {placeholder || "Select a date"}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInput;
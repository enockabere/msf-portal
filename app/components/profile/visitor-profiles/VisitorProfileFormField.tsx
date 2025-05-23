"use client";

import React from "react";

interface VisitorProfileFormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  disabled: boolean;
  type?: string;
  icon?: React.ElementType;
  options?: { value: string; label: string }[];
}

export default function VisitorProfileFormField({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  icon: Icon,
  options,
}: VisitorProfileFormFieldProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-medium">
        {label}
      </label>
      <div className="input-group">
        {Icon && (
          <span className="input-group-text bg-white border-end-0">
            <Icon size={16} className="text-muted" />
          </span>
        )}
        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="form-select"
          >
            <option value="">{`Select ${label}`}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="form-control"
            placeholder={label}
          />
        )}
      </div>
    </div>
  );
}

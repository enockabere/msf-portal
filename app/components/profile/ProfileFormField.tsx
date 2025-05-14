// components/ProfileFormField.tsx
import { LucideIcon } from "lucide-react";

interface ProfileFormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  type?: string;
  icon?: LucideIcon;
  options?: { value: string; label: string }[];
}

export const ProfileFormField = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
  type = "text",
  icon: Icon,
  options,
}: ProfileFormFieldProps) => (
  <div className="relative">
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={14}
        />
      )}
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-8' : 'pl-2'} pr-2 py-1.5 border rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm ${
            disabled ? "bg-gray-50" : "bg-white"
          }`}
        >
          <option value="">Select</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-8' : 'pl-2'} pr-2 py-1.5 border rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm ${
            disabled ? "bg-gray-50" : "bg-white"
          }`}
        />
      )}
    </div>
  </div>
);
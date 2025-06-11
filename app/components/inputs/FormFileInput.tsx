import React, { useCallback, useRef } from "react";
import { XCircle } from "lucide-react";

interface FileData {
  base64?: string;
  fileName: string;
  fileType?: string;
  size?: number;
}

interface Props {
  label?: React.ReactNode;
  id?: string;
  value: FileData[];
  accept?: string;
  onChange: (files: FileData[]) => void;
  onView?: (file: FileData) => void;
  onRemove?: (file: FileData) => void;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  styles?: string;
  maxFiles?: number;
  preview?: boolean;
}

const FormFileInput = ({
                     label,
                     id,
                     value = [],
                     accept = 'image/*,.pdf',
                     onChange,
                     onView,
                     onRemove,
                     multiple = false,
                     required,
                     disabled,
                     styles,
                     maxFiles = 5,
                     preview = false
                   }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      onChange([]);
      return;
    }

    // Enforce max files limit
    if (maxFiles && files.length > maxFiles) {
      alert(`You can upload a maximum of ${maxFiles} files`);
      return;
    }

    try {
      const filePromises = files.map(async (file) => {
        const base64String = await convertToBase64(file);
        const base64 = base64String.split(",")[1];
        return {
          base64,
          fileName: file.name,
          fileType: file.type,
          size: file.size
        };
      });

      const newFiles = await Promise.all(filePromises);

      if (multiple) {
        onChange([...value, ...newFiles]);
      } else {
        onChange(newFiles);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      onChange([]);
    }
  }, [onChange, multiple, value, maxFiles]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeFile = (index: number, file: FileData) => {
    const updatedFiles = [...value];
    updatedFiles.splice(index, 1);
    onChange(updatedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (onRemove) {
      onRemove(file);
    }
  };

  return (
    <div className={`form-group ${styles || ''}`}>
      {label && (
        <label className="form-label" htmlFor={id || "file"}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <input
        type="file"
        id={id || "file"}
        className="form-control"
        accept={accept}
        onChange={handleFileChange}
        required={required && value.length === 0}
        disabled={disabled}
        multiple={multiple}
        ref={fileInputRef}
      />

      {/* File previews */}
      {preview && (
        <div className="d-flex flex-wrap mt-1 gap-1">
          {value.map((file, index) => (
            <div key={index} className="btn-group">
              <button
                type="button"
                onClick={() => onView && onView(file)}
                className="btn btn-outline-danger btn-sm"
                title="Download attachment"
              >
                {file.fileName}
              </button>
              <button
                type="button"
                onClick={() => removeFile(index, file)}
                className="btn btn-danger dropdown-toggle dropdown-toggle-split"
                title="Delete attachment"
              >
                <XCircle size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormFileInput;
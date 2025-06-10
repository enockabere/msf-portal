import React, { useCallback } from "react";

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
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  styles?: string;
  maxFiles?: number;
}

const FormFileInput = ({
                     label,
                     id,
                     value = [],
                     accept = 'image/*,.pdf',
                     onChange,
                     multiple = false,
                     required,
                     disabled,
                     styles,
                     maxFiles = 5
                   }: Props) => {
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
        const base64 = await convertToBase64(file);
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

  const removeFile = (index: number) => {
    const updatedFiles = [...value];
    updatedFiles.splice(index, 1);
    onChange(updatedFiles);
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
      />

      {maxFiles && multiple && (
        <small className="text-muted d-block mt-1">
          Max {maxFiles} files allowed
        </small>
      )}

      {/* File previews */}
      <div className="file-previews mt-3">
        {value.map((file, index) => (
          <div key={index} className="file-preview mb-2 p-2 border rounded">
            <div className="d-flex justify-content-between align-items-center">
              <div className="file-info">
                <span className="filename">{file.fileName}</span>
                <small className="file-size text-muted d-block">
                  {(file.size ? file.size / 1024 : 0).toFixed(2)} KB
                </small>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => removeFile(index)}
              >
                ×
              </button>
            </div>

            {file.base64.startsWith('data:image/') && (
              <div className="image-preview mt-2">
                <img
                  src={file.base64}
                  alt={`Preview ${index}`}
                  className="img-thumbnail"
                  style={{maxWidth: '150px', maxHeight: '150px'}}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormFileInput;
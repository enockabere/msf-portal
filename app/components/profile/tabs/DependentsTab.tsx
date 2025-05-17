"use client";

import { useState } from "react";

interface Dependent {
  name: string;
  relationship: string;
  nationality: string;
}

export default function DependentsTab() {
  const [dependents, setDependents] = useState<Dependent[]>([]);

  const handleInputChange = (
    index: number,
    field: keyof Dependent,
    value: string
  ) => {
    const updated = [...dependents];
    updated[index][field] = value;
    setDependents(updated);
  };

  const addDependent = () => {
    setDependents([
      ...dependents,
      { name: "", relationship: "", nationality: "" },
    ]);
  };

  const removeDependent = (index: number) => {
    const updated = dependents.filter((_, i) => i !== index);
    setDependents(updated);
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="card-title mb-0">Dependents</h4>
        <button className="btn btn-sm btn-primary" onClick={addDependent}>
          + Add Dependent
        </button>
      </div>
      <div className="card-body pt-2">
        {dependents.length === 0 ? (
          <p className="text-muted">No dependents added yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "30%" }}>Name</th>
                  <th style={{ width: "30%" }}>Relationship</th>
                  <th style={{ width: "30%" }}>Nationality</th>
                  <th style={{ width: "10%" }}></th>
                </tr>
              </thead>
              <tbody>
                {dependents.map((dependent, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={dependent.name}
                        onChange={(e) =>
                          handleInputChange(index, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={dependent.relationship}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "relationship",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={dependent.nationality}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "nationality",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeDependent(index)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

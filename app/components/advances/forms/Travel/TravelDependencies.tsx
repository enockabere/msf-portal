"use client";

import React, { useState } from "react";
import { XCircle, Plus } from "lucide-react";

interface Dependency {
  id: string;
  fullName: string;
  relationship: string;
  nationality: string;
}

interface TravelDependenciesProps {
  availableDependencies: Dependency[];
}

export default function TravelDependencies({
  availableDependencies,
}: TravelDependenciesProps) {
  const [selectedDependencies, setSelectedDependencies] = useState<
    Dependency[]
  >([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const handleAddDependency = () => {
    const found = availableDependencies.find((d) => d.id === selectedId);
    if (found && !selectedDependencies.find((s) => s.id === found.id)) {
      setSelectedDependencies([...selectedDependencies, found]);
      setSelectedId(""); // reset dropdown
    }
  };

  const handleRemove = (id: string) => {
    setSelectedDependencies((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        {/* Dropdown for selection */}
        <div className="row mb-3">
          <div className="col-md-8">
            <select
              className="form-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Select a Dependant</option>
              {availableDependencies.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <button
              className="btn btn-danger w-100"
              onClick={handleAddDependency}
              disabled={!selectedId}
            >
              <Plus size={16} className="me-1" />
              Add Dependant
            </button>
          </div>
        </div>

        {/* Table of selected dependencies */}
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Relationship</th>
              <th>Nationality</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedDependencies.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No dependants added yet.
                </td>
              </tr>
            ) : (
              selectedDependencies.map((dep, idx) => (
                <tr key={dep.id}>
                  <td>{idx + 1}</td>
                  <td>{dep.fullName}</td>
                  <td>{dep.relationship}</td>
                  <td>{dep.nationality}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemove(dep.id)}
                    >
                      <XCircle size={16} className="me-1" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

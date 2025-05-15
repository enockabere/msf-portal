"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Dependency } from "@/app/types/global";

interface TravelDependenciesProps {
  availableDependencies: Dependency[];
  selectedDependencies: string[]; // list of selected dependency IDs
  onSelectDependency: (id: string) => void;
  onDeselectDependency: (id: string) => void;
}

export default function TravelDependencies({
  availableDependencies,
  selectedDependencies,
  onSelectDependency,
  onDeselectDependency,
}: TravelDependenciesProps) {
  const toggleDependency = (id: string) => {
    if (selectedDependencies.includes(id)) {
      onDeselectDependency(id);
    } else {
      onSelectDependency(id);
    }
  };
  return (
    <div className="card mb-4">
      <div className="card-body">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Relationship</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {availableDependencies.map((dep, idx) => (
              <tr key={dep.id}>
                <td>{idx + 1}</td>
                <td>{dep.name}</td>
                <td>{dep.relation}</td>
                <td className="text-center">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      selectedDependencies.includes(dep.id)
                        ? "btn-success"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => toggleDependency(dep.id)}
                  >
                    <CheckCircle2 size={16} className="me-1" />
                    {selectedDependencies.includes(dep.id)
                      ? "Selected"
                      : "Select"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

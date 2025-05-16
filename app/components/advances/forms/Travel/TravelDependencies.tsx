"use client";

import React, { useEffect, useState } from "react";
import { Dependency } from "@/app/types/global";
import Select from "react-select";
import Swal from "sweetalert2";
import { batchRequest, deleteResource } from "@/app/lib/api/http";
import _ from 'lodash';
import { TravelRequest } from "@/app/types/travel";
import { useSession } from "next-auth/react";
interface TravelDependenciesProps {
  availableDependencies: Dependency[];
  existingTravelDependencies: Dependency[];
  formData:TravelRequest;
  refetchTravelDependencies: () => Promise<void>;
}

export default function TravelDependencies({
  availableDependencies,
  existingTravelDependencies,
  refetchTravelDependencies,
  formData,
  
}: TravelDependenciesProps) {
  const [selectedDependencies, setSelectedDependencies] = useState<Dependency[]>(
    []
  );
  const [filteredAvailableDependants, setFilteredAvailableDependants] = useState<Dependency[]>(
    []
  );
  const [postSelectedDependencies, setPostSelectedDependencies] = useState<{ data: TravelRequest}[]>([]);
  const { data } = useSession();

const handleSelect = (selectedOptions: any) => {
  if (!selectedOptions) return;

  const [profileNo, lineNo] = selectedOptions?.[0]?.value.split("-");
  const dependant = availableDependencies.find(
      (dep) =>
        dep.profileNo === profileNo && dep.lineNo.toString() === lineNo
    );

    const alreadyExists = [...existingTravelDependencies, ...selectedDependencies].some(
    (dep) =>
      dep.profileNo === dependant?.profileNo &&
      dep.lineNo === dependant?.lineNo
  );
  if (alreadyExists) {
    Swal.fire("Dependant already added", "", "info");
    return;
  }
    const dependantPayload = {
      documentType: formData.documentType,
      documentNo: formData.no,
      travellerType:"Dependant",
      travellerNo: formData.travellerNo,
      dependantNo: dependant.lineNo,
      travellerName: dependant.name,
    }
    setSelectedDependencies((prev: Dependency[]) =>[...prev, dependant]);
    setPostSelectedDependencies((prev) => {
      return [
        ...prev,
        {
        method: 'POST',
        endpoint: 'travellers',
        data: dependantPayload,
      }
      ]
    });
};

const handleDelete = async (dep: TravelRequest) => {
  const isExisting = existingTravelDependencies.some(
    (d) => d.profileNo === dep.profileNo && d.lineNo === dep.lineNo
  );

  if (isExisting) {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the dependency.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteResource('travellers', {
          data: {
            documentType: dep.documentType,
            documentNo: dep.documentNo,
            lineNo:dep.lineNo
          },
          primaryKey: ['documentType', 'documentNo', 'lineNo']
        });

        Swal.fire("Deleted!", "The dependency has been removed.", "success");

          await refetchTravelDependencies();
        
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("Failed", "Unable to delete dependency", "error");
      }
    }
  } else {
    // Just deselect if it's a newly added (unsaved) dependency
    setSelectedDependencies((prev) =>
      prev.filter(
        (d) =>
          !(d.profileNo === dep.profileNo && d.lineNo === dep.lineNo)
      )
    );
    setPostSelectedDependencies((prev) =>
      prev.filter(
        (item) => item.data.profileNo !== dep.profileNo
      )
    );
  }
};


const handleSaveDependencies = async () => {
  if (postSelectedDependencies.length === 0) {
    Swal.fire("No new dependencies to save", "", "info");
    return;
  }

  try {
    const res = await batchRequest({
      batch: postSelectedDependencies,
    });

    if (res.error) {
      console.error("Save Dependants Error:", res.error.message);
    }

    Swal.fire("Dependencies saved successfully", "", "success");

    // Optionally clear postSelectedDependencies after save
    setPostSelectedDependencies([]);
    //fetchDependencies(data.user.profile.no);
  } catch (error) {
    console.error("Save failed:", error);
    Swal.fire("Failed to save dependencies", "Please try again", "error");
  }
};

const allTableDependencies = [
  ...existingTravelDependencies,
  ...selectedDependencies,
].map(item => {
  if ('name' in item && !('travellerName' in item)) {
    const { name, ...rest } = item;
    return { ...rest, travellerName: name };
  }
  return item;
});

console.log('checkAllTbles', allTableDependencies);
useEffect(() => {
    setFilteredAvailableDependants(()=> {
    return _.difference(availableDependencies, selectedDependencies);
  })
}, [availableDependencies, selectedDependencies])
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="mb-4">
          <Select
            isMulti
            options={filteredAvailableDependants.map((dep) => ({
              value: `${dep.profileNo}-${dep.lineNo}`,
              label: dep.name,
            }))}
            onChange={handleSelect}
            value={[]}
            placeholder="Select dependencies to add"
          />
        </div>

        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {allTableDependencies.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No dependants added yet. Use the dropdown above to add.
                </td>
              </tr>
            ) : (
              allTableDependencies.map((dep, idx) => (
                <tr key={`${dep.profileNo}-${dep.lineNo}`}>
                  <td>{idx + 1}</td>
                  <td>{dep.travellerName}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(dep)}
                    >
                      {
                        existingTravelDependencies.some(
                          (d) =>
                            d.profileNo === dep.profileNo &&
                            d.lineNo === dep.lineNo
                        )
                          ? "Delete" 
                          : "Diselect"
                      }
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {selectedDependencies.length > 0 && (
          <div className="text-end mt-3">
            <button
            className="btn btn-primary"
            onClick={handleSaveDependencies}
            >Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

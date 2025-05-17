"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { TravelRequest } from "@/app/types/travel";
import { createResource, deleteResource, getResource } from "@/app/lib/api/http";
import { Loader, Trash2 } from "lucide-react";
interface TravelDependenciesProps {
  travelRequestHeader:TravelRequest;
  onSubmit: (requestNo: string) => void;
}

export default function TravelDependencies({
  travelRequestHeader,
  onSubmit,
}: TravelDependenciesProps) {
  const [dependants, setDependants] = useState([])

  useEffect(() => {
    const fetchDependants = async () => {
      try {
        const res = await getResource('profileDependants', {
          params: {
            filters: {
              profileNo: travelRequestHeader.travellerNo
            }
          }});

        if (res.error) {
          return Swal.fire({title: 'Error fetching profile dependants!', text: res.error.message});
        }

        setDependants(res.value)
      } catch (error: any) {
        console.log('Error fetching dependants', error.message)
      }
    }

    fetchDependants()
  }, [travelRequestHeader.travellerNo]);

  const travellers = useMemo(() =>
    travelRequestHeader.travellers.filter(
      (traveller: Record<string, any>) => traveller.travellerType !== 'Self'
    ), [travelRequestHeader.travellers]
  );

  const travellerDependantNos = useMemo(
    () => travellers.map((traveller: Record<string, any>) => traveller.dependantNo),
    [travellers]
  );

  const selectableDependants = useMemo(
    () => dependants.filter(dependant =>
      !travellerDependantNos.includes(dependant.lineNo)
    ),
    [dependants, travellerDependantNos]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dependantNoBeingDeleted, setDependantNoBeingDeleted] = useState(null);

const handleSelect = async (dependant: Record<string, any>) => {
  try {
    setIsSubmitting(true)
    const res = await createResource('travellers', {
      data: {
        documentType: travelRequestHeader.documentType,
        documentNo: travelRequestHeader.no,
        travellerType: 'Dependant',
        travellerNo: travelRequestHeader.travellerNo,
        dependantNo: dependant.value,
        travellerName: dependant.label,
      }
    })
    if (res.error) {
      setIsSubmitting(false)
      return Swal.fire({title: 'Error saving traveller!', text: res.error.message});
    }

    onSubmit(travelRequestHeader.no);
    setIsSubmitting(false)
  } catch (error: any) {
    console.log('Error saving traveller', error.message)
    setIsSubmitting(false)
  }
};

const handleDelete = async (traveller: Record<string, any>) => {
  try {
    setDependantNoBeingDeleted(traveller.dependantNo)
    const res = await deleteResource('travellers', {
      data: traveller,
      primaryKey: ['documentType', 'documentNo', 'lineNo']
    })
    if (res.error) {
      setDependantNoBeingDeleted(null)
      return Swal.fire({title: 'Error deleting traveller!', text: res.error.message});
    }

    onSubmit(travelRequestHeader.no);
    setDependantNoBeingDeleted(null)
  } catch (error: any) {
    setDependantNoBeingDeleted(null)
    console.log('Error deleting traveller', error.message)
  }
};

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="mb-4">
          <Select
            options={selectableDependants.map((item) => ({
              value: item.lineNo,
              label: item.name,
            }))}
            value={null}
            isLoading={isSubmitting}
            onChange={handleSelect}
            placeholder="Select the dependant you plan to travel with"
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
            {travellers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No dependants added yet as travellers. Use the dropdown above to add.
                </td>
              </tr>
            ) : (
              travellers.map((dep, idx) => (
                <tr key={`${dep.profileNo}-${dep.lineNo}`}>
                  <td>{idx + 1}</td>
                  <td>{dep.travellerName}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(dep)}
                    >
                      {dependantNoBeingDeleted === dep.dependantNo
                        ? <Loader size={16} className="button-icon blink-animation"/>
                        : <Trash2 size={16} className="button-icon"/>}
                      Drop
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

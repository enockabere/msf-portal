"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { TravelRequest } from "@/app/types/travel";
import { createResource, deleteResource, getResource } from "@/app/lib/api/http";
import { Trash2 } from "lucide-react";
import { usePageLoader } from "@/app/context/PageLoaderContext";
interface TravelDependenciesProps {
  travelRequestHeader: TravelRequest;
  isReadOnly: boolean;
  onSubmit: (requestNo: string) => void;
}

export default function TravellersForm({
  travelRequestHeader,
  isReadOnly,
  onSubmit,
}: TravelDependenciesProps) {
  const [travellers, setTravellers] = useState([]);
  const { actions } = usePageLoader();
  const { dispatcher } = actions;

  useEffect(() => {
    const fetchDependants = async () => {
      try {
        const res = await getResource('profileDependants', {
          params: {
            filters: {
              profileNo: travelRequestHeader.travellerNo
            }
          }
        });

        if (res.error) {
          return Swal.fire({ title: 'Error fetching profile travellers!', text: res.error.message });
        }

        setTravellers(res.value)
      } catch (error: any) {
        console.log('Error fetching travellers', error.message)
      }
    }

    fetchDependants()
  }, [travelRequestHeader.travellerNo]);

  const dependantTravellers = useMemo(() =>
    travelRequestHeader.travellers.filter(
      (traveller: Record<string, any>) => traveller.travellerType !== 'Self'
    ), [travelRequestHeader.travellers]
  );

  const travellerDependantNos = useMemo(
    () => dependantTravellers.map((traveller: Record<string, any>) => traveller.dependantNo),
    [dependantTravellers]
  );

  const selectableTravellers = useMemo(
    () => travellers.filter(traveller =>
      !travellerDependantNos.includes(traveller.lineNo)
    ),
    [travellers, travellerDependantNos]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

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
        return Swal.fire({ title: 'Error saving traveller!', text: res.error.message });
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
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: 'Deleting...',
        }
      });
      const res = await deleteResource('travellers', {
        data: traveller,
        primaryKey: ['documentType', 'documentNo', 'lineNo']
      })
      if (res.error) {
        dispatcher({
          type: 'PATCH_LOADING_STATE',
          payload: {
            loading: false,
            message: '',
          }
        });
        return Swal.fire({ title: 'Error deleting traveller!', text: res.error.message });
      }

      onSubmit(travelRequestHeader.no);
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
    } catch (error: any) {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
      console.log('Error deleting traveller', error.message)
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        {!isReadOnly && (
          <div className="mb-4">
            <Select
              options={selectableTravellers.map((item) => ({
                value: item.lineNo,
                label: item.name,
              }))}
              value={null}
              isLoading={isSubmitting}
              onChange={handleSelect}
              placeholder="Select the person you plan to travel with"
            />
          </div>
        )}

        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              {!isReadOnly && (
                <th className="text-center">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {dependantTravellers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Do you have someone you want to travel with? Use the dropdown above to add them.
                </td>
              </tr>
            ) : (
              dependantTravellers.map((dep, idx) => (
                <tr key={`${dep.profileNo}-${dep.lineNo}`}>
                  <td>{idx + 1}</td>
                  <td>{dep.travellerName}</td>
                  {!isReadOnly && (
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(dep)}
                      >
                        <Trash2 size={16} className="button-icon" />
                        Drop
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

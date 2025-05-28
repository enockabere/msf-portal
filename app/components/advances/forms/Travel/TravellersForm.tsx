"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { TravelRequest } from "@/app/types/travel";
import { createResource, deleteResource, getResource } from "@/app/lib/api/http";
import { Trash2 } from "lucide-react";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import {Plus, User} from "lucide-react";
import CustomModal from "@/app/components/modals/CustomModal";
import NonDependantForm from "@/app/components/advances/forms/Travel/NonDependantForm";
  interface NonDependant {
  travellerName: string;
  countryOfOrigin: string;
  dob?: string;
}
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
     fetchTravellers();
  }, [travelRequestHeader.travellerNo]);

  const fetchTravellers = async () => {
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
  const [showModal, setShowModal] = useState(false);
  const [newNonDependant, setNewNonDependant] = useState<NonDependant>({
    travellerName: "",
    countryOfOrigin: "",
    dob: "",
  });
   const [isSaving, setIsSaving] = useState(false);

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

   const handleSaveNonDependant = async () => {
    try {
      setIsSubmitting(true)
      const res = await createResource('travellers', {
        data: {
        ...newNonDependant,
        documentType: travelRequestHeader.documentType,
        documentNo: travelRequestHeader.no,
        travellerType: 'Other',
        travellerNo: travelRequestHeader.travellerNo,

        }
      })
      if(res.error){
        setIsSubmitting(false);
        return Swal.fire({title: "Error saving non-dependant traveller!", text: res.error.message})
      }
        setShowModal(false);
        setNewNonDependant({
          travellerName: "",
          countryOfOrigin: "",
          dob: "",
        });
        onSubmit(travelRequestHeader.no);
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      Swal.fire("Error", error?.message || "Something went wrong", "error");
    }finally{
      setIsSaving(false);
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
        throw new Error(res.error.message);
      }

      onSubmit(travelRequestHeader.no);
    } catch (error: any) {
      console.log('Error deleting traveller', error.message)
    } finally {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
    }
  };

  const handleNewFieldChange = (field: keyof NonDependant, value: string) => {
    setNewNonDependant({ ...newNonDependant, [field]: value });
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        {!isReadOnly && (
          <div className="mb-4 d-flex justify-content-between align-items-center gap-3">
            <div className="flex-grow-1">
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
          <button
            type="button"
            className="btn bg-danger text-white btn-md"
            onClick={() => {
              setShowModal(true)
            }}
          >
            <Plus size={16} />
            Add Non-dependant Travellers
          </button>
          </div>
        )}

        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Status Of Travel</th>
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
                  <td>{dep.exemptFromTravelling? 'Exempted from Travelling' : 'Allowed to Travel'}</td>
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
      <CustomModal
      show={showModal}
      onClose={() => setShowModal(false)}
      title="Add Non-Dependant"
      size="lg"
      titleIcon={<User size={18} className="text-white" />}
      >
        <NonDependantForm
          form={newNonDependant}
          onChange={handleNewFieldChange}
          onSave={handleSaveNonDependant}
          onCancel={() => setShowModal(false)}
          loading={isSaving}
        >
        </NonDependantForm>
      </CustomModal>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { TravelRequest } from "../../../../types/travel";
import { createResource, deleteResource, getResource } from "../../../../lib/api/http";
import { Save, Trash2, XCircle, Plus } from "lucide-react";
import { usePageLoader } from "../../../../context/PageLoaderContext";
import { useMySetups } from "../../../../context/SetupContext";
import FormInput from "../../../../components/inputs/FormInput";
import FormSelect from "../../../../components/inputs/FormSelect";
import SectionLoader from "../../../../components/loaders/SectionLoader";

interface Traveller {
  travellerName: string;
  countryOfOrigin: string;
  dob: string;
  documentType: string;
  documentNo: string;
  travellerType: string;
  travellerNo: string;
  passportNo: string;
  lineNo?: number;
  dependantNo?: number;
  exemptFromTravelling?: boolean;
}

interface ProfileDependant {
  profileNo: string,
  lineNo: number;
  dob: string;
  name: string;
  gender: string;
  countryOfOrigin: string;
}

interface SelectOption {
  value: number;
  label: string;
}

interface AddTravellerFormProps {
  travelRequestHeader: TravelRequest;
  countries: Array<Record<string, any>>;
  onSubmit: (requestNo: string) => void;
  onClose: () => void;
}

interface TravelDependenciesProps {
  travelRequestHeader: TravelRequest;
  isReadOnly: boolean;
  onSubmit: (requestNo: string) => void;
}

const AddTravellerForm: React.FC<AddTravellerFormProps> = ({
                                                             travelRequestHeader,
                                                             countries,
                                                             onSubmit,
                                                             onClose,
                                                           }) => {
  const { dispatcher } = usePageLoader().actions;
  const { loading } = usePageLoader();

  const initialFormData: Traveller = {
    documentType: travelRequestHeader.documentType,
    documentNo: travelRequestHeader.no,
    travellerType: "Other",
    travellerNo: travelRequestHeader.travellerNo,
    travellerName: "",
    countryOfOrigin: "",
    dob: "",
    passportNo: "",
  };

  const [formData, setFormData] = useState<Traveller>(initialFormData);

  const handleFormChange = useCallback(
    (field: keyof Traveller, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: true, message: "" },
      });

      const res = await createResource("travellers", { data: formData });

      if (res.error) {
        throw new Error(res.error.message);
      }

      onSubmit(travelRequestHeader.no);
      onClose();
    } catch (error: any) {
      Swal.fire("Error saving traveller", error.message, "error");
    } finally {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: false, message: "" },
      });
    }
  };

  const countryOptions = useMemo(
    () =>
      countries.map((item) => ({
        code: item.code,
        description: item.displayName,
      })),
    [countries]
  );

  return (
    <form onSubmit={handleSubmit} className="row mb-2">
      <div className="col-12">
        <h5 className="text-dark bg-light p-2">Add Traveller Details</h5>
      </div>

      <div className="col-12">
        <div className="row g-2 mb-2 pb-2 border-bottom m-1">
          <div className="col-md-6">
            <FormInput
              label="Traveller Name"
              value={formData.travellerName}
              onChange={(value) => handleFormChange("travellerName", value)}
              placeholder="Enter Traveller Name"
            />
          </div>
          <div className="col-md-6">
            <FormInput
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(value) => handleFormChange("dob", value)}
              required
            />
          </div>
          <div className="col-md-6">
            <FormSelect
              label="Country of Origin"
              value={formData.countryOfOrigin}
              onChange={(value) => handleFormChange("countryOfOrigin", value)}
              options={countryOptions}
              required
            />
          </div>
          <div className="col-md-6">
            <FormInput
              label="Passport Number"
              value={formData.passportNo}
              onChange={(value) => handleFormChange("passportNo", value)}
              placeholder="Enter Passport No"
            />
          </div>
        </div>
      </div>

      <div className="col-12 d-flex gap-2">
        <button
          type="submit"
          className="btn btn-outline-success btn-sm"
          title="Save"
          disabled={loading}
        >
          {loading ? (
            <SectionLoader size={16} classes="button-icon" />
          ) : (
            <>
              <Save size={16} className="button-icon" />
              Save
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={onClose}
          title="Cancel"
        >
          <XCircle size={16} className="button-icon" />
          Cancel
        </button>
      </div>
    </form>
  );
};

const TravellersForm: React.FC<TravelDependenciesProps> = ({
                                                             travelRequestHeader,
                                                             isReadOnly,
                                                             onSubmit,
                                                           }) => {
  const [dependants, setDependants] = useState<ProfileDependant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTravellerForm, setShowTravellerForm] = useState(false);
  const { dispatcher } = usePageLoader().actions;
  const { countries, fetchSetups } = useMySetups();

  const dependantTravellers = useMemo(
    () =>
      travelRequestHeader.travellers.filter(
        (traveller) => traveller.travellerType !== "Self"
      ),
    [travelRequestHeader.travellers]
  );

  const travellerDependantNos = useMemo(
    () => dependantTravellers.map((traveller) => traveller.dependantNo),
    [dependantTravellers]
  );

  const selectableDependants = useMemo(
    () =>
      dependants.filter(
        (dependant) => !travellerDependantNos.includes(dependant.lineNo)
      ),
    [dependants, travellerDependantNos]
  );

  const selectOptions = useMemo(
    () =>
      selectableDependants.map((item) => ({
        value: item.lineNo!,
        label: item.name,
      })),
    [selectableDependants]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSetups(["countries"]);

        const res = await getResource("profileDependants", {
          params: {
            filters: {
              profileNo: travelRequestHeader.travellerNo,
            },
          },
        });

        if (res.error) {
          throw new Error(res.error.message);
        }

        setDependants(res.value);
      } catch (error: any) {
        console.error("Error loading data:", error.message);
      }
    };

    loadData();
  }, [fetchSetups, travelRequestHeader.travellerNo]);

  const handleSelect = async (option: SelectOption | null) => {
    if (!option) return;

    try {
      setIsSubmitting(true);
      const res = await createResource("travellers", {
        data: {
          documentType: travelRequestHeader.documentType,
          documentNo: travelRequestHeader.no,
          travellerType: "Dependant",
          travellerNo: travelRequestHeader.travellerNo,
          dependantNo: option.value,
          travellerName: option.label,
        },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      onSubmit(travelRequestHeader.no);
    } catch (error: any) {
      Swal.fire({
        title: "Error saving traveller!",
        text: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (traveller: Traveller) => {
    try {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: true, message: "Deleting..." },
      });

      const res = await deleteResource("travellers", {
        data: traveller,
        primaryKey: ["documentType", "documentNo", "lineNo"],
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      onSubmit(travelRequestHeader.no);
    } catch (error: any) {
      console.error("Error deleting traveller:", error.message);
    } finally {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: false, message: "" },
      });
    }
  };

  const toggleTravellerForm = () => setShowTravellerForm((prev) => !prev);

  return (
    <div className="row">
      {!isReadOnly && (
        <div className="col-12">
          <div className="mb-4 d-flex justify-content-between align-items-center gap-3">
            <div className="flex-grow-1">
              <Select
                options={selectOptions}
                value={null}
                isLoading={isSubmitting}
                onChange={handleSelect}
                placeholder="Select the person you plan to travel with"
                isClearable
              />
            </div>
            <button
              type="button"
              className="btn bg-danger text-white btn-md"
              onClick={toggleTravellerForm}
            >
              <Plus size={16} />
              Add Traveller
            </button>
          </div>
        </div>
      )}

      {showTravellerForm && (
        <div className="col-12">
          <AddTravellerForm
            travelRequestHeader={travelRequestHeader}
            countries={countries}
            onSubmit={onSubmit}
            onClose={toggleTravellerForm}
          />
        </div>
      )}

      <div className="col-12">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Travel Status</th>
            {!isReadOnly && <th className="text-center">Action</th>}
          </tr>
          </thead>
          <tbody>
          {travelRequestHeader.travellers.map((traveller) => (
            <tr key={`${traveller.dependantNo}-${traveller.lineNo}`}>
              <td>{traveller.travellerName}</td>
              <td>
                {traveller.exemptFromTravelling
                  ? "Exempted from travelling"
                  : "Allowed to travel"}
              </td>
              {!isReadOnly && traveller.travellerType !== "Self" && (
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(traveller)}
                  >
                    <Trash2 size={16} className="button-icon" />
                    Drop
                  </button>
                </td>
              )}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TravellersForm;
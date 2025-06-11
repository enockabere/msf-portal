"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Trash2, User } from "lucide-react";
import Swal from "sweetalert2";
import CustomModal from "../../modals/CustomModal";
import DependantForm from "./DependantForm";
import SanitizedDataTable from "../../tables/SanitizedDataTable";
import { formatDate } from "../../../utils/dateFormats";

interface Dependant {
  name: string;
  relation: string;
  countryOfOrigin: string;
  dob?: string;
  gender?: string;
  profileNo?: string;
  lineNo?: number;
}

export default function DependantsTab({
  dependants,
  setDependants,
}: {
  dependants: Dependant[];
  setDependants: React.Dispatch<React.SetStateAction<Dependant[]>>;
}) {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newDependant, setNewDependant] = useState<Dependant>({
    name: "",
    relation: "",
    countryOfOrigin: "",
    dob: "",
    gender: "",
  });

  const profileNo = session?.user?.profile?.no;

  const handleNewFieldChange = (field: keyof Dependant, value: string) => {
    setNewDependant({ ...newDependant, [field]: value });
  };

  const refreshDependants = async () => {
    if (!profileNo) return;
    try {
      const res = await fetch(
        `/api/bc/users/dependants?employeeNo=${profileNo}`
      );
      const result = await res.json();
      if (res.ok && Array.isArray(result?.data?.value)) {
        setDependants(result.data.value);
      } else {
        console.warn("❗ Failed to reload dependants:", result?.error);
      }
    } catch (error) {
      console.error("❌ Error fetching updated dependants:", error);
    }
  };

  const handleSaveDependant = async () => {
    if (!profileNo) return;

    const payload = {
      ...newDependant,
      profileNo,
    };

    try {
      setIsSaving(true);
      const res = await fetch("/api/bc/users/dependants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || result.error || result.rawResponse?.error) {
        const message =
          result.rawResponse?.error?.message ||
          result.error?.message ||
          result.message ||
          "Failed to save dependant.";

        console.error("❌ API Error:", result);

        await Swal.fire({
          icon: "error",
          title: "Failed to Save Dependant",
          text: message,
        });
        return;
      }

      await refreshDependants();
      setShowModal(false);
      setNewDependant({
        name: "",
        relation: "",
        countryOfOrigin: "",
        dob: "",
        gender: "",
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Dependant saved successfully.",
      });
    } catch (error: any) {
      console.error("❌ Unexpected error:", error);
      Swal.fire("Error", error?.message || "Something went wrong", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const removeDependant = useCallback(
    async (index: number) => {
      const dependant = dependants[index];

      if (
        !dependant ||
        !dependant.profileNo ||
        dependant.lineNo === undefined
      ) {
        return;
      }

      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete ${dependant.name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (confirmed.isConfirmed) {
        try {
          const res = await fetch("/api/bc/users/dependants/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profileNo: dependant.profileNo,
              lineNo: dependant.lineNo,
            }),
          });

          const result = await res.json();

          if (!res.ok || result.error) {
            // Display the actual API error message
            const errorMessage =
              result.error?.message ||
              result.message ||
              "Failed to delete dependant";
            return Swal.fire(
              "Error",
              errorMessage, // This will show the API's error message
              "error"
            );
          }

          const updated = dependants.filter((_, i) => i !== index);
          setDependants(updated);
          Swal.fire("Deleted!", "The dependant has been removed.", "success");
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire("Error", "Something went wrong while deleting.", "error");
        }
      }
    },
    [dependants, setDependants]
  );

  const columns = useMemo(
    () => [
      {
        name: "Name",
        selector: (row: Dependant) => row.name,
        sortable: true,
      },
      {
        name: "Relationship",
        selector: (row: Dependant) => row.relation,
        sortable: true,
      },
      {
        name: "Nationality",
        selector: (row: Dependant) => row.countryOfOrigin,
        sortable: true,
      },
      {
        name: "Birth Date",
        selector: (row: Dependant) => formatDate(row.dob) || 'N/A',
      },
      {
        name: "Gender",
        selector: (row: Dependant) => row.gender ?? "-",
      },
      {
        name: "Action",
        cell: (_: Dependant, index: number) => (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => removeDependant(index)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        ),
        ignoreRowClick: true,
        width: "100px",
      },
    ],
    [removeDependant]
  );

  return (
    <>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Dependants</h4>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => setShowModal(true)}
          >
            + Add Dependant
          </button>
        </div>
        <div className="card-body pt-2">
          <SanitizedDataTable
            title=""
            columns={columns}
            data={dependants}
            loading={false}
            searchPlaceholder="Search dependants..."
          />
        </div>
      </div>

      <CustomModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Add Dependant"
        size="lg"
        titleIcon={<User size={18} className="text-white" />}
      >
        <DependantForm
          form={newDependant}
          onChange={handleNewFieldChange}
          onSave={handleSaveDependant}
          onCancel={() => setShowModal(false)}
          loading={isSaving}
        />
      </CustomModal>
    </>
  );
}

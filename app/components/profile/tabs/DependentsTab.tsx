"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Trash2, User } from "lucide-react";
import Swal from "sweetalert2";
import CustomModal from "../../modals/CustomModal";
import DependentForm from "./DependentForm";
import SanitizedDataTable from "../../tables/SanitizedDataTable";

interface Dependent {
  name: string;
  relation: string;
  countryOfOrigin: string;
  dob?: string;
  gender?: string;
  profileNo?: string;
  lineNo?: number;
}

export default function DependentsTab({
  dependents,
  setDependents,
}: {
  dependents: Dependent[];
  setDependents: React.Dispatch<React.SetStateAction<Dependent[]>>;
}) {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newDependent, setNewDependent] = useState<Dependent>({
    name: "",
    relation: "",
    countryOfOrigin: "",
    dob: "",
    gender: "",
  });

  const profileNo = session?.user?.profile?.no;

  const handleNewFieldChange = (field: keyof Dependent, value: string) => {
    setNewDependent({ ...newDependent, [field]: value });
  };

  const refreshDependents = async () => {
    if (!profileNo) return;
    try {
      const res = await fetch(
        `/api/bc/users/dependants?employeeNo=${profileNo}`
      );
      const result = await res.json();
      if (res.ok && Array.isArray(result?.data?.value)) {
        setDependents(result.data.value);
      } else {
        console.warn("❗ Failed to reload dependents:", result?.error);
      }
    } catch (error) {
      console.error("❌ Error fetching updated dependents:", error);
    }
  };

  const handleSaveDependent = async () => {
    if (!profileNo) return;

    const payload = {
      ...newDependent,
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
          "Failed to save dependent.";

        console.error("❌ API Error:", result);

        await Swal.fire({
          icon: "error",
          title: "Failed to Save Dependent",
          text: message,
        });
        return;
      }

      await refreshDependents();
      setShowModal(false);
      setNewDependent({
        name: "",
        relation: "",
        countryOfOrigin: "",
        dob: "",
        gender: "",
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Dependent saved successfully.",
      });
    } catch (error: any) {
      console.error("❌ Unexpected error:", error);
      Swal.fire("Error", error?.message || "Something went wrong", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const removeDependent = useCallback(
    async (index: number) => {
      const dependent = dependents[index];

      if (
        !dependent ||
        !dependent.profileNo ||
        dependent.lineNo === undefined
      ) {
        return;
      }

      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete ${dependent.name}?`,
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
              profileNo: dependent.profileNo,
              lineNo: dependent.lineNo,
            }),
          });

          const result = await res.json();

          if (!res.ok || result.error) {
            // Display the actual API error message
            const errorMessage =
              result.error?.message ||
              result.message ||
              "Failed to delete dependent";
            return Swal.fire(
              "Error",
              errorMessage, // This will show the API's error message
              "error"
            );
          }

          const updated = dependents.filter((_, i) => i !== index);
          setDependents(updated);
          Swal.fire("Deleted!", "The dependent has been removed.", "success");
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire("Error", "Something went wrong while deleting.", "error");
        }
      }
    },
    [dependents, setDependents]
  );

  const columns = useMemo(
    () => [
      {
        name: "Name",
        selector: (row: Dependent) => row.name,
        sortable: true,
      },
      {
        name: "Relationship",
        selector: (row: Dependent) => row.relation,
        sortable: true,
      },
      {
        name: "Nationality",
        selector: (row: Dependent) => row.countryOfOrigin,
        sortable: true,
      },
      {
        name: "DOB",
        selector: (row: Dependent) => row.dob ?? "-",
      },
      {
        name: "Gender",
        selector: (row: Dependent) => row.gender ?? "-",
      },
      {
        name: "Action",
        cell: (_: Dependent, index: number) => (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => removeDependent(index)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        ),
        ignoreRowClick: true,
        width: "100px",
      },
    ],
    [removeDependent]
  );

  return (
    <>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Dependents</h4>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => setShowModal(true)}
          >
            + Add Dependent
          </button>
        </div>
        <div className="card-body pt-2">
          <SanitizedDataTable
            title=""
            columns={columns}
            data={dependents}
            loading={false}
            searchPlaceholder="Search dependents..."
          />
        </div>
      </div>

      <CustomModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Add Dependent"
        size="lg"
        titleIcon={<User size={18} className="text-white" />}
      >
        <DependentForm
          form={newDependent}
          onChange={handleNewFieldChange}
          onSave={handleSaveDependent}
          onCancel={() => setShowModal(false)}
          loading={isSaving}
        />
      </CustomModal>
    </>
  );
}

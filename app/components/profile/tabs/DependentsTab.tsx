"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Trash2, User } from "lucide-react";
import CustomModal from "../../modals/CustomModal";
import DependentForm from "./DependentForm";
import SkeletonDataTable from "../../tables/SkeletonDataTable";

interface Dependent {
  name: string;
  relation: string;
  countryOfOrigin: string;
  dob?: string;
  gender?: string;
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
      if (!res.ok || result.error) {
        alert(result.error || "Failed to save dependent.");
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
    } catch (error) {
      console.error("Error creating dependent:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const removeDependent = useCallback(
    (index: number) => {
      const updated = dependents.filter((_, i) => i !== index);
      setDependents(updated);
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
        cell: (_, index) => (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => removeDependent(index)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
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
            className="btn btn-sm btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add Dependent
          </button>
        </div>
        <div className="card-body pt-2">
          <SkeletonDataTable
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

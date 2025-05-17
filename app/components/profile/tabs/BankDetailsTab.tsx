"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useMySetups } from "@/app/context/SetupContext";
import Swal from "sweetalert2";

interface BankDetails {
  currency: string;
  bankCode: string;
  branchNo: string;
  accountName: string;
  accountNumber: string;
  no: string;
  type: string;
  eMail: string;
  gender: string;
  passportIDNo: string;
}

export default function BankDetailsTab() {
  const { data: session } = useSession();
  const employeeNo = session?.user?.profile?.no;

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    currency: "",
    bankCode: "",
    branchNo: "",
    accountName: "",
    accountNumber: "",
    no: "",
    type: "",
    eMail: "",
    gender: "",
    passportIDNo: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const { currencies, banks, bankBranches, fetchSetups } = useMySetups();

  useEffect(() => {
    fetchSetups(["currencies", "banks", "bankBranches"]);
  }, [fetchSetups]);

  useEffect(() => {
    const loadBankDetails = async () => {
      if (!employeeNo) return;

      try {
        const res = await fetch(
          `/api/bc/users/bank-details?employeeNo=${employeeNo}`
        );
        const result = await res.json();

        if (res.ok && result?.data) {
          const d = result.data;
          setBankDetails({
            currency: d.currency || "",
            bankCode: d.bankCode || "",
            branchNo: d.branchNo || "",
            accountName: d.accountName || "",
            accountNumber: d.accountNumber || "",
            no: d.no || "",
            type: d.type || "",
            eMail: d.eMail || "",
            gender: d.gender || "",
            passportIDNo: d.passportIDNo || "",
          });
        } else {
          console.warn("⚠️ No bank data found:", result?.error);
        }
      } catch (err) {
        console.error("❌ Error loading bank details:", err);
      }
    };

    loadBankDetails();
  }, [employeeNo]);

  const filteredBranches = useMemo(
    () =>
      bankBranches.filter(
        (b: any) => b.mainBank === String(bankDetails.bankCode)
      ),
    [bankDetails.bankCode, bankBranches]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBankDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true); // Start loading

      const res = await fetch("/api/bc/users/bank-details/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankDetails),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        const apiError =
          result?.rawResponse?.error?.message ||
          result?.error?.message ||
          result?.message ||
          result?.error;
        return Swal.fire("Error", apiError, "error");
      }

      Swal.fire("Success", "Bank details updated successfully", "success");
    } catch (error: any) {
      console.error("❌ Save error:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Bank Details</h4>
      </div>
      <div className="card-body pt-0">
        {[
          ["Currency", "currency", "select", currencies, "code", "description"],
          ["Bank", "bankCode", "select", banks, "no", "name"],
          [
            "Branch",
            "branchNo",
            "select",
            filteredBranches,
            "branchNo",
            "name",
          ],
          ["Account Name", "accountName", "input"],
          ["Account Number", "accountNumber", "input"],
        ].map(([label, name, type, options, valueKey, labelKey]: any, idx) => (
          <div className="form-group mb-3 row" key={idx}>
            <label className="col-lg-3 text-end form-label">{label}</label>
            <div className="col-lg-9">
              {type === "select" ? (
                <select
                  name={name}
                  className="form-select"
                  value={(bankDetails as any)[name]}
                  onChange={handleChange}
                >
                  <option value="">Select {label}</option>
                  {options.map((opt: any) => (
                    <option
                      key={String(opt[valueKey])}
                      value={String(opt[valueKey])}
                    >
                      {opt[labelKey]}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-control"
                  type="text"
                  name={name}
                  value={(bankDetails as any)[name]}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>
        ))}

        <div className="form-group row">
          <div className="col-lg-9 offset-lg-3">
            <button
              type="button"
              className="btn btn-danger me-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>

            <button type="button" className="btn btn-primary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

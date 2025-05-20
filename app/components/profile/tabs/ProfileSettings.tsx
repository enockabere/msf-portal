"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useMySetups } from "@/app/context/SetupContext";
import PageLoader from "@/app/components/loaders/PageLoader";
import { ArrowLeft, Save } from "lucide-react";

export default function ProfileSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { genders, countries, fetchSetups } = useMySetups();
  const profile = session?.user?.profile;

  const isEditable = profile?.type === "Visitor";

  const [form, setForm] = useState({
    firstName: "",
    secondName: "",
    lastName: "",
    phoneNo: "",
    dateOfBirth: "",
    gender: "",
    countryCode: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSetups(["genders", "countries"]);
  }, [fetchSetups]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");

    if (profile) {
      setForm({
        firstName: profile.firstName ?? "",
        secondName: profile.secondName ?? "",
        lastName: profile.lastName ?? "",
        phoneNo: profile.phoneNo ?? "",
        dateOfBirth: profile.dateOfBirth ?? "",
        gender: profile.genderOption ?? "",
        countryCode: profile.countryCode ?? "",
        email: session?.user?.email ?? "",
      });
    }
  }, [status, router, profile, session?.user?.email]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const fieldsToSubmit = { ...form };

    const payload = {
      no: profile?.no ?? "",
      type: profile?.type,
      passportIDNo: profile?.identificationDocumentNo,
      ...fieldsToSubmit,
    };

    try {
      const res = await fetch("/api/bc/users/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        Swal.fire(
          "Error",
          result.error?.message || "Failed to update",
          "error"
        );
        return;
      }

      await fetch("/api/bc/users/refresh", {
        method: "POST",
        body: JSON.stringify({ no: payload.no }),
      });

      // ✅ Use SweetAlert for success
      await Swal.fire({
        title: "Success!",
        text: "Profile updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
        timer: 2000,
        timerProgressBar: true,
      });

      await signIn("azure-ad", {
        redirect: false,
        callbackUrl: "/dashboard/profile",
      });

      router.refresh();
    } catch {
      Swal.fire("Error", "Unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Profile Settings</h4>
      </div>
      <form className="card-body pt-0" onSubmit={handleSubmit}>
        {[
          { label: "First Name", name: "firstName", required: true },
          { label: "Middle Name", name: "secondName", required: false },
          { label: "Last Name", name: "lastName", required: true },
        ].map(({ label, name, required }) => (
          <div className="form-group mb-3 row" key={name}>
            <label className="col-xl-3 text-end">
              {label} {required && <span className="text-danger">*</span>}
            </label>

            <div className="col-lg-9 col-xl-8">
              <input
                className="form-control"
                name={name}
                value={form[name]}
                onChange={handleChange}
                required={name !== "secondName"}
                disabled={!isEditable}
              />
            </div>
          </div>
        ))}
        {/* Date of Birth */}
        <div className="form-group mb-3 row">
          <label className="col-xl-3 text-end">
            Date of Birth <span className="text-danger">*</span>
          </label>
          <div className="col-lg-9 col-xl-8">
            <input
              type="date"
              name="dateOfBirth"
              className="form-control"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
              disabled={!isEditable}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="form-group mb-3 row">
          <label className="col-xl-3 text-end">
            Gender <span className="text-danger">*</span>
          </label>
          <div className="col-lg-9 col-xl-8">
            <select
              name="gender"
              className="form-select"
              value={form.gender}
              onChange={handleChange}
              required
              disabled={!isEditable}
            >
              <option value="">Select Gender</option>
              {genders?.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone */}
        <div className="form-group mb-3 row">
          <label className="col-xl-3 text-end">Phone</label>
          <div className="col-lg-9 col-xl-8">
            <input
              name="phoneNo"
              className="form-control"
              value={form.phoneNo}
              onChange={handleChange}
              required
              disabled={!isEditable}
            />
          </div>
        </div>

        {/* Country */}
        <div className="form-group mb-3 row">
          <label className="col-xl-3 text-end">
            Country <span className="text-danger">*</span>
          </label>
          <div className="col-lg-9 col-xl-8">
            <select
              name="countryCode"
              className="form-select"
              value={form.countryCode}
              onChange={handleChange}
              disabled={!isEditable}
            >
              <option value="">Select Country</option>
              {countries?.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="form-group row">
          <div className="col-lg-9 col-xl-8 offset-lg-3">
            {profile?.type === "Visitor" && (
              <button
                type="submit"
                className="btn btn-danger me-2 d-flex align-items-center gap-2"
                disabled={isLoading || !isEditable}
              >
                <Save size={16} />
                {isLoading ? "Saving..." : "Edit Visitor Profile"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

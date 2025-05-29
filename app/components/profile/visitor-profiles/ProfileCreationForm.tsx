"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { Settings } from "lucide-react";
import Swal from "sweetalert2";
import { signIn, useSession } from "next-auth/react";
import "./UserProfilePage.css";
import PageLoader from "../../loaders/PageLoader";
import { useMySetups } from "../../../context/SetupContext";
import ProfileFormStepOne from "./ProfileFormStepOne";

interface ProfileCreationFormProps {
  onSuccess?: () => void;
}

export default function ProfileCreationForm({
  onSuccess,
}: ProfileCreationFormProps) {
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    countryRegionCode: "",
    title: "",
    passportNo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPageLoader, setShowPageLoader] = useState(false);

  const { countries, genders, fetchSetups } = useMySetups();

  useEffect(() => {
    fetchSetups(["countries", "cities", "genders"]);
  }, [fetchSetups]);

  useEffect(() => {
    if (session?.user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: session.user.email ?? "",
      }));
    }
  }, [session]);

  const countryOptions =
    countries?.map((country) => ({
      value: country.code,
      label: country.displayName,
    })) || [];

  const genderOptions =
    genders?.map((g) => ({
      value: g.code,
      label: g.description,
    })) || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const no = session?.user?.profile?.no ?? "";
        const type = session?.user?.profile?.type ?? "Visitor";

        const payload = {
          no,
          type,
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim(),
          lastName: formData.lastName.trim(),
          email: session?.user?.email?.trim().toLowerCase() ?? "",
          phone: formData.phone.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          countryRegionCode: formData.countryRegionCode,
          passportNo: formData.passportNo.trim(),
        };

        const saveRes = await fetch("/api/bc/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const saveResult = await saveRes.json();

        if (!saveRes.ok || saveResult?.error || saveResult?.success === false) {
          const msg =
            saveResult?.rawResponse?.error?.message ||
            saveResult?.error?.message ||
            saveResult?.error?.details?.[0]?.message ||
            "Unknown error occurred.";
          return Swal.fire("Error", msg, "error");
        }

        await Swal.fire("Success", "Profile saved successfully.", "success");

        // Show page loader during re-authentication
        setShowPageLoader(true);

        await fetch("/api/session/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: payload.email }),
        });

        await signIn("azure-ad", {
          redirect: true,
          callbackUrl: "/dashboard",
        });

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      } catch (error: any) {
        Swal.fire("Error", error?.message ?? "Unexpected error", "error");
        setIsSubmitting(false);
      }
    },
    [formData, session, onSuccess]
  );

  if (status === "loading" || showPageLoader) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="profile-wizard-container">
      <div className="container">
        <div className="wizard-card p-3">
          <form onSubmit={handleSubmit}>
            <Toaster />
            <h3 className="form-section-title">Personal Information</h3>
            <ProfileFormStepOne
              formData={formData}
              onChange={handleChange}
              genderOptions={genderOptions}
              countryOptions={countryOptions}
            />
            <div className="navigation-buttons d-flex justify-content-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-nav"
              >
                {isSubmitting && <div className="loading-spinner me-2"></div>}
                <Settings size={16} className="btn-icon" />
                {isSubmitting ? "Saving..." : "Build Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { Save, ArrowLeft, ArrowRight, User, MapPin, Check } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import "./UserProfilePage.css";
import PageLoader from "../../loaders/PageLoader";
import { useMySetups } from "../../../context/SetupContext";
import ProfileFormStepOne from "./ProfileFormStepOne";
import ProfileFormStepTwo from "./ProfileFormStepTwo";

interface ProfileCreationFormProps {
  onSuccess?: () => void;
}

const steps = [
  {
    id: 1,
    title: "Personal Information",
    subtitle: "Basic details about you",
    icon: User,
  },
  {
    id: 2,
    title: "Location & Contact",
    subtitle: "Your location and additional info",
    icon: MapPin,
  },
];

export default function ProfileCreationForm({
  onSuccess,
}: ProfileCreationFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    passportIDNo: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { countries, cities, genders, fetchSetups } = useMySetups();

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSetups(["countries", "cities", "genders"]);
      } catch (err) {
        console.log(err);
      }
    };
    loadData();
  }, [fetchSetups]);

  const countryOptions =
    countries?.map((country) => ({
      value: country.code,
      label: country.displayName,
    })) || [];

  const filteredCityOptions =
    cities
      ?.filter((city) => city.countryRegionCode === formData.countryRegionCode)
      .map((city) => ({
        value: city.city,
        label: city.city,
      })) || [];

  const genderOptions =
    genders?.map((g) => ({
      value: g.code,
      label: g.description,
    })) || [];
  useEffect(() => {
    if (session?.user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: session.user.email ?? "",
      }));
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
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
          passportIDNo: formData.passportIDNo.trim(),
          city: formData.city,
        };

        const res = await fetch("/api/bc/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (!res.ok || result.error || result.success === false) {
          const msg =
            result?.rawResponse?.error?.message ||
            result?.error?.message ||
            result?.error?.details?.[0]?.message ||
            "Unknown error occurred.";
          Swal.fire("Error", msg, "error");
          return;
        }

        await Swal.fire("Success", "Profile saved successfully.", "success");

        const refreshRes = await fetch("/api/bc/users/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: payload.email }),
        });

        const refreshed = await refreshRes.json();

        if (refreshed?.profile) {
          const sessionRefresh = await fetch("/api/auth/session?update", {
            cache: "no-store",
          });

          if (sessionRefresh.ok) {
            if (typeof onSuccess === "function") {
              onSuccess();
            } else {
              router.replace("/dashboard");
            }
          } else {
            throw new Error("Session refresh failed");
          }
        } else {
          Swal.fire("Error", "User not found after creation", "error");
        }
      } catch (error: any) {
        Swal.fire("Error", error?.message ?? "Unexpected error", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, session, router, onSuccess]
  );

  if (status === "loading") {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <PageLoader />
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .step-indicator-progress {
          position: absolute;
          top: 25px;
          left: 12.5%;
          height: 3px;
          background: linear-gradient(135deg, #ff0000 0%, #dc143c 100%);
          z-index: 2;
          transition: width 0.3s ease;
          width: ${currentStep === 1 ? "0%" : "75%"};
        }
      `}</style>

      <div className="profile-wizard-container">
        <div className="container">
          <div className="wizard-card">
            {/* Progress Indicator */}
            <div className="progress-container">
              <div className="step-indicator">
                <div className="step-indicator-progress"></div>
                {steps.map((step) => (
                  <div key={step.id} className="step-item">
                    <div
                      className={`step-circle ${
                        currentStep > step.id
                          ? "completed"
                          : currentStep === step.id
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check size={20} />
                      ) : (
                        <step.icon size={20} />
                      )}
                    </div>
                    <div className="step-info">
                      <div
                        className={`step-title ${
                          currentStep === step.id ? "active" : ""
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="step-subtitle">{step.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="form-container">
              <Toaster />
              {currentStep === 1 ? (
                <div>
                  <h3 className="form-section-title">Personal Information</h3>
                  <ProfileFormStepOne
                    formData={formData}
                    onChange={handleChange}
                    genderOptions={genderOptions}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="form-section-title">
                    Location & Additional Details
                  </h3>
                  <ProfileFormStepTwo
                    formData={formData}
                    onChange={handleChange}
                    countryOptions={countryOptions}
                    filteredCityOptions={filteredCityOptions}
                  />
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="navigation-buttons">
              <div className="d-flex justify-content-between align-items-center">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="btn btn-outline-secondary btn-nav"
                  >
                    <ArrowLeft size={16} className="btn-icon" />
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary btn-nav"
                  >
                    Next
                    <ArrowRight size={16} className="ms-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn btn-primary btn-nav"
                  >
                    {isSubmitting && <div className="loading-spinner"></div>}
                    <Save size={16} className="btn-icon" />
                    {isSubmitting ? "Saving..." : "Complete Profile"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

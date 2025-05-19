"use client";

import { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Cake,
  Flag,
  IdCard,
  Pencil,
  Save,
  XCircle,
  LogOut,
} from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import "./UserProfilePage.css";
import PageLoader from "../components/loaders/PageLoader";
import { useMySetups } from "../context/SetupContext";
import Image from "next/image";

const ProfileHeader = ({
  avatar,
  firstName,
  middleName,
  lastName,
  email,
  city,
  isEditing,
  onAvatarChange,
}) => (
  <div className="profile-header">
    <div className="d-flex align-items-center gap-4">
      <div className="position-relative">
        <Image
          src={avatar}
          alt="Profile"
          width={96}
          height={96}
          className="profile-avatar"
        />

        {isEditing && (
          <label className="avatar-edit-label">
            <input
              type="file"
              accept="image/*"
              className="d-none"
              onChange={onAvatarChange}
            />
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="text-danger"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </label>
        )}
      </div>
      <div>
        <h1 className="h4 fw-bold mb-1">
          {firstName} {middleName} {lastName}
        </h1>
        <p className="small mb-1">{email || "No email provided"}</p>
        <p className="small d-flex align-items-center mb-0 text-muted">
          <MapPin className="me-1" size={14} />
          {city || "No city provided"}
        </p>
      </div>
    </div>
  </div>
);

const ProfileFormField = ({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  icon: Icon,
  options,
}) => (
  <div className="mb-3">
    <label htmlFor={name} className="form-label fw-medium">
      {label}
    </label>
    <div className="input-group">
      {Icon && (
        <span className="input-group-text bg-white border-end-0">
          <Icon size={16} className="text-muted" />
        </span>
      )}
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="form-select"
        >
          <option value="">{`Select ${label}`}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="form-control"
          placeholder={label}
        />
      )}
    </div>
  </div>
);

const ProfileActionButtons = ({
  isEditing,
  isSubmitting,
  onEdit,
  onCancel,
  onSubmit,
}) => (
  <div className="mb-4 d-flex flex-wrap gap-3">
    {!isEditing ? (
      <button
        onClick={onEdit}
        className="btn btn-danger d-flex align-items-center gap-2"
      >
        <Pencil size={16} />
        Edit Profile
      </button>
    ) : (
      <>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`btn btn-danger d-flex align-items-center gap-2 ${
            isSubmitting ? "disabled opacity-75" : ""
          }`}
        >
          <Save size={16} />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
        >
          <XCircle size={16} />
          Cancel
        </button>
      </>
    )}
  </div>
);

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [globalLoading, setGlobalLoading] = useState(false);

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
    citizenNonCitizen: "",
  });

  const [avatar, setAvatar] = useState("/assets/images/avatar.png");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { countries, cities, genders, profileTitles, fetchSetups } =
    useMySetups();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSetups(["countries", "cities", "genders", "profileTitles"]);
      } catch (err) {
        console.log(err);
      }
    };
    loadData();
  });

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

  const titleOptions =
    profileTitles?.map((t) => ({
      value: t.code,
      label: t.description,
    })) || [];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const profile = session?.user?.profile;

    if (session?.user?.email) {
      setFormData({
        firstName: profile?.firstName ?? "",
        middleName: profile?.middleName ?? "",
        lastName: profile?.lastName ?? "",
        email: session.user.email ?? profile?.eMail ?? "",
        phone: profile?.phoneNo ?? "",
        dateOfBirth: profile?.dateOfBirth ?? "",
        gender: profile?.gender ?? "",
        countryRegionCode: profile?.countryRegionCode ?? "",
        title: profile?.title ?? "",
        passportIDNo: profile?.passportIDNo ?? "",
        city: profile?.city ?? "",
        citizenNonCitizen: profile?.citizenNonCitizen ?? "",
      });
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.dateOfBirth
      ) {
        Swal.fire(
          "Error",
          "First name, last name, email, and date of birth are required.",
          "error"
        );
        return;
      }

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
          title: formData.title,
          passportIDNo: formData.passportIDNo.trim(),
          city: formData.city,
          citizenNonCitizen: formData.citizenNonCitizen,
        };

        const res = await fetch(no ? "/api/bc/users/edit" : "/api/bc/users", {
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

        // ✅ Redirect with loader and revalidation
        Swal.fire(
          "Success",
          "Profile saved successfully. Redirecting...",
          "success"
        );
        setGlobalLoading(true);

        const refresh = await fetch("/api/bc/users/refresh", {
          method: "POST",
          body: JSON.stringify({ email: payload.email }),
        });

        const refreshed = await refresh.json();

        if (refreshed?.profile) {
          await signIn("azure-ad", {
            redirect: false,
            callbackUrl: "/dashboard/user-profile",
          });
          router.replace("/dashboard/user-profile"); // cleaner redirect
        } else {
          Swal.fire("Error", "User not found after creation", "error");
          setGlobalLoading(false);
        }
      } catch (error: any) {
        Swal.fire("Error", error?.message ?? "Unexpected error", "error");
        setGlobalLoading(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, session, router]
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        toast.success("Avatar updated!", {
          position: "top-center",
          className:
            "text-white bg-success fw-semibold px-3 py-2 rounded shadow",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuit = () => {
    setGlobalLoading(true);
    router.push("/");
  };

  if (status === "loading" || globalLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <PageLoader />
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 bg-footer"
      style={{ backgroundImage: "url('/assets/images/bg/footer-bg.png')" }}
    >
      <header className="bg-white shadow-sm py-3 px-4 mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Image
            src="/assets/images/logo-light.png"
            alt="Logo"
            width={100}
            height={40}
            className="img-fluid"
          />
        </div>
        <button
          onClick={handleQuit}
          className="btn btn-link text-danger fw-semibold d-flex align-items-center gap-1 text-decoration-none"
        >
          <LogOut size={16} />
          Home
        </button>
      </header>

      <Toaster />

      <div className="px-4">
        <div className="bg-white rounded shadow-lg overflow-hidden">
          <ProfileHeader
            avatar={avatar}
            firstName={formData.firstName}
            middleName={formData.middleName}
            lastName={formData.lastName}
            email={formData.email}
            city={formData.city}
            isEditing={isEditing}
            onAvatarChange={handleAvatarChange}
          />

          <div className="p-4">
            <ProfileActionButtons
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              onEdit={() => setIsEditing(true)}
              onCancel={() => setIsEditing(false)}
              onSubmit={handleSubmit}
            />

            <form className="row row-cols-1 row-cols-md-3 g-4">
              <ProfileFormField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={User}
                options={undefined}
              />
              <ProfileFormField
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={User}
                options={undefined}
              />
              <ProfileFormField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={User}
                options={undefined}
              />

              <ProfileFormField
                label="Date of Birth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                type="date"
                icon={Cake}
                options={undefined}
              />
              <ProfileFormField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                type="select"
                icon={User}
                options={genderOptions}
              />
              <ProfileFormField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={!isEditing}
                type="select"
                icon={User}
                options={titleOptions}
              />

              <ProfileFormField
                label="Passport/ID No"
                name="passportIDNo"
                value={formData.passportIDNo}
                onChange={handleChange}
                disabled={!isEditing}
                icon={IdCard}
                options={undefined}
              />
              <ProfileFormField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                type="email"
                icon={Mail}
                options={undefined}
              />
              <ProfileFormField
                label="Country/Region"
                name="countryRegionCode"
                value={formData.countryRegionCode}
                onChange={handleChange}
                disabled={!isEditing}
                type="select"
                icon={Flag}
                options={countryOptions}
              />

              <ProfileFormField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing || !formData.countryRegionCode}
                type="select"
                icon={MapPin}
                options={filteredCityOptions}
              />
              <ProfileFormField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                type="tel"
                icon={Phone}
                options={undefined}
              />
              <ProfileFormField
                label="Citizenship"
                name="citizenNonCitizen"
                value={formData.citizenNonCitizen}
                onChange={handleChange}
                disabled={!isEditing}
                type="select"
                icon={User}
                options={[
                  { value: "Citizen", label: "Citizen" },
                  { value: "Non-Citizen", label: "Non-Citizen" },
                ]}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

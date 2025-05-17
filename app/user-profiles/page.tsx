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
import "../tailwind.css";
import PageLoader from "../components/loaders/PageLoader";
import { useMySetups } from "../context/SetupContext";

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
  <div className="bg-gradient-to-r from-red-600 to-red-500 p-8 text-white">
    <div className="flex items-center space-x-6">
      <div className="relative">
        <img
          src={avatar}
          alt="Profile"
          className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
        />
        {isEditing && (
          <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-white p-2 shadow-md">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </label>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold">
          {firstName} {middleName} {lastName}
        </h1>
        <p className="text-sm opacity-80">{email || "No email provided"}</p>
        <p className="mt-1 flex items-center text-sm">
          <MapPin className="mr-1 h-4 w-4" />
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
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
    )}
    {type === "select" ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-red-600 focus:outline-none disabled:bg-gray-100`}
      >
        <option value="">{`Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={label}
        className={`w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-red-600 focus:outline-none disabled:bg-gray-100`}
      />
    )}
    <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600">
      {label}
    </label>
  </div>
);

const ProfileActionButtons = ({
  isEditing,
  isSubmitting,
  onEdit,
  onCancel,
  onSubmit,
  onQuit,
}) => (
  <div className="mb-6 flex flex-wrap gap-3">
    {!isEditing ? (
      <>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <Pencil size={16} />
          Edit Profile
        </button>
      </>
    ) : (
      <>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
            isSubmitting ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <Save size={16} />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
  }, [status]);

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
          className: "bg-green-500 text-white font-medium",
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
      <div className="h-screen flex items-center justify-center bg-white-50">
        <PageLoader />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/images/bg/footer-bg.png')" }}
    >
      <header className="bg-white shadow-md py-4 px-6 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/images/logo-light.png"
            alt="Logo"
            className="h-10"
          />
        </div>
        <button
          onClick={handleQuit}
          className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium text-sm"
        >
          <LogOut size={16} />
          Home
        </button>
      </header>
      <Toaster />
      <div className="mx-5 max-md">
        <div className="overflow-hidden rounded-md bg-white shadow-2xl">
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

          <div className="p-8">
            <ProfileActionButtons
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              onEdit={() => setIsEditing(true)}
              onCancel={() => setIsEditing(false)}
              onSubmit={handleSubmit}
              onQuit={handleQuit}
            />
            <form className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Row 1: First, Middle, Last Names */}
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

              {/* Row 2: DOB, Gender, Title */}
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

              {/* Row 3: Passport, Email, Country */}
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

              {/* Row 4: City, Phone, Citizenship */}
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

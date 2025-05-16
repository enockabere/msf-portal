"use client";

import { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { User, Mail, Phone, MapPin, Cake, Flag, IdCard } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import "../tailwind.css";
import PageLoader from "../components/loaders/PageLoader";

const ProfileHeader = ({
  avatar,
  firstName,
  middleName,
  lastName,
  title,
  city,
  isEditing,
  onAvatarChange,
}) => (
  <div className="bg-gradient-to-r from-red-600 to-black p-8 text-white">
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
        <p className="text-sm opacity-80">{title || "No title provided"}</p>
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
      <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
    )}
    {type === "select" ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-lg border bg-white p-3 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <option value="">Select {label}</option>
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
        className={`w-full rounded-lg border bg-white p-3 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 ${
          disabled ? "cursor-not-allowed" : ""
        }`}
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
  showContinueButton,
  onContinue,
}) => (
  <div className="mb-6 flex flex-wrap gap-3">
    {!isEditing ? (
      <>
        <button
          onClick={onEdit}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          Edit Profile
        </button>
        {showContinueButton && (
          <button
            onClick={onContinue}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            Continue to Dashboard
          </button>
        )}
      </>
    ) : (
      <>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
            isSubmitting ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Cancel
        </button>
      </>
    )}
    <button
      onClick={onQuit}
      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
    >
      Quit
    </button>
  </div>
);

export default function UserProfilePage() {
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
    postCode: "",
    citizenNonCitizen: "",
  });

  const [avatar, setAvatar] = useState("/assets/images/avatar.png");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      // router.push("/");
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
        postCode: profile?.postCode ?? "",
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
          postCode: formData.postCode,
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

        if (!no) console.log("Inserted user response:", result);

        Swal.fire("Success", "Profile updated successfully!", "success");
        await signIn("azure-ad", { callbackUrl: "/dashboard", redirect: true });
      } catch (error: any) {
        Swal.fire("Error", error?.message ?? "Unexpected error", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, session]
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

  const handleQuit = () => router.push("/");

  if (status === "loading") {
    return (
      <div className="text-center mt-10">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <ProfileHeader
            avatar={avatar}
            firstName={formData.firstName}
            middleName={formData.middleName}
            lastName={formData.lastName}
            title={formData.title}
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
              showContinueButton={!!session?.user?.profile?.no}
              onContinue={() => router.push("/dashboard")}
            />
            <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
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
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                />
              </div>
              <div className="space-y-4">
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
                  label="Country/Region"
                  name="countryRegionCode"
                  value={formData.countryRegionCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={Flag}
                  options={undefined}
                />
                <ProfileFormField
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={undefined}
                  options={undefined}
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
              </div>
              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
                <ProfileFormField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={MapPin}
                  options={undefined}
                />
                <ProfileFormField
                  label="Post Code"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={undefined}
                  options={undefined}
                />
                <ProfileFormField
                  label="Citizenship"
                  name="citizenNonCitizen"
                  value={formData.citizenNonCitizen}
                  onChange={handleChange}
                  disabled={!isEditing}
                  type="select"
                  options={[
                    { value: "Citizen", label: "Citizen" },
                    { value: "Non-Citizen", label: "Non-Citizen" },
                  ]}
                  icon={undefined}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

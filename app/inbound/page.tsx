"use client";

import { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { User, Mail, Phone, MapPin, Cake, Flag, IdCard } from "lucide-react";
import "../tailwind.css";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileFormField } from "../components/profile/ProfileFormField";
import { ProfileActionButtons } from "../components/profile/ProfileActionButtons";

export default function UserProfilePage() {
  const { data: session } = useSession();
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
    if (session?.user?.profile) {
      const profile = session.user.profile;
      setFormData({
        firstName: profile.firstName || "",
        middleName: profile.middleName || "",
        lastName: profile.lastName || "",
        email: profile.eMail || "",
        phone: profile.phoneNo || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        countryRegionCode: profile.countryRegionCode || "",
        title: profile.title || "",
        passportIDNo: profile.passportIDNo || "",
        city: profile.city || "",
        postCode: profile.postCode || "",
        citizenNonCitizen: profile.citizenNonCitizen || "",
      });
      setAvatar("/assets/images/avatar.png");
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
        const no = session?.user?.profile?.no || "";
        const type = session?.user?.profile?.type || "Visitor";

        const payload = {
          no,
          type,
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
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

        const res = await fetch("/api/bc/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const response = await res.json();

        if (!res.ok || response.error || response.success === false) {
          const rawMsg =
            response?.rawResponse?.error?.message ||
            response?.error?.message ||
            response?.error?.details?.[0]?.message ||
            "Unknown error occurred.";
          Swal.fire("Error", rawMsg, "error");
          return;
        }

        Swal.fire("Success", "Profile updated successfully!", "success");
        await signIn("azure-ad", { callbackUrl: "/dashboard", redirect: true });
      } catch (error: any) {
        Swal.fire(
          "Error",
          error?.message ||
            "An unexpected error occurred while updating profile.",
          "error"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, session]
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          toast.success("Avatar updated!", {
            position: "top-center",
            className: "bg-red-500 text-white font-medium",
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleQuit = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster />

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
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

          <div className="p-6">
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

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <ProfileFormField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={User}
                />

                <ProfileFormField
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={User}
                />

                <ProfileFormField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={User}
                />

                <ProfileFormField
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  type="date"
                  icon={Cake}
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

              {/* Contact & Identification */}
              <div className="space-y-3">
                <ProfileFormField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  type="email"
                  icon={Mail}
                />

                <ProfileFormField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  type="tel"
                  icon={Phone}
                />

                <ProfileFormField
                  label="Country/Region"
                  name="countryRegionCode"
                  value={formData.countryRegionCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={Flag}
                />

                <ProfileFormField
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <ProfileFormField
                  label="Passport/ID No"
                  name="passportIDNo"
                  value={formData.passportIDNo}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={IdCard}
                />
              </div>

              {/* Address & Professional */}
              <div className="space-y-3 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                <ProfileFormField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={MapPin}
                />

                <ProfileFormField
                  label="Post Code"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleChange}
                  disabled={!isEditing}
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
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

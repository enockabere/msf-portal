"use client";

import { useSession } from "next-auth/react";
import {
  Cake,
  Briefcase,
  Phone,
  Mail,
  IdCard,
  MapPin,
  Globe,
} from "lucide-react";

export default function PersonalInfoCard() {
  const { data: session } = useSession();
  const profile = session?.user?.profile;

  return (
    <div className="col-md-4">
      <div className="card shadow-sm">
        <div className="card-header border-bottom">
          <h4 className="card-title mb-0">Personal Information</h4>
        </div>
        <div className="card-body pt-3">
          <ul className="list-unstyled mb-0">
            {profile?.dateOfBirth && profile.dateOfBirth !== "N/A" && (
              <li className="mt-2">
                <Cake className="me-2 text-secondary" size={20} />
                <b>Birth Date</b> : {profile.dateOfBirth}
              </li>
            )}
            {profile?.type && (
              <li className="mt-2">
                <Briefcase className="me-2 text-secondary" size={20} />
                <b>Position</b> : {profile.type}
              </li>
            )}
            {profile?.identificationDocumentNo &&
              profile.identificationDocumentNo !== "N/A" && (
                <li className="mt-2">
                  <IdCard className="me-2 text-secondary" size={20} />
                  <b>ID No</b> : {profile.identificationDocumentNo}
                </li>
              )}
            {profile?.phoneNo && profile.phoneNo !== "N/A" && (
              <li className="mt-2">
                <Phone className="me-2 text-secondary" size={20} />
                <b>Phone</b> : {profile.phoneNo}
              </li>
            )}
            {session?.user?.email && session.user.email !== "N/A" && (
              <li className="mt-2">
                <Mail className="me-2 text-secondary" size={20} />
                <b>Email</b> : {session.user.email}
              </li>
            )}
            {profile?.city && profile.city !== "N/A" && (
              <li className="mt-2">
                <MapPin className="me-2 text-secondary" size={20} />
                <b>City</b> : {profile.city}
              </li>
            )}
            {profile?.countryCode && profile.countryCode !== "N/A" && (
              <li className="mt-2">
                <Globe className="me-2 text-secondary" size={20} />
                <b>Country</b> : {profile.countryCode}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

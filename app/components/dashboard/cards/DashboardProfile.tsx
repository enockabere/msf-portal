"use client";

import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  TypeIcon,
  NonBinaryIcon, Globe
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSession } from "next-auth/react";

export default function DashboardProfile() {
  const { data: session } = useSession()

  const isLoading = !session;

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              <div className="position-relative">
                {isLoading ? (
                  <Skeleton
                    circle
                    width={60}
                    height={60}
                    className="rounded-circle"
                  />
                ) : (
                  <Image
                    src="/assets/images/avatar.png"
                    alt="User Avatar"
                    width={60}
                    height={60}
                    className="rounded-circle img-fluid"
                  />
                )}
                {!isLoading && (
                  <div className="position-absolute top-50 start-100 translate-middle">
                    <Image
                      src="/assets/images/kenya.png"
                      alt="Flag"
                      width={30}
                      height={30}
                      className="rounded-circle thumb-sm border border-3 border-white"
                    />
                  </div>
                )}
              </div>
              <div className="flex-grow-1 ms-3">
                <h5 className="m-0 fs-3 fw-bold">
                  {isLoading ? (
                    <Skeleton width={180} />
                  ) : (
                      session?.user?.profile
                          ? `${session?.user?.profile?.searchName}`
                          : session?.user.name
                  )}
                </h5>
                <p className="text-muted mb-0">
                  {isLoading ? (
                    <Skeleton width={140} />
                  ) : (
                    session?.user?.profile?.type || ''
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-body mb-2 d-flex align-items-center">
            <Mail size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Email:</span>
            {isLoading ? (
              <Skeleton width={180} />
            ) : (
              <a
                href={`mailto:${session?.user?.profile?.eMail || session?.user?.email}`}
                className="text-primary text-decoration-underline"
              >
                {session?.user?.profile?.eMail || session?.user?.email}
              </a>
            )}
          </div>

          <div className="text-body mb-2 d-flex align-items-center">
            <Phone size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Phone:</span>
            {isLoading ? (
              <Skeleton width={120} />
            ) : (
              session?.user?.profile?.phoneNo || "N/A"
            )}
          </div>

          <div className="text-body mb-2 d-flex align-items-center">
            <User size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Profile No.:</span>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              session?.user?.profile?.no || 'N/A'
            )}
          </div>

          <div className="text-body mb-2 d-flex align-items-center">
            <TypeIcon size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Origin:</span>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              session?.user?.profile?.citizenNonCitizen || "N/A"
            )}
          </div>

          <div className="text-body mb-2 d-flex align-items-center">
            <Globe size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Nationality:</span>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              session?.user?.profile?.countryCode || "N/A"
            )}
          </div>

          <div className="text-body d-flex align-items-center">
            <NonBinaryIcon size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Gender:</span>
            {isLoading ? <Skeleton width={80} /> : session?.user?.profile?.genderOption || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}

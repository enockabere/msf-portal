"use client";

import Image from "next/image";
import { Users, Plane, Leaf, CalendarCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import PageLoader from "@/app/components/loaders/PageLoader";

interface Props {
  dependents: number;
  travelRequests: number;
  leaveBalance: number;
  carbonCredits: number;
}

export default function ProfileSummaryCard({
  dependents,
  travelRequests,
  leaveBalance,
  carbonCredits,
}: Props) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <PageLoader />;
  }

  const profile = session?.user?.profile;
  const avatarUrl = "/assets/images/avatar.png";
  const name = `${profile?.firstName || ""} ${profile?.secondName || ""} ${profile?.lastName || ""}`.trim();
  const role = profile?.type === "Visitor" ? "Visitor Profile" : profile?.profileTitle || "User";
  const location = profile?.city || "Unknown";

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <div className="card shadow">
          <div className="card-body">
            <div className="row align-items-center">
              {/* Profile Info */}
              <div className="col-lg-4 mb-3 mb-lg-0">
                <div className="d-flex align-items-center gap-3">
                  <div className="position-relative">
                    <Image
                      src={avatarUrl}
                      alt="User Avatar"
                      height={100}
                      width={100}
                      className="rounded-circle border border-3 border-white shadow"
                    />
                  </div>
                  <div>
                    <h5 className="fw-semibold mb-1">{name}</h5>
                    <p className="text-muted mb-0">{role}</p>
                    <p className="text-muted mb-0 small">{location}</p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="col-lg-8">
                <div className="row text-center">
                  <div className="col-md-3 mb-3 mb-md-0">
                    <div className="border rounded py-3 bg-light">
                      <Users className="text-danger mb-1" size={18} />
                      <h6 className="mb-0 fw-semibold">{dependents}</h6>
                      <p className="mb-0 small text-muted">Dependents</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3 mb-md-0">
                    <div className="border rounded py-3 bg-light">
                      <Plane className="text-primary mb-1" size={18} />
                      <h6 className="mb-0 fw-semibold">{travelRequests}</h6>
                      <p className="mb-0 small text-muted">Travel Requests</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3 mb-md-0">
                    <div className="border rounded py-3 bg-light">
                      <CalendarCheck className="text-success mb-1" size={18} />
                      <h6 className="mb-0 fw-semibold">{leaveBalance}</h6>
                      <p className="mb-0 small text-muted">Leave Balance</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded py-3 bg-light">
                      <Leaf className="text-green-700 mb-1" size={18} />
                      <h6 className="mb-0 fw-semibold">{carbonCredits}</h6>
                      <p className="mb-0 small text-muted">Carbon Credits</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* end row */}
          </div>
        </div>
      </div>
    </div>
  );
}

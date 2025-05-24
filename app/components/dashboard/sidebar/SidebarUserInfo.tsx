"use client";

import { useSession } from "next-auth/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import { startTransition } from "react";

export default function SidebarUserInfo() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { actions } = usePageLoader();
  const { dispatcher } = actions

  const profile = session?.user?.profile;
  const isEmployee = profile?.type === "Employee";

  const handleViewProfile = () => {
    dispatcher({
      type: 'PATCH_LOADING_STATE',
      payload: {
        loading: true,
        message: '',
      }
    });
    startTransition(() => (router.push("/dashboard/profile"), dispatcher({
      type: 'PATCH_LOADING_STATE',
      payload: {
        loading: false,
        message: '',
      }
    })));
  };

  if (status === "loading" || !session || !session.user?.profile) {
    return (
      <div className="update-msg text-center">
        <div className="d-flex justify-content-center align-items-center thumb-lg update-icon-box rounded-circle mx-auto">
          <Skeleton circle width={48} height={48} />
        </div>
        <h5 className="mt-3">
          <Skeleton width={150} />
        </h5>
        <p className="text-muted text-small">
          <Skeleton width={200} />
        </p>
        <div className="p-3 text-center">
          {[...Array(4)].map((_, i) => (
            <div
              className="d-flex align-items-center mb-2 justify-content-center"
              key={i}
            >
              <Skeleton width={180} height={12} />
            </div>
          ))}
        </div>
        <Skeleton
          width={160}
          height={36}
          className="rounded-pill mx-auto d-block"
        />
      </div>
    );
  }

  return (
    <div className="update-msg text-center">
      <div className="d-flex justify-content-center align-items-center thumb-lg update-icon-box rounded-circle mx-auto">
        <i className="iconoir-user h3 align-self-center mb-0 text-danger"></i>
      </div>
      <h5 className="mt-3">{profile.searchName}</h5>
      <p className="text-muted text-small">{profile.eMail}</p>

      {/* Extra details only for Employee */}
      {isEmployee && (
        <div className="my-2 text-center">
          {profile.no && profile.no !== "N/A" && (
            <div className="d-flex align-items-center mb-2">
              <i className="iconoir-user me-2 text-danger"></i>
              <span className="text-muted">{profile.no}</span>
            </div>
          )}
          {profile.phoneNo && profile.phoneNo !== "N/A" && (
            <div className="d-flex align-items-center mb-2">
              <i className="iconoir-phone me-2 text-danger"></i>
              <span className="text-muted">{profile.phoneNo}</span>
            </div>
          )}
          {profile.genderOption && profile.genderOption !== "N/A" && (
            <div className="d-flex align-items-center">
              <i className="iconoir-female me-2 text-danger"></i>
              <span className="text-muted">{profile.genderOption}</span>
            </div>
          )}
        </div>
      )}

      <button
        className="btn text-danger shadow-sm rounded-pill mt-2"
        onClick={handleViewProfile}
      >
        View Account <i className="iconoir-arrow-right ms-2 text-danger"></i>
      </button>
    </div>
  );
}

"use client";

import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSession, signOut } from "next-auth/react";

export default function ProfileDropdown() {
  const { data: employee } = useSession();

  return (
    <li className="dropdown topbar-item">
      <a
        className="nav-link dropdown-toggle arrow-none nav-icon"
        data-bs-toggle="dropdown"
        href="#"
        role="button"
        aria-haspopup="false"
        aria-expanded="false"
      >
        <Image
          src="/assets/images/avatar.png"
          width={40}
          height={40}
          alt="Profile"
          className="thumb-lg rounded-circle"
        />
      </a>
      <div className="dropdown-menu dropdown-menu-end py-0">
        <>
          <div className="d-flex align-items-center dropdown-item py-2 bg-secondary-subtle">
            <div className="flex-shrink-0">
              <Image
                src="/assets/images/avatar.png"
                width={40}
                height={40}
                alt="avatar"
                className="thumb-md rounded-circle"
              />
            </div>
            <div className="flex-grow-1 ms-2 text-truncate align-self-center">
              <h6 className="my-0 fw-medium text-dark fs-13">
                {employee ? (
                  `${employee?.user?.profile?.firstName} ${employee?.user?.profile?.lastName}`
                ) : (
                  <Skeleton width={120} />
                )}
              </h6>
              <small className="text-muted mb-0">
                {employee?.user?.profile?.jobTitle || <Skeleton width={100} />}
              </small>
            </div>
          </div>

          <div className="dropdown-divider mt-0" />
          <small className="text-muted px-2 pb-1 d-block">Account</small>

          <a className="dropdown-item" href="#">
            <i className="las la-user fs-18 me-1 align-text-bottom" />
            Profile
          </a>
          <a className="dropdown-item" href="#">
            <i className="las la-file-alt fs-18 me-1 align-text-bottom" />
            Documentation
          </a>

          <small className="text-muted px-2 py-1 d-block">Settings</small>
          <a className="dropdown-item" href="#">
            <i className="las la-cog fs-18 me-1 align-text-bottom" />
            Account Settings
          </a>
          <a className="dropdown-item" href="#">
            <i className="las la-question-circle fs-18 me-1 align-text-bottom" />
            Help Center
          </a>

          <div className="dropdown-divider mb-0" />
          <button
            className="dropdown-item text-danger"
            onClick={() => signOut()}
          >
            <i className="las la-power-off fs-18 me-1 align-text-bottom" />
            Logout
          </button>
        </>
      </div>
    </li>
  );
}

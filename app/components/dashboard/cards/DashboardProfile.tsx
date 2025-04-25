"use client";

import Image from "next/image";
import { User, Mail, Phone, Calendar, Briefcase } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useEmployee } from "@/app/context/EmployeeContext";

export default function DashboardProfile() {
  const { employee } = useEmployee();

  console.log(employee);

  const isLoading = !employee;

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
                    `${employee.firstName} ${employee.lastName}`
                  )}
                </h5>
                <p className="text-muted mb-0">
                  {isLoading ? (
                    <Skeleton width={140} />
                  ) : (
                    employee.jobTitle || "Employee"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-muted mb-2 d-flex align-items-center">
            <Mail size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Email:</span>
            {isLoading ? (
              <Skeleton width={180} />
            ) : (
              <a
                href={`mailto:${employee.email}`}
                className="text-primary text-decoration-underline"
              >
                {employee.email}
              </a>
            )}
          </div>

          <div className="text-body mb-3 d-flex align-items-center">
            <Phone size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Phone:</span>
            {isLoading ? (
              <Skeleton width={120} />
            ) : (
              employee.mobilePhone || "N/A"
            )}
          </div>

          <div className="text-body mb-2 d-flex align-items-center">
            <User size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Staff No.:</span>
            {isLoading ? <Skeleton width={100} /> : employee.number}
          </div>

          <div className="text-body mb-2 d-flex align-items-center">
            <Calendar size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Employment Date:</span>
            {isLoading ? (
              <Skeleton width={140} />
            ) : (
              new Date(employee.employmentDate).toLocaleDateString()
            )}
          </div>

          <div className="text-body mb-2 d-flex align-items-center">
            <Briefcase size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Department:</span>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              employee.globalDimension2Code || "N/A"
            )}
          </div>

          <div className="text-body mb-2 d-flex align-items-center">
            <User size={20} className="me-2 text-muted" />
            <span className="fw-semibold me-1">Gender:</span>
            {isLoading ? <Skeleton width={80} /> : employee.gender || "N/A"}
          </div>

          <ul className="list-unstyled d-flex gap-2 mb-0">
            <li className="list-inline-item">
              <a
                href="#"
                className="d-flex justify-content-center align-items-center thumb-md rounded-circle social twitter"
              >
                <i className="icofont-twitter fs-18 mb-0" />
              </a>
            </li>
            <li className="list-inline-item">
              <a
                href="#"
                className="d-flex justify-content-center align-items-center thumb-md rounded-circle social instagram"
              >
                <i className="icofont-instagram fs-18 mb-0" />
              </a>
            </li>
            <li className="list-inline-item">
              <a
                href="#"
                className="d-flex justify-content-center align-items-center thumb-md rounded-circle social facebook"
              >
                <i className="icofont-facebook fs-18 mb-0" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

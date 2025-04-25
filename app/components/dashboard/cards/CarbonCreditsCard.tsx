"use client";

import Image from "next/image";
import Link from "next/link";

export default function CarbonCreditsCard() {
  return (
    <div className="card h-100 carbon-card position-relative overflow-hidden">
      <div
        className="card-bg-image"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(to right, rgba(17, 43, 34, 0.9) 40%, rgba(75, 164, 128, 0.9)), url('/selfservice/assets/images/3.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "right center",
          zIndex: 0,
        }}
      ></div>

      {/* Card Body */}
      <div className="card-body position-relative" style={{ zIndex: 1 }}>
        <div className="row d-flex justify-content-center border-dashed-bottom pb-3">
          <div className="col-9">
            {/* Header */}
            <div className="d-flex align-items-center mb-1">
              <i
                className="iconoir-leaf text-success me-2"
                style={{ fontSize: "1.25rem" }}
              ></i>
              <p className="text-white mb-0 fw-semibold fs-14">
                Carbon Credits
              </p>
            </div>

            {/* Foreground Image */}
            <div className="mt-2 mb-2" style={{ maxWidth: "200px" }}>
              <Image
                src="/selfservice/assets/images/Climate change-bro.png"
                alt="Carbon Credit Icon"
                width={200}
                height={120}
                className="img-fluid"
              />
            </div>

            {/* Data Counter */}
            <h3 className="mt-2 text-white mb-0 fw-bold">
              <span className="counter text-white">3.25</span> GtCO₂e
            </h3>
          </div>

          <div className="col-3 align-self-center">
            <div style={{ width: "48px", height: "48px" }}></div>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <p className="mb-0 text-white">
            <span className="text-success">
              <i className="iconoir-arrow-up-right me-1" /> 12.5%
            </span>{" "}
            YTD Reduction
          </p>
          <Link
            href="#"
            className="btn btn-sm btn-outline-success rounded-pill"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

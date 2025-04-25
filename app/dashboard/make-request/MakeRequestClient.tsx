"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import RequestCards from "@/app/components/request/RequestCards";

export default function MakeRequestClient() {
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      { label: "Make Request", path: "/dashboard/make-request" },
    ]);
  }, [setBreadcrumb]);

  return (
    <div className="page-content dashboard-container p-3">
      <div className="row h-100">
        <div className="col-md-12">
          <RequestCards />
        </div>
      </div>
    </div>
  );
}

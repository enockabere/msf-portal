"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import RequestCards from "@/app/components/request/RequestCards";
import { useAdvance } from "@/app/context/AdvanceContext";

export default function MakeRequestClient() {
  const { setBreadcrumb } = useBreadcrumb();
  const { actions } = useAdvance();
  const { fetchImprestsPendingSettlement } = actions;

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      { label: "Make Request", path: "/dashboard/make-request" },
    ]);
  }, [setBreadcrumb]);

  useEffect(() => {
    fetchImprestsPendingSettlement();
  }, [fetchImprestsPendingSettlement]);

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

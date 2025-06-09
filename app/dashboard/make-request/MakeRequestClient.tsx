"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import RequestCards from "@/app/components/request/RequestCards";
import { getResource } from "@/app/lib/api/http";
import { useAdvance } from "@/app/context/AdvanceContext";

export default function MakeRequestClient() {
  const { setBreadcrumb } = useBreadcrumb();
  const { actions } = useAdvance();
  const { dispatcher } = actions;

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      { label: "Make Request", path: "/dashboard/make-request" },
    ]);
  }, [setBreadcrumb]);

  useEffect(() => {
    const ocludedStatuses = ['Draft', 'Pending', 'Approved', 'Issued', 'Accounted'];
    let query: string;
    ocludedStatuses.forEach((ocludedStatus) => {
      if (query) {
        query = `${query} or imprestStatus eq '${ocludedStatus}'`;
      } else {
        query = `imprestStatus eq '${ocludedStatus}'`;
      }
    });
    const fetchImprestPendingSettlement = async () => {
      const imprest = await getResource(`imprest`, {
        params: {
          returnRecords: false,
          '$count': true,
          '$filter': query,
        }
      });
      dispatcher({
        type: 'PATCH_ADVANCE_TYPES_DISABLE_STATUS',
        payload: {
          key: 'Other',
          disabled: !!imprest,
        },
      })
    }
    fetchImprestPendingSettlement();
  }, [dispatcher]);

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

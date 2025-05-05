"use client";

import { useEffect, useState } from "react";
import { useEmployee } from "@/app/context/EmployeeContext";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import AdvanceSummaryCard from "@/app/components/advances/AdvanceSummaryCard";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const FilteredAdvanceTable = dynamic(
  () => import("@/app/components/advances/FilteredAdvanceTable"),
  { ssr: false }
);

export default function AdvancesClient() {
  const { employee } = useEmployee();
  const { setBreadcrumb } = useBreadcrumb();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [placement, setPlacement] = useState<
    "right" | "top" | "bottom" | "left"
  >("bottom");
  useEffect(() => {
    const saved = localStorage.getItem("advancePlacement") as
      | "right"
      | "top"
      | "bottom"
      | "left"
      | null;

    if (saved && saved !== placement) {
      setPlacement(saved);
    }
  }, []);

  const handleChangePlacement = (
    newPlacement: "right" | "top" | "bottom" | "left"
  ) => {
    setPlacement(newPlacement);
    localStorage.setItem("advancePlacement", newPlacement);
  };

  return (
    <div className="page-content dashboard-container p-3">
      {placement === "top" && (
        <div className="row gx-1 mb-2">
          <div className="col-12">
            <AdvanceSummaryCard
              layout="horizontal"
              currentPlacement={placement}
              onPlacementChange={handleChangePlacement}
              filteredCount={9}
              statusFilter="Open"
              typeFilter={["Salary", "Travel"]}
            />
          </div>
        </div>
      )}

      <div className="row gx-1">
        {placement === "left" && (
          <>
            <div className="col-lg-3">
              <AdvanceSummaryCard
                layout="vertical"
                currentPlacement={placement}
                onPlacementChange={handleChangePlacement}
                filteredCount={9}
                statusFilter="Open"
                typeFilter={["Salary", "Travel"]}
              />
            </div>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <FilteredAdvanceTable
                  employee={{
                    number: employee?.number || "",
                    nationalId: employee?.nationalId || "",
                    mobilePhone: employee?.mobilePhone || "",
                  }}
                />
              </div>
            </div>
          </>
        )}

        {placement === "right" && (
          <>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <FilteredAdvanceTable
                  employee={{
                    number: employee?.number || "",
                    nationalId: employee?.nationalId || "",
                    mobilePhone: employee?.mobilePhone || "",
                  }}
                />
              </div>
            </div>
            <div className="col-lg-3">
              <AdvanceSummaryCard
                layout="vertical"
                currentPlacement={placement}
                onPlacementChange={handleChangePlacement}
                filteredCount={9}
                statusFilter="Open"
                typeFilter={["Salary", "Travel"]}
              />
            </div>
          </>
        )}

        {(placement === "top" || placement === "bottom") && (
          <div className="col-12">
            <div className="card h-100 p-2">
              <FilteredAdvanceTable
                employee={{
                  number: employee?.number || "",
                  nationalId: employee?.nationalId || "",
                  mobilePhone: employee?.mobilePhone || "",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {placement === "bottom" && (
        <div className="row gx-1 mt-2">
          <div className="col-12">
            <AdvanceSummaryCard
              layout="horizontal"
              currentPlacement={placement}
              onPlacementChange={handleChangePlacement}
              filteredCount={9}
              statusFilter="Open"
              typeFilter={["Salary", "Travel"]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

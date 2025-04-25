"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useEmployee } from "@/app/context/EmployeeContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { employee } = useEmployee();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!employee) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", pathname);
      }
      router.replace("/auth");
    }
  }, [employee, router, pathname]);

  if (!employee) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
        <img src="/assets/images/favicon.png" width={60} />
        <p className="mt-3 text-muted">Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}

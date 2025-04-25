"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEmployee } from "@/app/context/EmployeeContext";
import styles from "../auth.module.css";

export default function CallbackPage() {
  const router = useRouter();
  const { setEmployee } = useEmployee();

  useEffect(() => {
    const fetchUserAndEmployee = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) return;

      try {
        const tokenRes = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const tokenData = await tokenRes.json();
        const access_token = tokenData.access_token;

        const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        const userData = await graphRes.json();
        const email = userData.mail || userData.userPrincipalName;

        const employeeRes = await fetch(
          `/api/auth/employee?email=${email}`
        );
        const employeeJson = await employeeRes.json();
        const employee = employeeJson?.data?.value?.[0];

        if (employee) {
          // Persist to localStorage for reload resilience
          localStorage.setItem("employee", JSON.stringify(employee));
          setEmployee(employee);

          const redirectTo =
            sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
          sessionStorage.removeItem("redirectAfterLogin");
          router.push(redirectTo);
        } else {
          console.error("No employee found in the system.");
        }
      } catch (err) {
        console.error("Authentication failed:", err);
      }
    };

    fetchUserAndEmployee();
  }, [router, setEmployee]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light text-center">
      <div className={styles.spinnerContainer}>
        <Image
          src="/assets/images/logo-light.png"
          alt="Microsoft Logo"
          width={140}
          height={70}
          className={styles.pulseZoom}
        />
      </div>
      <h5 className="mt-4 text-primary">Loading your profile...</h5>
      <small className="text-muted">
        Please wait while we finalize your login
      </small>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Image from "next/image";
import styles from "./auth.module.css";

export default function AuthPage() {
  useEffect(() => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
      response_type: "code",
      redirect_uri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI!,
      response_mode: "query",
      scope:
        "openid profile email offline_access https://graph.microsoft.com/.default",
    });

    const redirectUrl = `https://login.microsoftonline.com/${
      process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID
    }/oauth2/v2.0/authorize?${params.toString()}`;

    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
      <h5 className="mt-4 text-primary">Signing you in with Microsoft...</h5>
      <small className="text-muted">
        Please wait while we redirect you securely
      </small>
    </div>
  );
}

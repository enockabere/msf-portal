"use client";

import { useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePageLoader } from "../../context/PageLoaderContext";

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { actions } = usePageLoader();
  const { dispatcher } = actions;

  const handleNavigate = (href: string) => {
    dispatcher({
      type: "PATCH_LOADING_STATE",
      payload: { loading: true, message: "Redirecting..." },
    });

    startTransition(() => {
      router.replace(href);
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: false, message: "" },
      });
    });
  };

  useEffect(() => {
    if (status === "loading") return;

    const loginAttempt = sessionStorage.getItem("loginAttempt");
    if (!loginAttempt) return;

    sessionStorage.removeItem("loginAttempt");

    if (session?.error) {
      handleNavigate("/error-pages/500");
    } else if (session?.user?.profile) {
      handleNavigate("/dashboard");
    } else {
      handleNavigate("/error-pages/500");
    }
  }, [status, session]);

  return null;
}

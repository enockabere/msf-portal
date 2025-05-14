"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageLoader } from "@/app/context/PageLoaderContext";

export default function RouteChangeLoader() {
  const pathname = usePathname();
  const { hideLoader } = usePageLoader();

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        hideLoader();
      },
      pathname === "/dashboard" ? 150 : 300
    );

    return () => clearTimeout(timeout);
  }, [pathname, hideLoader]);

  return null;
}

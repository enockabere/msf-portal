"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageLoader } from "@/app/context/PageLoaderContext";

export default function RouteChangeLoader() {
  const pathname = usePathname();
  const { hideLoader } = usePageLoader();

  useEffect(() => {
    const timeout = setTimeout(() => {
      hideLoader();
    }, 300); // wait for route to mount and content to render

    return () => clearTimeout(timeout);
  }, [pathname, hideLoader]);

  return null;
}

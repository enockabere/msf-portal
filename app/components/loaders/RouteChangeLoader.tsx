"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageLoader } from "@/app/context/PageLoaderContext";

export default function RouteChangeLoader() {
  const pathname = usePathname();
  const { hideLoader } = usePageLoader();

  useEffect(() => {
    const timer = setTimeout(() => {
      hideLoader();
    }, 500);
    return () => clearTimeout(timer);
  }, [pathname, hideLoader]);

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageLoader } from "@/app/context/PageLoaderContext";

export default function RouteChangeLoader() {
  const pathname = usePathname();
  const { hideLoader } = usePageLoader();

  useEffect(() => {
    let raf: number;

    const onFrame = () => {
      raf = window.requestAnimationFrame(() => {
        setTimeout(() => {
          hideLoader();
        }, 100);
      });
    };
    onFrame();

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname, hideLoader]);

  return null;
}

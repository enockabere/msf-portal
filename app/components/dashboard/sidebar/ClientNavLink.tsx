"use client";

import { useRouter } from "next/navigation";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import { startTransition } from "react";

interface ClientNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}
export default function ClientNavLink({
  href,
  children,
  className = "",
}: ClientNavLinkProps) {
  const router = useRouter();
  const { actions } = usePageLoader();
  const { dispatcher } = actions;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatcher({
      type: 'PATCH_LOADING_STATE',
      payload: {
        loading: true,
        message: '',
      }
    });
    startTransition(() => (router.push(href), dispatcher({
      type: 'PATCH_LOADING_STATE',
      payload: {
        loading: false,
        message: '',
      }
    })));
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { usePageLoader } from "@/app/context/PageLoaderContext";

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
  const { showLoader } = usePageLoader();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showLoader();
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

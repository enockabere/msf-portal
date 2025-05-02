"use client";

import { useSession } from "next-auth/react";
import LoadingScreen from "../components/modals/LoadingScreen";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession({
    required: true,
  })
  if (status === 'loading') {
    return <LoadingScreen />
  }

  return <>{children}</>;
}

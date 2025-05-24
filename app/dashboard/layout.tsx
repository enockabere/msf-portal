"use client";

import Topbar from "../components/dashboard/topbar/Topbar";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import { BreadcrumbProvider } from "../context/BreadcrumbContext";
import {
  usePageLoader,
} from "../context/PageLoaderContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import PageLoader from "../components/loaders/PageLoader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1">
            <Topbar />
            <div className="page-wrapper relative">
              {children}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </BreadcrumbProvider>
  );
}

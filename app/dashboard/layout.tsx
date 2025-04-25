"use client";

import Topbar from "../components/dashboard/topbar/Topbar";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import { BreadcrumbProvider } from "../context/BreadcrumbContext";
import { MySetupsProvider } from "../context/SetupContext";
import ProtectedRoute from "../auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MySetupsProvider>
      <BreadcrumbProvider>
        <ProtectedRoute>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Topbar />
              <div className="page-wrapper">{children}</div>
            </div>
          </div>
        </ProtectedRoute>
      </BreadcrumbProvider>
    </MySetupsProvider>
  );
}

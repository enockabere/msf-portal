"use client";

import Topbar from "../components/dashboard/topbar/Topbar";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import { BreadcrumbProvider } from "../context/BreadcrumbContext";
import {
  PageLoaderProvider,
  usePageLoader,
} from "../context/PageLoaderContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import RouteChangeLoader from "../components/loaders/RouteChangeLoader";
import PageLoader from "../components/loaders/PageLoader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageLoaderProvider>
      <BreadcrumbProvider>
        <ProtectedRoute>
          <RouteChangeLoader />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Topbar />
              <div className="page-wrapper relative">
                <PageLoaderWrapper />
                {children}
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </BreadcrumbProvider>
    </PageLoaderProvider>
  );
}

function PageLoaderWrapper() {
  const { loading } = usePageLoader(); // This comes from PageLoaderContext
  return loading ? <PageLoader /> : null;
}

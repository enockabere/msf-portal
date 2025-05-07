"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PageLoaderContextType = {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
};

const PageLoaderContext = createContext<PageLoaderContextType | undefined>(
  undefined
);

export function PageLoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setTimeout(() => setLoading(false), 500); // Smooth UX

  return (
    <PageLoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </PageLoaderContext.Provider>
  );
}

export function usePageLoader(): PageLoaderContextType {
  const context = useContext(PageLoaderContext);
  if (!context) {
    throw new Error("usePageLoader must be used within a PageLoaderProvider");
  }
  return context;
}

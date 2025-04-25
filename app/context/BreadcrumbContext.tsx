"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Breadcrumb = {
  label: string;
  path: string;
}[];

type BreadcrumbContextType = {
  breadcrumb: Breadcrumb;
  setBreadcrumb: (b: Breadcrumb) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb>([]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context)
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  return context;
}

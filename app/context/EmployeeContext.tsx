"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface EmployeeContextType {
  employee: any;
  setEmployee: (data: any) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export const EmployeeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [employee, setEmployee] = useState<any>(null);
  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    }
  }, []);
  useEffect(() => {
    if (employee) {
      localStorage.setItem("employee", JSON.stringify(employee));
    } else {
      localStorage.removeItem("employee");
    }
  }, [employee]);

  return (
    <EmployeeContext.Provider value={{ employee, setEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
};

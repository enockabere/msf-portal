"use client";

import React, { useState, useEffect } from "react";
import "./SalaryAdvanceForm.css";
import ProgressIndicator from "./Operational/ProgressIndicator";
import OperationalHeaderStep from "./Operational/OperationalHeaderStep";
import OperationalLineStep from "./Operational/OperationalLineStep";
import { ExpenseItem, FormData } from "@/app/types/advance";
import { findObjectFromArray } from "@/app/utils/helpers";
import { useMySetups } from "@/app/context/SetupContext";
import { useSession } from "next-auth/react";
import { EndpointOptions } from "@/app/types/global";
import { ENDPOINTMAP } from "@/app/utils/endpointMap";

export default function OperationalAdvanceForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    purpose: "",
    amount: "0",
    currency: "KES",
    paymentMethod: "",
    cashCollectionDate: "",
    cashHours: "morning",
    idPassportNumber: "",
    accountNo: "1234567890",
    bank: "Equity Bank",
    branch: "Westlands",
    chequeName: "",
    swiftCode: "",
    phoneNo: "712345678",
  });
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { paymentMethods, fetchSetups } = useMySetups();
  const { data } = useSession()

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpenseChange = <K extends keyof ExpenseItem>(
    index: number,
    field: K,
    value: ExpenseItem[K]
  ) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...expenses];
    updated[index].receipt = file;
    setExpenses(updated);
  };

  const removeExpenseLine = (index: number) => {
    const updated = [...expenses];
    updated.splice(index, 1);
    setExpenses(updated);
  };

  const addExpenseLine = () => {
    setExpenses((prev) => [
      ...prev,
      {
        category: "",
        amount: NaN,
        receipt: null,
        mileage: "",
        costCenter: "",
        project: "",
        otherCategory: "",
      },
    ]);
  };

  const handleSaveLine = (index: number, item: ExpenseItem) => {
    const updated = [...expenses];
    updated[index] = item;
    setExpenses(updated);
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handlePrev = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    console.log("Form submitted", { formData, expenses });
    setIsSubmitted(true);
  };

  const handleSurrender = () => {
    console.log("Apply for surrender");
  };

  const getProfileValues = async () => {
    if (!formData.paymentMethod) return null;
    const type: string = findObjectFromArray(paymentMethods, 'code', formData.paymentMethod)?.type as string;
    switch (type) {
      case 'Mpesa': {
        handleFormChange('phoneNo', String(data.user?.profile?.phoneNo));
        handleFormChange('idPassportNumber', String(data.user?.profile?.identificationDocumentNo));
        break;
      }
      case "Cheques":
      case "Bank_x0020_Transfer": {
        if (data.user?.profile?.type !== 'Employee') return
        await fetchSetups([
          {
            'employeeBanks': {
              filters: {
                employee: data.user?.profile?.no
              }
            } as EndpointOptions
          } as Record<ENDPOINTMAP, EndpointOptions>
        ]);
        handleFormChange('phoneNo', String(data.user?.profile?.phoneNo));
        handleFormChange('phoneNo', String(data.user?.profile?.phoneNo));
        handleFormChange('phoneNo', String(data.user?.profile?.phoneNo));
      }
    }
  }

  useEffect(() => {
    const total = expenses.reduce(
      (acc, item) => acc + (isNaN(item.amount) ? 0 : item.amount),
      0
    );
    setFormData((prev) => ({ ...prev, amount: total.toString() }));
  }, [expenses]);

  useEffect(() => {
    getProfileValues();
  }, [formData.paymentMethod, formData.phoneNo])

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row flex-grow-1">
        <div className="col-md-9">
          {currentStep === 1 ? (
            <OperationalHeaderStep
              formData={formData}
              onFormChange={handleFormChange}
              onNext={handleNext}
            />
          ) : (
            <OperationalLineStep
              expenses={expenses}
              onExpenseChange={handleExpenseChange}
              onFileChange={handleFileChange}
              onRemoveExpense={removeExpenseLine}
              onAddExpense={addExpenseLine}
              onSaveLine={handleSaveLine}
              onSubmit={handleSubmit}
              onCancel={handlePrev}
              onSurrender={handleSurrender}
            />
          )}
        </div>
        <div className="col-md-3">
          <ProgressIndicator
            currentStep={currentStep}
            isSubmitted={isSubmitted}
          />
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center gap-2">
        {[1, 2].map((step) => (
          <div
            key={step}
            className={`rounded-circle ${currentStep === step ? "bg-danger" : "bg-secondary"
              }`}
            style={{
              width: "10px",
              height: "10px",
              opacity: currentStep === step ? 1 : 0.5,
              transition: "all 0.3s ease",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

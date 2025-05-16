"use client";

import React, { useState, useEffect } from "react";
import "./SalaryAdvanceForm.css";
import ProgressIndicator from "./Operational/ProgressIndicator";
import OperationalHeaderStep from "./Operational/OperationalHeaderStep";
import OperationalLineStep from "./Operational/OperationalLineStep";
import { ExpenseItem, FormData } from "@/app/types/advance";
import { checkIfMissingRequiredProperty, findObjectFromArray, removeNullAndUndefinedFromObject, removeObjectProps } from "@/app/utils/helpers";
import { useMySetups } from "@/app/context/SetupContext";
import { useSession } from "next-auth/react";
import { createResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { formatDate } from "@/app/utils/dateFormats";

export default function OperationalAdvanceForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    imprestType: "",
    Purpose: "",
    amountToPayHeader: null,
    currencyCode: "",
    paymentMethod: "",
    cashCollectionDate: "",
    cashHours: "",
    idPassportNumber: "",
    accountNo: "",
    bankNo: "",
    branch: "",
    swiftCode: "",
    phoneNo: "",
    accountName: "",
  });
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { paymentMethods, employeeBanks, fetchSetups } = useMySetups();
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

  const handleNext = async () => {
    try {
      const pDate = new Date().toISOString();
      const presets: Record<string, any> = {
        documentType: 'Imprest',
        postingDate: formatDate(pDate, 'yyyy-MM-dd'),
        employeeNo: data.user?.profile?.no,
        requestedBy: data.user?.profile?.no,
        requestedByFor: data.user?.profile?.no
      };
      const strippedPayLoad = removeNullAndUndefinedFromObject({ ...formData, ...presets });
      const knownSchema = removeObjectProps(strippedPayLoad, ['cashCollectionDate', 'idPassportNumber', 'accountNo', 'branch', 'swiftCode']);
      const isMissingRequiredProp = checkIfMissingRequiredProperty(knownSchema, ['documentType', 'imprestType', 'postingDate', 'employeeNo', 'currencyCode']);
      if (!isMissingRequiredProp) return Swal.fire("Validation Error!", `Not a valid payload`);
      if (isMissingRequiredProp.missing) {
        return Swal.fire("Validation Error!", `Missing [${isMissingRequiredProp.prop.join(",")}] ${isMissingRequiredProp.prop.length > 1 ? 'Properties' : 'Property'}`);
      }
      const res = await createResource('imprest', {
        data: knownSchema,
      });
      if (res.error) {
        return Swal.fire(res.error.code, res.error.message);
      }
      setFormData({ ...res.value });
      Swal.fire("Success", `${formData.imprestType} advance was created successfully!`);
      await fetchSetups([
        {
          expenseCodes: {
            filters: {
              imprestType: formData.imprestType
            }
          }
        }
      ])
      setCurrentStep(2);
    } catch (error: any) {
      Swal.fire('Error!', error.message)
    }
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
          "banks",
          {
            employeeBanks: {
              filters: {
                employee: data.user?.profile?.no,
                default: true,
              }
            }
          }
        ]);
      }
    }
  }

  const getBankBranches = async () => {
    console.log("Bank changed: ", formData.bankNo)
    if (!formData.bankNo || formData.bankNo === "undefined" || formData.bankNo === "null") return null;
    await fetchSetups([
      {
        bankBranches: {
          filters: {
            mainBank: formData.bankNo,
          }
        }
      }
    ], true);
  }

  const updateEmployeeBank = () => {
    const bankDetails = employeeBanks[0];
    if (bankDetails && Object.keys(bankDetails).length) {
      handleFormChange('accountNo', bankDetails.accountNo);
      handleFormChange('accountName', bankDetails.name);
      handleFormChange('bankNo', bankDetails.bankCode);
      handleFormChange('branch', bankDetails.bankBranch);
      handleFormChange('swiftCode', bankDetails.swiftCode);
    }
  }
  useEffect(() => {
    const total = expenses.reduce(
      (acc, item) => acc + (isNaN(item.amount) ? 0 : item.amount),
      0
    );
    setFormData((prev) => ({ ...prev, amountToPayHeader: total || null }));
  }, [expenses]);

  useEffect(() => {
    getProfileValues();
  }, [formData.paymentMethod]);

  useEffect(() => {
    getBankBranches();
  }, [formData.bankNo]);

  useEffect(() => { updateEmployeeBank() }, [employeeBanks]);

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

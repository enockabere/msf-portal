"use client";

import React, { useState, useEffect } from "react";
import "./SalaryAdvanceForm.css";
import ProgressIndicator from "./Operational/ProgressIndicator";
import OperationalHeaderStep from "./Operational/OperationalHeaderStep";
import OperationalLineStep from "./Operational/OperationalLineStep";
import { ExpenseItem, FormData } from "@/app/types/advance";
import { checkIfMissingRequiredProperty, constructDimension, findObjectFromArray, removeNullAndUndefinedFromObject, removeObjectProps, safeTypechecker } from "@/app/utils/helpers";
import { useMySetups } from "@/app/context/SetupContext";
import { useSession } from "next-auth/react";
import { batchRequest, createResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { formatDate } from "@/app/utils/dateFormats";
import { batchRequestOptions, BatchRequestResponse } from "@/app/types/options";

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
  const [paymentMethodType, setPaymentMethodType] = useState<string>('');
  const { paymentMethods, employeeBanks, DEPARTMENTS, PROJECT, expenseCodes, fetchSetups } = useMySetups();
  const { data } = useSession()

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    handleSettingPaymentMethodType();
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

  function handleSettingPaymentMethodType() {
    if (!formData.paymentMethod) return null;
    const type: string = findObjectFromArray(paymentMethods, 'code', formData.paymentMethod)?.type as string;
    setPaymentMethodType(type);
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
        expenseCode: "",
        unitCost: NaN,
        description: "",
        costCenter: "",
        project: "",
      },
    ]);
  };

  const handleSaveLine = (index: number, item: ExpenseItem) => {
    const updated = [...expenses];
    updated[index] = item;
    setExpenses(updated);
  };

  const handleNext = async () => {
    Promise.all([
      fetchSetups([
        {
          dimensions: {
            $filter: `dimensionCode eq 'DEPARTMENTS' or dimensionCode eq 'PROJECT'`
          }
        }
      ]),
      fetchSetups([
        {
          expenseCodes: {
            filters: {
              imprestType: formData.imprestType
            }
          }
        }
      ], true),
    ])
    setCurrentStep(2);
  };

  const handlePrev = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
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
    } catch (error: any) {
      Swal.fire('Error!', error.message);
    }
  };

  async function handleSubmittingAdvanceLine(header: FormData) {
    try {
      const defaults = {
        documentType: 'Imprest',
        documentNo: header.no,
        Quantity: 1,
      };
      const expenseRequestOption = expenses.map((expense: ExpenseItem) => {
        const costCenterDimension = findObjectFromArray(DEPARTMENTS, 'code', expense.costCenter);
        const projectDimension = findObjectFromArray(PROJECT, 'code', expense.project);
        const glAccount = findObjectFromArray(expenseCodes, 'code', expense.expenseCode);
        if (safeTypechecker(glAccount) !== 'Object') return {};
        expense[constructDimension(costCenterDimension)] = expense.costCenter;
        expense[constructDimension(projectDimension)] = expense.project;
        expense.description = glAccount.description as string;
        delete expense.costCenter;
        delete expense.project;
        const linePayload = {
          ...expense,
          ...defaults,
        };
        const strippedLinePayload = removeNullAndUndefinedFromObject(linePayload);
        const validSchema = removeObjectProps(strippedLinePayload, ['costCenter', 'project']);
        const validateRequiredProps = checkIfMissingRequiredProperty(validSchema, ['documentNo', 'documentType', 'expenseCode', 'unitCost', 'Quantity']);
        if (!validateRequiredProps) return {};
        if (validateRequiredProps.missing) {
          return {};
        }
        return {
          method: 'POST',
          endpoint: 'imprestLine',
          data: validSchema,
        } satisfies batchRequestOptions
      });
      const addedLines = expenses.length;
      const lineCaption = addedLines > 1 ? 'lines' : 'line';
      if (expenseRequestOption.length) {
        if (expenseRequestOption.length !== expenses.length) Swal.fire('Alert!', `${addedLines > 1 ? 'Some' : 'The'} advance ${lineCaption} will not be submitted due to errors`);
        const res: BatchRequestResponse = await batchRequest({
          batch: expenseRequestOption,
        });
        if (res.error) {
          Swal.fire(`${res.error.code}`, `${res.error.message}`, 'error');
        } else {
          let failedLines = 0;
          for (const [_key, value] of Object.entries(res)) {
            if (value.error) {
              failedLines++;
            }
          }
          if (failedLines) {
            Swal.fire('Error creating advance lines', `${failedLines} advances did not save!`, 'error');
          } else {
            Swal.fire('Success', `Your advance was created successfully with ${addedLines} lines.`, 'success');
          }
        }

      } else {
        return Swal.fire(`Error creating Advance ${lineCaption}`, `The advance ${lineCaption} you added had errors and did not submit!`, 'error');
      }
    } catch (error) {
      Swal.fire('Error!', error.message, 'error');
    }
  }
  const handleSurrender = () => {
    console.log("Apply for surrender");
  };

  const getProfileValues = async () => {
    if (!formData.paymentMethod) return null;
    switch (paymentMethodType) {
      case 'Mpesa': {
        updateMobileMoneyFields();
        updateEmployeeBank(true);
        updateCashFields(true);
        break;
      }
      case "Cheques":
      case "Bank_x0020_Transfer": {
        if (data.user?.profile?.type !== 'Employee') return
        Promise.allSettled([
          fetchSetups([
            "banks",
          ]),
          fetchSetups([
            {
              employeeBanks: {
                filters: {
                  employee: data.user?.profile?.no,
                  default: true,
                }
              }
            }
          ], true),
        ])
        break;
      }
      case 'Cash': {
        updateMobileMoneyFields(true);
        updateEmployeeBank(true);
        break;
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
  function updateMobileMoneyFields(clear: boolean = false) {
    if (clear) {
      handleFormChange('phoneNo', "");
      handleFormChange('idPassportNumber', "");
    } else {
      handleFormChange('phoneNo', String(data.user?.profile?.phoneNo));
      handleFormChange('idPassportNumber', String(data.user?.profile?.identificationDocumentNo));
    }
  }
  function updateEmployeeBank(clear: boolean = false) {
    if (clear) {
      handleFormChange('accountNo', "");
      handleFormChange('accountName', "");
      handleFormChange('bankNo', "");
      handleFormChange('branch', "");
      handleFormChange('swiftCode', "");
    } else {
      const bankDetails = employeeBanks[0];
      if (bankDetails && Object.keys(bankDetails).length) {
        handleFormChange('accountNo', bankDetails.accountNo);
        handleFormChange('accountName', bankDetails.name);
        handleFormChange('bankNo', bankDetails.bankCode);
        handleFormChange('branch', bankDetails.bankBranch);
        handleFormChange('swiftCode', bankDetails.swiftCode);
      }
    }
  }

  function updateCashFields(clear: boolean = false) {
    if (clear) {
      handleFormChange('cashCollectionDate', "");
      handleFormChange('cashHours', "");
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
  }, [paymentMethodType])

  useEffect(() => {
    getBankBranches();
  }, [formData.bankNo]);

  useEffect(() => {
    updateEmployeeBank(paymentMethodType !== 'Cheques' && paymentMethodType !== 'Bank_x0020_Transfer');
    updateMobileMoneyFields(paymentMethodType !== 'Mpesa');
    updateCashFields(paymentMethodType !== 'Cash');
  }, [employeeBanks, formData.paymentMethod, paymentMethodType]);

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
              currency={formData.currencyCode}
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

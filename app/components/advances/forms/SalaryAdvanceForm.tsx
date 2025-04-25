"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SalaryAdvanceForm.css";
import { useMySetups } from "@/app/context/SetupContext";
import ActionButtons from "./components/ActionButtons";
import MpesaDetails from "./components/MpesaDetails";
import BankDetails from "./components/BankDetails";
import SalaryAdvanceHeader from "./components/SalaryAdvanceHeader";
import SalaryAdvanceFields from "./components/SalaryAdvanceFields";
import { SalaryAdvanceData } from "@/app/types/advance";

const SkeletonLoader = ({
  height = "38px",
  width = "100%",
}: {
  height?: string;
  width?: string;
}) => <div className="skeleton-loader" style={{ height, width }} />;

const FormRowSkeleton = () => (
  <div className="row mb-3">
    <div className="col-md-6">
      <div className="skeleton-label" />
      <SkeletonLoader />
    </div>
    <div className="col-md-6">
      <div className="skeleton-label" />
      <SkeletonLoader />
    </div>
  </div>
);

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <div className="loading-content">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Preparing your salary advance form...</p>
    </div>
  </div>
);

interface SalaryAdvanceFormProps {
  advance?: SalaryAdvanceData | null;
  isViewMode?: boolean;
  onSuccess?: () => void;
  employeeNo?: string;
}

export default function SalaryAdvanceForm({
  advance = null,
  isViewMode = false,
  onSuccess,
  employeeNo,
}: SalaryAdvanceFormProps) {
  const advanceNo = advance?.no;
  const advanceBankCode = advance?.bankCode;
  const advanceApplicationAmount = advance?.applicationAmount;
  const advancePaymentMethod = advance?.paymentMethod;
  const advanceCurrencyCode = advance?.currencyCode;
  const advanceAccountNo = advance?.accountNo;
  const advanceChequeName = advance?.chequeName;
  const advanceSwiftCode = advance?.swiftCode;
  const advanceMobilePhoneNo = advance?.mobilePhoneNo;
  const advanceIdNo = advance?.identificationDocumentNo;
  const advanceEmployeeBranchCode = advance?.employeeBranchCode;
  const advanceApplicationDate = advance?.applicationDate;
  const advanceStatus = advance?.status;
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceLimit, setAdvanceLimit] = useState<number | null | undefined>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState("RTGS");
  const [currency, setCurrency] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [bank, setBank] = useState("");
  const [branch, setBranch] = useState("");
  const [chequeName, setChequeName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLimitLoading, setIsLimitLoading] = useState(false);
  const [savedAdvanceNo, setSavedAdvanceNo] = useState<string | undefined>(
    advanceNo
  );
  const [cutoffPassed, setCutoffPassed] = useState(false);

  const {
    currencies,
    paymentMethods,
    banks,
    bankBranches,
    payrollPeriods,
    employeeBanks,
    fetchSetups,
  } = useMySetups();

  const filteredBranches = useMemo(
    () => bankBranches.filter((b) => b.mainBank === bank),
    [bankBranches, bank]
  );
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchSetups([
          "currencies",
          { paymentMethods: { filters: { isAdvance: true } } },
          "banks",
          "bankBranches",
          { payrollPeriods: { filters: { current: true } } },
          {
            employeeBanks: {
              filters: {
                employee: employeeNo,
                ...(advanceBankCode
                  ? { bankCode: advanceBankCode }
                  : { default: true }),
              },
            },
          } as any,
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchSetups, employeeNo, advanceBankCode]);

  useEffect(() => {
    if (payrollPeriods.length > 0) {
      const period = payrollPeriods[0];
      const cutoff = period.advanceCutOffDate;

      if (cutoff && cutoff !== "0001-01-01") {
        const now = new Date();
        const cutoffDate = new Date(cutoff);

        console.log("🕓 Parsed cutoff date:", cutoffDate.toISOString());
        console.log("🕓 Current date:", now.toISOString());

        if (now > cutoffDate) {
          setCutoffPassed(true);
          toast.error("The advance application deadline has passed.");
        }
      } else {
        console.warn("⚠️ No valid cutoff date found.");
      }
    }
  }, [payrollPeriods]);

  useEffect(() => {
    if (currencies.length && paymentMethods.length && bankBranches.length) {
      setAdvanceAmount(advanceApplicationAmount?.toString() || "");

      if (advanceCurrencyCode) {
        setCurrency(advanceCurrencyCode);
        setPaymentMethod(advancePaymentMethod || "RTGS");
      } else if (!advanceNo) {
        setCurrency("KES");
        setPaymentMethod("MPESA");
      }

      setAccountNo(advanceAccountNo || "");
      setBank(advanceBankCode || "");
      setChequeName(advanceChequeName || "");
      setSwiftCode(advanceSwiftCode || "");
      setPhone(advanceMobilePhoneNo?.replace("+254", "") || "");
      setIdNumber(advanceIdNo || "");

      const validBranch = bankBranches.find(
        (b) => b.branchNo === advanceEmployeeBranchCode
      );
      if (validBranch) {
        setBranch(validBranch.branchNo);
      }
    }
  }, [
    currencies.length,
    paymentMethods.length,
    bankBranches,
    advanceApplicationAmount,
    advancePaymentMethod,
    advanceCurrencyCode,
    advanceAccountNo,
    advanceBankCode,
    advanceChequeName,
    advanceSwiftCode,
    advanceMobilePhoneNo,
    advanceIdNo,
    advanceEmployeeBranchCode,
    advanceNo,
  ]);
  useEffect(() => {
    if (!advanceNo && employeeBanks?.length > 0) {
      const eb = employeeBanks[0];
      if (eb.accountNo) setAccountNo(eb.accountNo);
      if (eb.bankCode) setBank(eb.bankCode);
      if (eb.bankBranch) setBranch(eb.bankBranch);
      if (eb.currency) setCurrency(eb.currency);
      if (eb.name) setChequeName(eb.name);
      if (eb.swiftCode) setSwiftCode(eb.swiftCode);
    }
  }, [advanceNo, employeeBanks]);
  useEffect(() => {
    if (!advanceAmount) {
      setAdvanceLimit(null);
      return;
    }

    const id = setTimeout(() => {
      setIsLimitLoading(true);
      fetch("/selfservice/api/codeunit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empNo: employeeNo }),
      })
        .then((r) => r.json())
        .then((payload) => {
          const val = payload.limit?.value;
          setAdvanceLimit(typeof val === "number" ? val : null);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch advance limit:", err);
          toast.error("Failed to load advance limit");
        })
        .finally(() => setIsLimitLoading(false));
    }, 500);
    return () => clearTimeout(id);
  }, [advanceAmount, employeeNo]);
  useEffect(() => {
    if (paymentMethod === "MPESA") {
      setCurrency("KES");
    }
  }, [paymentMethod]);
  useEffect(() => {
    if (filteredBranches.length && !advanceNo && !branch) {
      setBranch(filteredBranches[0].branchNo);
    }
  }, [filteredBranches, branch, advanceNo]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (cutoffPassed) {
        toast.error("You cannot apply after the cutoff date.");
        return;
      }

      if (
        typeof advanceLimit === "number" &&
        parseFloat(advanceAmount) > advanceLimit
      ) {
        toast.error("Requested advance amount exceeds your allowed limit.");
        return;
      }

      if (isViewMode) {
        return toast.info("View mode - no changes will be saved");
      }
      setIsSubmitting(true);

      try {
        if (!advanceAmount || isNaN(Number(advanceAmount))) {
          console.error(
            "❌ Validation failed: Invalid advance amount",
            advanceAmount
          );
          toast.error("Please enter a valid advance amount");
          return;
        }
        if (!payrollPeriods?.[0]?.startingDate) {
          console.error("❌ Validation failed: No valid payroll period");
          toast.error("No valid payroll period available");
          return;
        }

        const payload: any = {
          employeeCode: employeeNo,
          applicationAmount: Number(advanceAmount),
          currencyCode: currency,
          applicationDate:
            advanceApplicationDate || new Date().toISOString().split("T")[0],
          paymentMethod,
          payrollPeriod: payrollPeriods[0].startingDate,
        };

        if (paymentMethod === "MPESA") {
          payload.mobilePhoneNo = `+254${phone}`;
          payload.identificationDocumentNo = idNumber;
        } else {
          payload.accountNo = accountNo;
          payload.bankCode = bank;
          payload.employeeBranchCode = branch;
          payload.employeeBranchName =
            bankBranches.find((b) => b.branchNo === branch)?.name || "";
          payload.employeeBankName =
            banks.find((b) => b.no === bank)?.name || "";
          payload.chequeName = chequeName;
          if (paymentMethod === "RTGS") payload.swiftCode = swiftCode;
        }

        const isEdit = !!advanceNo;
        const endpoint = isEdit
          ? "/selfservice/api/bc/advances/salary/edit"
          : "/selfservice/api/bc/advances/salary/create";
        const method = isEdit ? "PATCH" : "POST";
        if (isEdit) {
          payload.no = advanceNo;
        }

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const response = await res.json();
        if (!res.ok || response.error) {
          throw new Error(
            response.error?.message || "Failed to process advance"
          );
        }

        const newAdvanceNo =
          response.no || response.data?.no || advanceNo || response.value?.no;
        if (!newAdvanceNo) {
          throw new Error("No advance number returned from server");
        }

        setSavedAdvanceNo(newAdvanceNo);
        const successMessage = isEdit
          ? `Salary advance #${newAdvanceNo} updated successfully!`
          : `Salary advance request #${newAdvanceNo} created successfully!`;
        toast.success(successMessage);

        try {
          const approvalRes = await fetch(
            "/selfservice/api/bc/advances/salary/sendApproval",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ advanceNo: newAdvanceNo }),
            }
          );

          const approvalJson = await approvalRes.json();
          if (!approvalRes.ok || approvalJson.error) {
            toast.warning("Saved but failed to submit for approval");
          } else {
            toast.success("Submitted for approval successfully");
          }
        } catch (approvalErr) {
          toast.warning("Saved but error occurred during approval submission");
        }

        onSuccess?.();
      } catch (error: any) {
        toast.error(error.message || "An error occurred while processing");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      cutoffPassed,
      advanceLimit,
      advanceAmount,
      isViewMode,
      payrollPeriods,
      employeeNo,
      currency,
      advanceApplicationDate,
      paymentMethod,
      phone,
      idNumber,
      accountNo,
      bank,
      branch,
      bankBranches,
      banks,
      chequeName,
      swiftCode,
      advanceNo,
      onSuccess,
    ]
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <form className="p-2 pt-3" onSubmit={handleSubmit}>
        {cutoffPassed && (
          <div className="alert alert-warning mt-3">
            <strong>Notice:</strong> Advance requests for this payroll period
            are no longer allowed. The cutoff date has passed.
          </div>
        )}

        {isLoading ? (
          <>
            <LoadingOverlay />
            <div className="skeleton-form">
              <FormRowSkeleton />
              <FormRowSkeleton />
              <FormRowSkeleton />
            </div>
          </>
        ) : (
          <>
            <SalaryAdvanceHeader advanceNo={advanceNo} status={advanceStatus} />
            <SalaryAdvanceFields
              advanceAmount={advanceAmount}
              setAdvanceAmount={setAdvanceAmount}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              currency={currency}
              setCurrency={setCurrency}
              currencies={currencies}
              paymentMethods={paymentMethods}
              advanceLimit={advanceLimit}
              isLimitLoading={isLimitLoading}
              isViewMode={isViewMode}
            />
            {paymentMethod === "MPESA" ? (
              <MpesaDetails
                phone={phone}
                setPhone={setPhone}
                idNumber={idNumber}
                setIdNumber={setIdNumber}
                isViewMode={isViewMode}
                required={currency === "KES" && paymentMethod === "MPESA"}
              />
            ) : (
              (paymentMethod === "CHEQUE" || paymentMethod === "RTGS") && (
                <BankDetails
                  accountNo={accountNo}
                  setAccountNo={setAccountNo}
                  bank={bank}
                  setBank={setBank}
                  branch={branch}
                  setBranch={setBranch}
                  chequeName={chequeName}
                  setChequeName={setChequeName}
                  swiftCode={swiftCode}
                  setSwiftCode={setSwiftCode}
                  paymentMethod={paymentMethod}
                  banks={banks}
                  filteredBranches={filteredBranches}
                  isViewMode={isViewMode}
                />
              )
            )}
          </>
        )}
        <ActionButtons
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          isViewMode={isViewMode}
          cutoffPassed={cutoffPassed}
          limitExceeded={
            typeof advanceLimit === "number" &&
            parseFloat(advanceAmount) > advanceLimit
          }
          status={advanceStatus || ""}
          advanceNo={savedAdvanceNo}
          onSuccess={onSuccess}
        />
      </form>
    </>
  );
}

"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
import Swal from "sweetalert2";

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
  employee?: {
    number: string;
    nationalId: string;
    mobilePhone: string;
    [key: string]: any;
  };
}

export default function SalaryAdvanceForm({
  advance = null,
  isViewMode = false,
  onSuccess,
  employee,
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
  const [currency, setCurrency] = useState("KES"); // Default to KES
  const [paymentMethod, setPaymentMethod] = useState("MPESA"); // Default to MPESA

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
  const didInitDefaults = useRef(false);
  const didSetInitialAmount = useRef(false);

  const employeeNo = employee?.number;

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
    () => bankBranches.filter((b: Record<string, any>) => b.mainBank === bank),
    [bankBranches, bank]
  );

  useEffect(() => {
    if (
      !advanceCurrencyCode &&
      !didInitDefaults.current &&
      currencies.length &&
      paymentMethods.length
    ) {
      setCurrency("KES");
      setPaymentMethod("MPESA"); // MPESA default for KES
      didInitDefaults.current = true;
    }
  }, [advanceCurrencyCode, currencies.length, paymentMethods.length]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const start = performance.now();
        await fetchSetups([
          "currencies",
          { paymentMethods: { filters: { isAdvance: true } } },
          { payrollPeriods: { filters: { current: true } } },
        ]);
        const mid = performance.now();
        console.log(
          `⚡ Critical setups fetched in ${(mid - start).toFixed(2)} ms`
        );
        fetchSetups([
          "banks",
          "bankBranches",
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
        ]).then(() => {
          const end = performance.now();
          console.log(
            `⚡ All setups fetched in ${(end - start).toFixed(2)} ms`
          );
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchSetups, employeeNo, advanceBankCode]);

  const displayedCurrencies = useMemo(() => {
    return [
      { code: "KES", description: "Kenyan Shilling" },
      ...currencies.filter((c: Record<string, any>) => c.code !== "KES"),
    ];
  }, [currencies]);

  useEffect(() => {
    if (payrollPeriods.length > 0) {
      const period: Record<string, any> = payrollPeriods[0];
      const cutoff = period.advanceCutOffDate;

      if (cutoff && cutoff !== "0001-01-01") {
        const now = new Date();
        const cutoffDate = new Date(cutoff);

        console.log("🕓 Parsed cutoff date:", cutoffDate.toISOString());
        console.log("🕓 Current date:", now.toISOString());

        if (now > cutoffDate) {
          if (
            advanceStatus !== "Pending Approval" &&
            advanceStatus !== "Released"
          ) {
            setCutoffPassed(true);
            toast.error("The advance application deadline has passed.");
          }
        }
      } else {
        console.warn("⚠️ No valid cutoff date found.");
      }
    }
  }, [payrollPeriods, advanceStatus]);

  useEffect(() => {
    if (currencies.length && paymentMethods.length && bankBranches.length) {
      if (!didSetInitialAmount.current) {
        setAdvanceAmount(advanceApplicationAmount?.toString() || "");
        didSetInitialAmount.current = true;
      }

      if (advanceCurrencyCode) {
        setCurrency(advanceCurrencyCode);
        setPaymentMethod(
          advanceCurrencyCode === "KES" || advanceCurrencyCode === ""
            ? "MPESA"
            : advancePaymentMethod || "RTGS"
        );
      } else {
        setCurrency("KES");
        setPaymentMethod("MPESA");
      }

      setAccountNo(advanceAccountNo || "");
      setBank(advanceBankCode || "");
      setChequeName(advanceChequeName || "");
      setSwiftCode(advanceSwiftCode || "");

      // ❗ Fix: Only set phone/idNumber if available in advance
      if (advanceMobilePhoneNo) {
        const cleanPhone = advanceMobilePhoneNo.startsWith("+254")
          ? advanceMobilePhoneNo.slice(4)
          : advanceMobilePhoneNo;
        setPhone(cleanPhone);
      }

      if (advanceIdNo) {
        setIdNumber(advanceIdNo);
      }

      const validBranch = bankBranches.find(
        (b: Record<string, any>) => b.branchNo === advanceEmployeeBranchCode
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
    advanceMobilePhoneNo, // ok to include
    advanceIdNo, // ok to include
    advanceEmployeeBranchCode,
  ]);

  useEffect(() => {
    if (currency && currency !== "KES") {
      if (paymentMethod === "MPESA" || paymentMethod === "") {
        setPaymentMethod("RTGS"); // or default to first non-MPESA method
      }
    } else if (currency === "KES" && paymentMethod === "") {
      setPaymentMethod("MPESA"); // Default for KES
    }
  }, [currency, paymentMethod]);

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

      fetch("/api/codeunit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empNo: employeeNo,
          currencyCode: currency === "KES" ? "" : currency,
        }),
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
  }, [advanceAmount, employeeNo, currency]);

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

  useEffect(() => {
    if (advanceMobilePhoneNo) {
      const cleanPhone = advanceMobilePhoneNo.startsWith("+254")
        ? advanceMobilePhoneNo.slice(4)
        : advanceMobilePhoneNo;
      setPhone(cleanPhone);
    } else if (!advance && employee?.mobilePhone) {
      // Prefill from employee only if NOT editing
      const cleanEmpPhone = employee.mobilePhone.startsWith("+254")
        ? employee.mobilePhone.slice(4)
        : employee.mobilePhone;
      setPhone(cleanEmpPhone);
    }

    if (advanceIdNo) {
      setIdNumber(advanceIdNo);
    } else if (!advance && employee?.nationalId) {
      setIdNumber(employee.nationalId);
    }
  }, [advanceMobilePhoneNo, advanceIdNo, advance, employee]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (cutoffPassed) {
        Swal.fire("Error", "The advance cutoff date has passed.", "error");
        return;
      }

      if (
        typeof advanceLimit === "number" &&
        parseFloat(advanceAmount) > advanceLimit
      ) {
        Swal.fire(
          "Error",
          "Requested advance amount exceeds your allowed limit.",
          "error"
        );
        return;
      }

      if (isViewMode) {
        Swal.fire("Info", "View mode - no changes will be saved.", "info");
        return;
      }

      if (currency !== "KES" && paymentMethod === "MPESA") {
        Swal.fire("Error", "MPESA is only valid for KES currency", "error");
        return;
      }

      setIsSubmitting(true);

      try {
        if (!advanceAmount || isNaN(Number(advanceAmount))) {
          Swal.fire("Error", "Please enter a valid advance amount.", "error");
          return;
        }

        if (!payrollPeriods?.[0]?.startingDate) {
          Swal.fire("Error", "No valid payroll period available.", "error");
          return;
        }

        const payload: any = {
          employeeCode: employeeNo,
          applicationAmount: Number(advanceAmount),
          currencyCode: currency === "KES" ? "" : currency,
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
          ? "/api/bc/advances/salary/edit"
          : "/api/bc/advances/salary/create";
        const method = isEdit ? "PATCH" : "POST";

        if (isEdit) {
          payload.no = advanceNo;
        }

        console.log("🚀 Submitting payload:", payload);

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const response = await res.json();
        console.log("📥 Response after create/edit:", response);

        if (!res.ok || response.error || response.success === false) {
          const rawMsg =
            response?.rawResponse?.error?.message ||
            response?.error?.message ||
            response?.error?.details?.[0]?.message;

          console.error("🔴 API returned error:", response);
          Swal.fire("Error", rawMsg || "Unknown API error", "error");
          return;
        }

        const newAdvanceNo =
          response?.data?.no ||
          response?.no ||
          response?.value?.no ||
          advanceNo;

        if (!newAdvanceNo) {
          throw new Error("No advance number returned from server");
        }

        setSavedAdvanceNo(newAdvanceNo);

        Swal.fire(
          "Success",
          isEdit
            ? `Salary advance #${newAdvanceNo} updated successfully!`
            : `Salary advance #${newAdvanceNo} created successfully!`,
          "success"
        );

        try {
          const clearCacheRes = await fetch(
            `/api/clearCache?employeeNo=${employeeNo}`,
            { method: "POST" }
          );
          if (!clearCacheRes.ok) {
            console.warn("⚠️ Failed to clear cache after save");
          }
        } catch (err) {
          console.warn("⚠️ Cache clear request failed", err);
        }

        try {
          const approvalRes = await fetch(
            "/api/bc/advances/salary/sendApproval",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ advanceNo: newAdvanceNo }),
            }
          );

          const approvalJson = await approvalRes.json();
          console.log("📩 Approval submission response:", approvalJson);

          if (
            !approvalRes.ok ||
            approvalJson.error ||
            approvalJson.success === false
          ) {
            const approvalError =
              approvalJson?.rawResponse?.error?.message ||
              approvalJson?.error?.message ||
              approvalJson?.error?.details?.[0]?.message ||
              "Approval failed.";
            console.error("🔴 Approval API error:", approvalJson);
            Swal.fire("Warning", approvalError, "warning");
          } else {
            Swal.fire(
              "Success",
              "Advance submitted for approval successfully.",
              "success"
            );
          }
        } catch (approvalError: any) {
          console.error("❌ Error submitting for approval:", approvalError);
          Swal.fire(
            "Warning",
            approvalError.message || "Saved but failed to submit for approval.",
            "warning"
          );
        }

        onSuccess?.();
      } catch (error: any) {
        console.error("❌ Error in form submission:", error);

        let message = "An unexpected error occurred.";
        try {
          const parsed =
            typeof error.message === "string"
              ? JSON.parse(error.message)
              : null;
          message =
            parsed?.error?.message ||
            error.message ||
            "An unexpected error occurred.";
        } catch {
          message = error.message || message;
        }

        Swal.fire("Error", message, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      advanceAmount,
      advanceNo,
      advanceLimit,
      accountNo,
      bank,
      banks,
      branch,
      bankBranches,
      chequeName,
      cutoffPassed,
      currency,
      employeeNo,
      idNumber,
      isViewMode,
      onSuccess,
      paymentMethod,
      phone,
      payrollPeriods,
      swiftCode,
      advanceApplicationDate,
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
              currencies={displayedCurrencies}
              paymentMethods={paymentMethods}
              advanceLimit={advanceLimit}
              isLimitLoading={isLimitLoading}
              isViewMode={isViewMode}
              status={advanceStatus || ""}
            />

            {paymentMethod === "MPESA" ? (
              <MpesaDetails
                phone={phone}
                setPhone={setPhone}
                idNumber={idNumber}
                setIdNumber={setIdNumber}
                isViewMode={isViewMode}
                required={currency === "KES" && paymentMethod === "MPESA"}
                status={advanceStatus || ""}
              />
            ) : paymentMethod === "CHEQUE" ||
              paymentMethod === "RTGS" ||
              paymentMethod === "EFT" ? (
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
                status={advanceStatus || ""}
              />
            ) : null}
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
          employeeNo={employeeNo}
        />
      </form>
    </>
  );
}

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
import { Advance, SalaryAdvanceData } from "@/app/types/advance";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import VerticalProgressCard from "./VerticalProgressCard";
import CashDetails from "./components/CashDetails";

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
  onSuccess?: (updatedStatus?: string) => void;
  setSelectedRowHandler?: (advance: Advance) => void;
}

export default function SalaryAdvanceForm({
  advance = null,
  isViewMode = false,
  onSuccess,
  setSelectedRowHandler,
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
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceLimit, setAdvanceLimit] = useState<number | null | undefined>(
    null
  );
  const [currency, setCurrency] = useState("KES");
  const [paymentMethod, setPaymentMethod] = useState("MPESA");

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

  const { data: session } = useSession();
  const employeeNo = session?.user?.profile?.no;
  const advanceStatus = advance?.status || "Open";
  const [collectionDate, setCollectionDate] = useState("");
  const [cashHours, setCashHours] = useState("");

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
      setPaymentMethod("MPESA");
      didInitDefaults.current = true;
    }
  }, [advanceCurrencyCode, currencies.length, paymentMethods.length]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchSetups([
          "currencies",
          { paymentMethods: { filters: { isAdvance: true } } },
          { payrollPeriods: { filters: { current: true } } },
        ]);
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
        ]).then(() => {});
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
        if (now > cutoffDate) {
          if (
            advance?.status !== "Pending Approval" &&
            advance?.status !== "Released"
          ) {
            setCutoffPassed(true);
            toast.error("The advance application deadline has passed.");
          }
        }
      } else {
        console.warn("⚠️ No valid cutoff date found.");
      }
    }
  }, [payrollPeriods, advance]);

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
      if (advanceMobilePhoneNo) {
        const cleanPhone = advanceMobilePhoneNo.startsWith("+254")
          ? advanceMobilePhoneNo.slice(4)
          : advanceMobilePhoneNo;
        setPhone(cleanPhone);
      }

      if (advanceIdNo) {
        setIdNumber(advanceIdNo);
      }

      const validBranch = (bankBranches as { branchNo: string }[]).find(
        (b: Record<string, any>) => b.branchNo === advanceEmployeeBranchCode
      ) as Record<string, any> | undefined;

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
  ]);

  useEffect(() => {
    if (currency && currency !== "KES") {
      if (paymentMethod === "MPESA" || paymentMethod === "") {
        setPaymentMethod("RTGS");
      }
    } else if (currency === "KES" && paymentMethod === "") {
      setPaymentMethod("MPESA");
    }
  }, [currency, paymentMethod]);

  useEffect(() => {
    if (!advanceNo && employeeBanks?.length > 0) {
      const eb = employeeBanks[0] as Record<string, any>;
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
      setBranch((filteredBranches[0] as Record<string, any>).branchNo);
    }
  }, [filteredBranches, branch, advanceNo]);

  useEffect(() => {
    if (advanceMobilePhoneNo) {
      const cleanPhone = advanceMobilePhoneNo.startsWith("+254")
        ? advanceMobilePhoneNo.slice(4)
        : advanceMobilePhoneNo;
      setPhone(cleanPhone);
    } else if (!advance && session?.user?.profile?.phoneNo) {
      const cleanEmpPhone = session.user.profile.phoneNo.startsWith("+254")
        ? session.user.profile.phoneNo.slice(4)
        : session.user.profile.phoneNo;
      setPhone(cleanEmpPhone);
    }

    if (advanceIdNo) {
      setIdNumber(advanceIdNo);
    } else if (!advance && session?.user?.profile?.identificationDocumentNo) {
      setIdNumber(session.user.profile.identificationDocumentNo);
    }
  }, [advanceMobilePhoneNo, advanceIdNo, advance, session]);

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

        if (!(payrollPeriods?.[0] as Record<string, any>)?.startingDate) {
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
          payrollPeriod: (payrollPeriods[0] as Record<string, any>)
            .startingDate,
        };

        if (paymentMethod === "MPESA") {
          payload.mobilePhoneNo = `+254${phone}`;
          payload.identificationDocumentNo = idNumber;
        } else if (paymentMethod === "CASH") {
          payload.collectionDate = collectionDate;
          payload.cashHours = cashHours;
        } else {
          payload.accountNo = accountNo;
          payload.bankCode = bank;
          payload.employeeBranchCode = branch;
          payload.employeeBranchName =
            bankBranches.find((b: Record<string, any>) => b.branchNo === branch)
              ?.name || "";
          payload.employeeBankName =
            banks.find((b: Record<string, any>) => b.no === bank)?.name || "";
          payload.chequeName = chequeName;

          if (paymentMethod === "RTGS") {
            payload.swiftCode = swiftCode;
          }
        }

        const isEdit = !!advanceNo;
        const endpoint = isEdit
          ? "/api/bc/advances/salary/edit"
          : "/api/bc/advances/salary/create";
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

        if (!res.ok || response.error || response.success === false) {
          const rawMsg =
            response?.rawResponse?.error?.message ||
            response?.error?.message ||
            response?.error?.details?.[0]?.message;
          Swal.fire("Error", rawMsg || "Unknown API error", "error");
          return;
        }

        if (!isEdit) {
          setSelectedRowHandler(response.data);
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
          const approvalRes = await fetch(
            "/api/bc/advances/salary/sendApproval",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ advanceNo: newAdvanceNo }),
            }
          );

          const approvalJson = await approvalRes.json();

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
            Swal.fire("Warning", approvalError, "warning");
            onSuccess?.(advanceStatus);
          } else {
            Swal.fire(
              "Success",
              "Advance submitted for approval successfully.",
              "success"
            );
            onSuccess?.(advanceStatus);
          }
        } catch (approvalError: any) {
          Swal.fire(
            "Warning",
            approvalError.message || "Saved but failed to submit for approval.",
            "warning"
          );
          onSuccess?.(advanceStatus);
        }
      } catch (error: any) {
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
      collectionDate,
      cashHours,
      advanceApplicationDate,
      setSelectedRowHandler,
      advanceStatus,
    ]
  );

  return (
    <>
      <div className="row">
        <div className="col-md-8">
          <ToastContainer position="top-right" autoClose={5000} />
          <form className="p-2 pt-3" onSubmit={handleSubmit}>
            {cutoffPassed && (
              <div className="alert alert-warning mt-3">
                <strong>Notice:</strong> Advance requests for this payroll
                period are no longer allowed. The cutoff date has passed.
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
                <SalaryAdvanceHeader
                  advanceNo={advanceNo}
                  status={advance?.status}
                />
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
                  status={advance?.status || ""}
                />

                {paymentMethod === "MPESA" ? (
                  <MpesaDetails
                    phone={phone}
                    setPhone={setPhone}
                    idNumber={idNumber}
                    setIdNumber={setIdNumber}
                    isViewMode={isViewMode}
                    required={currency === "KES" && paymentMethod === "MPESA"}
                    status={advance?.status || ""}
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
                    status={advance?.status || ""}
                  />
                ) : paymentMethod === "CASH" ? (
                  <CashDetails
                    collectionDate={collectionDate}
                    setCollectionDate={setCollectionDate}
                    cashHours={cashHours}
                    setCashHours={setCashHours}
                    isViewMode={isViewMode}
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
              status={advance?.status || ""}
              advanceNo={savedAdvanceNo}
              onSuccess={onSuccess}
              employeeNo={employeeNo}
            />
          </form>
        </div>
        <div className="col-md-4">
          <VerticalProgressCard advance={advance ? advance : null} />
        </div>
      </div>
    </>
  );
}

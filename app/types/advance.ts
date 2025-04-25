export type AdvanceType =
  | "Salary"
  | "Operational"
  | "Settlement"
  | "Travel"
  | "Advance";

export interface Advance {
  currencyCode: string;
  no: string;
  applicationDate: string;
  employeeName: string;
  advanceType: AdvanceType;
  applicationAmount: number;
  status: "Open" | "Pending Approval" | "Released";
  documentStatus: string;
  preferredDisbursementDate: string;
  repaymentAmount: number;
  repaymentInstallments: number;
}

export interface SalaryAdvanceData extends Advance {
  paymentMethod: string;
  currencyCode: string;
  accountNo: string;
  bankCode: string;
  employeeBranchCode: string;
  mobilePhoneNo: string;
  identificationDocumentNo: string;
  chequeName: string;
  swiftCode: string;
  payrollPeriod?: string;
}

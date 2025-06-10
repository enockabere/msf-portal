// export type AdvanceType =
//   | "Salary"
//   | "Operational"
//   | "Settlement"
//   | "Travel"
//   | "Advance";

export interface Advance {
  disbursed?: any;
  currencyCode: string;
  no?: string;
  applicationDate?: string;
  employeeName?: string;
  advanceType?: AdvanceType;
  applicationAmount?: number;
  status?: "Open" | "Pending Approval" | "Released" | "Pending Verification" | "Settled" | "Accounted" | "Rejected" | "Issued" | "Surrender Rejected" | "Surrendered" | "Partially Settled";
  documentStatus?: string;
  preferredDisbursementDate?: string;
  repaymentAmount?: number;
  repaymentInstallments?: number;
  [key: string]: any;
}

export interface SalaryAdvanceData extends Advance {
  paymentMethod?: string;
  currencyCode: string;
  accountNo?: string;
  bankCode?: string;
  employeeBranchCode?: string;
  mobilePhoneNo?: string;
  identificationDocumentNo?: string;
  chequeName?: string;
  swiftCode?: string;
  payrollPeriod?: string;
}

export interface ExpenseItem {
  expenseCode: string;
  unitCost: number;
  description?: string;
  operationCenter?: string;
  costCenter: string;
  project: string;
  [key: string]: any;
}

export interface FormData {
  imprestType: string,
  Purpose: string;
  amountToPayHeader: number;
  currencyCode: string;
  paymentMethod: string;
  cashCollectionDate: string;
  cashHours: string;
  idPassportNumber: string;
  accountNo: string;
  bankNo: string;
  branch: string;
  swiftCode: string;
  phoneNo: string;
  accountName: string;
  no?: string;
  [key: string]: any;
}

export type AdvanceTypeKey = "Salary" | "Other" | null;

export interface AdvanceType {
  title: string;
  key: AdvanceTypeKey;
  route?: string;
  [key: string]: any;
}

export interface AdvanceCount {
  open: number;
  pending: number;
  released: number;
  total: number;
}
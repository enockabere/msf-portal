export type AdvanceType =
  | "Salary"
  | "Operational"
  | "Settlement"
  | "Travel"
  | "Advance";

export interface Advance {
  disbursed: any;
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

export interface ExpenseItem {
  expenseCode: string;
  unitCost: number;
  description?: string;
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
  [key: string]: any;
}

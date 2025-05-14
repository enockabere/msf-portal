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
  category: string;
  amount: number;
  receipt?: File | null;
  mileage: string;
  costCenter: string;
  project: string;
  surrenderedAmount?: number;
  otherCategory?: string;
}

export interface FormData {
  purpose: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  cashCollectionDate: string;
  cashHours: string;
  idPassportNumber: string;
  accountNo: string;
  bank: string;
  branch: string;
  chequeName: string;
  swiftCode: string;
  phoneNo: string;
}

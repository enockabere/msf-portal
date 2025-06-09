export interface Requisition {
  id?: string;
  no?: string;
  documentType: string;
  requestedBy: string;
  requestedFor: string;
  dueDate: string;
  title: string;
  description: string;
  locationCode: string;
  currencyCode: string;
  status?: string;
  urgent: boolean;
  urgencyReasons?: string;
  globalDimension1Code?: string;
  globalDimension2Code?: string;
  globalDimension3Code?: string;
  globalDimension4Code?: string;
  [key: string]: any;
}

export interface RequisitionLine {
  id?: string;
  documentType: string;
  documentNo: string;
  billingItemCode: string;
  description: string;
  quantity: number;
  unitCost: number;
  unitOfMeasure: string;
  locationCode: string;
  globalDimension1Code?: string;
  globalDimension2Code?: string;
  globalDimension3Code?: string;
  globalDimension4Code?: string;
  [key: string]: any;
}

export interface Attachment {
  tableID?: number;
  no: string;
  documentType: string;
  lineNo?: number;
  id?: number;
  fileName: string;
  attachment?: string;
}
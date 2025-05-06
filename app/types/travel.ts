// app/types/travel.ts
export type BasedOnRequest = "Yes" | "No";
export type TravelRequestId = "TR001" | "TR002" | "";
export type Currency = "" | "KES" | "USD" | "EUR";
export type PaymentMethod = "" | "Cash" | "Mpesa" | "Bank";
export type TripType = "" | "Local" | "Foreign";
export type YesNo = "Yes" | "No";

export interface TravelDates {
  from: string;
  to: string;
}

export interface TravelInfo {
  basedOnRequest: BasedOnRequest;
  travelRequestId: TravelRequestId;
  tripType: TripType;
  tripDates: TravelDates;
  destination: string;
  applyForOther: "Yes" | "No";
  recipientName: string;
  currency: Currency;
  paymentMethod: PaymentMethod;
  travelType: TripType;
  visaRequired: YesNo;
  workPermitRequired: YesNo;
  [key: string]: any;
}

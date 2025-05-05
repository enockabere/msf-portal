// app/types/travel.ts
export type BasedOnRequest = "Yes" | "No";
export type TravelRequestId = "TR001" | "TR002" | "";
export type Currency = "" | "KES" | "USD" | "EUR";
export type PaymentMethod = "" | "Cash" | "Mpesa" | "Bank";

export interface TravelDates {
  from: string;
  to: string;
}

export interface TravelInfo {
  basedOnRequest: BasedOnRequest;
  travelRequestId: TravelRequestId;
  tripType: string;
  tripDates: TravelDates;
  destination: string;
  applyForOther: "Yes" | "No";
  recipientName: string;
  currency: Currency;
  paymentMethod: PaymentMethod;
  [key: string]: any;
}

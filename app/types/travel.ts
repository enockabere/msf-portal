// app/types/travel.ts
export type BasedOnRequest = "Yes" | "No";
export type TravelRequestId = "TR001" | "TR002" | "";
export type Currency = "" | "KES" | "USD" | "EUR";
export type PaymentMethod = "" | "Cash" | "Mpesa" | "Bank";
export type TripType = "" | "Local" | "Foreign" | "Regional" | "International";
export type YesNo = "Yes" | "No";

export interface TravelDates {
  from: string;
  to: string;
}

export interface TravelInfo {
  [key: string]: any;
  destinations: {
    id: string;
    country: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface TravelRequest {
  documentType: string;
  no: string;
  travellerNo: string;
  createdbyProfileNo: string;
  originCountryCode: string;
  originCity: string;
  TypeOfTravel: string;
  purposeOfTravel: string;
  accommodationType: string;
  departureDate: string;
  returnDate: string;
  annualTrip: boolean;
  modeOfTransport: 'AIR' | string; // Assuming 'AIR' is one of possible values
  arrivalDate: string;
  estimatedTimeOfArrival: string;
  pickupLocation: string;
  dropOffLocation: string;
  passportNo: string;
  requirePerDiem: boolean;
  shortcutDimension1Code: string;
  shortcutDimension2Code: string;
  budgetCode: string;
  approvalStatus: 'Open' | string;
  hasValidVisa: false;
  bookingComplete: false;
  [key: string]: any;
}

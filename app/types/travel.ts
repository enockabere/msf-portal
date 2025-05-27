export interface TravelDates {
  from: string;
  to: string;
}

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
  approvalStatus: 'Open' | string; // Assuming 'Open' is one of possible statuses
  [key: string]: any;
}

export interface TravelRequestProviders {
  documentType: string,
  documentNo: string,
  serviceCode: string,
  serviceProvider: string,
  serviceDescription: string,
  vendorName: string,
  notify: boolean,
  isTransportation: boolean,
  vehicleRegistrationNo: string,
  phoneNo: string,

  [key: string]: any;
}

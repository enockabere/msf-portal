export interface TravelDates {
  from: string;
  to: string;
}

export interface TravelRequest {
  [key: string]: any;
}

export interface TravelRequestProviders{
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

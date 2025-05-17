export interface Destination {
    documentType: string;
    documentNo: string;
    originCountryCode: string;
    originCity: string;
    destinationCountryCode: string;
    destinationCity: string;
    travelDate: string;
    modeOfTransport: string;
    [key: string]: any;
}
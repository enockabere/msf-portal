import React from "react";
import { TravelRequest } from "../../types/travel";
import {formatDate} from "@/app/utils/dateFormats";

interface TravelAdvanceDetailsProps {
    travelInfo: TravelRequest;
}

const TravelAdvanceDetails: React.FC<TravelAdvanceDetailsProps> = ({ travelInfo }) => {
    return (
        <div className="mb-4 p-3 bg-light rounded border">
            <h6 className="fw-bold mb-3">Travel Advance Details</h6>
            <div className="row mb-2">
                <div className="col-md-6">
                    <strong>Travel Dates:</strong> {formatDate(travelInfo?.departureDate)} - {formatDate(travelInfo?.returnDate)}
                </div>
                <div className="col-md-3">
                    <strong>Origin:</strong> {travelInfo.origin || "-"}
                </div>
                <div className="col-md-3">
                    <strong>Destination:</strong> {travelInfo.destination}
                </div>
            </div>
        </div>
    );
};

export default TravelAdvanceDetails;

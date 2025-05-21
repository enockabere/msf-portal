"use client";

import React from "react";
import ConfirmedEtaUpload from "./ConfirmedEtaUpload";
import NoEtaDownloads from "./NoEtaDownloads";

interface TravelDocumentsProps {
  primaryKey: { no: string; documentType: string };
  status: string;
  requireETA: boolean;
  travelId: string;
}

const TravelDocuments: React.FC<TravelDocumentsProps> = ({
  primaryKey,
  status,
  requireETA,
  travelId,
}) => {
  return (
    <div className="p-3">
      {requireETA ? (
        <NoEtaDownloads primaryKey={primaryKey} />
      ) : (
        <ConfirmedEtaUpload
          status={status}
          travelId={travelId}
          travelNo={primaryKey.no}
        />
      )}
    </div>
  );
};

export default TravelDocuments;

"use client";

import React, { useState } from "react";
import TravelAdvanceHeader, { TravelInfo } from "./Travel/TravelAdvanceHeader";
import TravelAdvanceLine from "./Travel/TravelAdvanceLine";
import ProgressIndicator from "./Operational/ProgressIndicator";

export default function TravelAdvanceForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({
    basedOnRequest: "Yes",
    travelRequestId: "",
    tripType: "",
    tripDates: { from: "", to: "" },
    destination: "",
    applyForOther: "No",
    currency: "",
    paymentMethod: "",
  });

  const [lines, setLines] = useState([{ category: "", amount: 0 }]);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row flex-grow-1">
        <div className="col-md-9">
          {currentStep === 1 ? (
            <TravelAdvanceHeader
              travelInfo={travelInfo}
              setTravelInfo={setTravelInfo}
              onNext={() => setCurrentStep(2)}
            />
          ) : (
            <TravelAdvanceLine
              lines={lines}
              setLines={setLines}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(1)}
            />
          )}
        </div>

        <div className="col-md-3">
          <ProgressIndicator
            currentStep={currentStep}
            isSubmitted={isSubmitted}
          />
        </div>
      </div>
      <div className="d-flex justify-content-center gap-2 mb-4">
        {[1, 2].map((step) => (
          <div
            key={step}
            className={`rounded-circle ${
              currentStep === step ? "bg-danger" : "bg-secondary"
            }`}
            style={{ width: "10px", height: "10px", opacity: 0.7 }}
          ></div>
        ))}
      </div>
    </div>
  );
}

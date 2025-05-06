import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";

export interface WizardStep {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

interface WizardProps<T> {
  steps: WizardStep[];
  data: T;
  onChange: (field: keyof T, value: any) => void;
  renderStep: (
    stepId: string,
    data: T,
    onChange: WizardProps<T>["onChange"]
  ) => React.ReactNode;
  onSubmit: (data: T) => void;
}

export default function Wizard<T>({
  steps,
  data,
  onChange,
  renderStep,
  onSubmit,
}: WizardProps<T>) {
  const [activeTab, setActiveTab] = useState(steps[0].id);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStepIndex = steps.findIndex((s) => s.id === activeTab);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setCompletedSteps((prev) => new Set(prev).add(activeTab));
  };

  const handleNext = () => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) handleTabChange(nextStep.id);
  };

  const handlePrev = () => {
    const prevStep = steps[currentStepIndex - 1];
    if (prevStep) handleTabChange(prevStep.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h2>Step: {steps[currentStepIndex].title}</h2>
      </div>

      <div className="wizard-body row">
        <div className="col-md-3">
          <nav className="nav flex-column">
            {steps.map((step) => (
              <button
                key={step.id}
                className={`btn btn-light text-start mb-2 ${
                  activeTab === step.id
                    ? "border-start border-4 border-primary"
                    : ""
                }`}
                onClick={() => handleTabChange(step.id)}
              >
                <div className="d-flex gap-2 align-items-center">
                  <span>{step.icon}</span>
                  <span>
                    <strong>{step.title}</strong>
                    <div className="text-muted small">{step.desc}</div>
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="col-md-9">
          <form onSubmit={handleSubmit}>
            {renderStep(activeTab, data, onChange)}

            <div className="d-flex justify-content-between mt-4">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrev}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
              )}
              {currentStepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Save & Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" className="btn btn-success">
                  <Check size={16} /> Submit Request
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

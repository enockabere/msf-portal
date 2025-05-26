"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  User, ListChecks, Globe, Briefcase, FilePlus2, ArrowLeft,
  ArrowRight, Save, Check, Ticket, Link, DownloadIcon, FileDownIcon, Plus, DownloadCloud,
} from "lucide-react";
import Swal from "sweetalert2";
import "./TravelRequestWizard.css";
import { TravelRequest } from "@/app/types/travel";
import { codeUnit, createResource, getResource, patchResource } from "@/app/lib/api/http";
import {
  checkIfMissingRequiredProperty,
  pickKeys,
  removeNullAndUndefinedFromObject,
} from "@/app/utils/helpers";
import SectionLoader from "@/app/components/loaders/SectionLoader";
import TravelHeaderForm from "../advances/forms/Travel/TravelHeaderForm";
import TravelAdvanceDetails from "./TravelAdvanceDetails";
import TravelAdvanceGLTable from "./TravelAdvanceGLTable";
import VisaApplicationForm from "@/app/components/advances/forms/Travel/VisaApplicationForm";
import VisaChecklist from "@/app/components/advances/forms/Travel/VisaChecklist";
import TravelDestinations from "../advances/forms/Travel/TravelDestinations";
import TravelDependencies from "../advances/forms/Travel/TravelDependencies";
import ServiceProvidersList from "../advances/forms/Travel/ServiceProvidersList";
import TravellerChecklist from "@/app/components/advances/forms/Travel/TravellerChecklist";
import { downloadFileFromBase64 } from "@/app/utils/downloadBas64";
import TravelDocuments from "../advances/forms/Travel/TravelDocuments";
import { usePageLoader } from "@/app/context/PageLoaderContext";

// Type definitions
interface WizardStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  actions?: StepAction[];
}

interface StepAction {
  id: string;
  fn: () => Promise<void>;
  caption: string;
}

interface Props {
  requestNo?: string;
  profile: Record<string, any>;
}

const INITIAL_TRAVEL_REQUEST: TravelRequest = {
  documentType: '',
  no: '',
  travellerNo: '',
  createdbyProfileNo: '',
  originCountryCode: '',
  originCity: '',
  TypeOfTravel: '',
  purposeOfTravel: '',
  accommodationType: '',
  departureDate: '',
  returnDate: '',
  annualTrip: false,
  modeOfTransport: 'AIR',
  arrivalDate: '',
  estimatedTimeOfArrival: '',
  pickupLocation: '',
  dropOffLocation: '',
  passportNo: '',
  requirePerDiem: false,
  shortcutDimension1Code: '',
  shortcutDimension2Code: '',
  approvalStatus: 'Open',
  travelRequestRoutes: [],
  travellers: [],
  visaApplications: [],
};

const WORK_PERMIT_FIELDS = [
  { id: "country", label: "Country of Work", type: "text" },
  { id: "duration", label: "Duration (days)", type: "number" },
  { id: "documents", label: "Required Documents", type: "file" },
];

export default function TravelRequestWizard({ requestNo, profile }: Props) {
  // State management
  const [activeTab, setActiveTab] = useState("info");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [travelRequestHeader, setTravelRequestHeader] = useState<TravelRequest>(INITIAL_TRAVEL_REQUEST);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [headerRequiredFields, setHeaderRequiredFields] = useState<string[]>([]);
  const [travelChecklistCount, setTravelChecklistCount] = useState<number>(0);
  const [visaChecklistCount, setVisaChecklistCount] = useState<number>(0);
  const { actions } = usePageLoader();
  const { dispatcher } = actions;

  // Derived values
  const isReadOnly = useMemo(
    () => travelRequestHeader.approvalStatus !== 'Open',
    [travelRequestHeader.approvalStatus]
  );

  const disableTabs = useMemo(
    () => !travelRequestHeader.no,
    [travelRequestHeader.no]
  );

  const canSubmitForApproval = useMemo(() => {
    const canSubmit = travelRequestHeader.no && travelRequestHeader.approvalStatus === 'Open';
    if (travelRequestHeader.documentType === 'Employee') {
      return canSubmit && travelRequestHeader.travelRequestRoutes.length > 0;
    }
    return canSubmit;
  }, [travelRequestHeader]);

  // Effects
  useEffect(() => {
    const initializeProfileData = () => {
      const baseData = {
        documentType: profile.type,
        travellerNo: profile.no,
        createdbyProfileNo: profile.no,
        passportNo: profile.passportIDNo,
        shortcutDimension1Code: profile.shortcutDimension1Code,
        shortcutDimension2Code: profile.shortcutDimension2Code,
      };

      setTravelRequestHeader(prev => ({
        ...prev,
        ...(requestNo ? { documentType: profile.type } : baseData)
      }));
    };

    const setRequiredFieldsBasedOnProfile = () => {
      const baseFields = ['documentType', 'passportNo', 'shortcutDimension1Code', 'travellerNo', 'requirePerDiem'];

      if (profile.type === 'Employee') {
        setHeaderRequiredFields([
          ...baseFields,
          'TypeOfTravel', 'purposeOfTravel', 'departureDate', 'returnDate', 'annualTrip', 'accommodationType'
        ]);
      } else if (profile.type === 'Visitor') {
        setHeaderRequiredFields([
          ...baseFields,
          'originCity', 'originCountryCode', 'purposeOfTravel', 'departureDate', 'arrivalDate', 'returnDate', 'estimatedTimeOfArrival'
        ]);
      } else {
        setHeaderRequiredFields(baseFields);
      }
    };

    initializeProfileData();
    setRequiredFieldsBasedOnProfile();
  }, [profile, requestNo]);

  useEffect(() => {
    const fetchTravelRequest = async (requestNo: string) => {
      try {
        setIsLoading(true);
        const res = await getResource('travelRequests', {
          params: {
            filters: { no: requestNo },
            '$expand': 'travelRequestRoutes,travelRequestLines,travellers',
          }
        });

        if (res.error) {
          throw new Error(res.error.message);
        }

        setTravelRequestHeader(prev => ({ ...prev, ...res.value.at(0) }));
      } catch (error: any) {
        console.error('Error fetching travel request:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (requestNo) {
      fetchTravelRequest(requestNo);
    }
  }, [requestNo]);

  // API operations
  const fetchTravelRequest = useCallback(async (requestNo?: string) => {
    try {
      setIsLoading(true);
      const res = await getResource('travelRequests', {
        params: {
          filters: { no: requestNo ?? travelRequestHeader.no },
          '$expand': 'travelRequestRoutes,travelRequestLines,travellers',
        }
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      setTravelRequestHeader(prev => ({ ...prev, ...res.value.at(0) }));
    } catch (error: any) {
      console.error('Error fetching travel request:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [travelRequestHeader.no]);

  const saveTravelRequestHeader = async () => {
    try {
      const strippedPayload = removeNullAndUndefinedFromObject(travelRequestHeader);
      const keysToRetain = [
        'no', 'documentType', 'passportNo', 'shortcutDimension1Code', 'travellerNo',
        'createdbyProfileNo', 'TypeOfTravel', 'purposeOfTravel', 'annualTrip',
        'requirePerDiem', 'originCity', 'originCountryCode', 'destinationCity',
        'destinationCountryCode', 'departureDate', 'arrivalDate', 'returnDate',
        'modeOfTransport', 'accommodationType', 'estimatedTimeOfArrival',
      ];
      const knownSchema = pickKeys(strippedPayload, keysToRetain);

      const validation = checkIfMissingRequiredProperty(knownSchema, headerRequiredFields);
      if (!validation || validation.missing) {
        const message = validation?.missing
          ? `Missing [${validation.prop.join(",")}] ${validation.prop.length > 1 ? 'Properties' : 'Property'}`
          : "Not a valid payload";
        Swal.fire("Validation Error!", message);
      } else {
        setIsSaving(true);
        const operation = knownSchema.no
          ? patchResource('travelRequests', { data: knownSchema, primaryKey: ['no', 'documentType'] })
          : createResource('travelRequests', { data: knownSchema });

        const res = await operation;
        if (res.error) {
          throw new Error(res.error.message);
        }

        await fetchTravelRequest(res.no);
        navigateToNextStepAfterSave();
      }
    } catch (error: any) {
      Swal.fire('Error saving request!', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const navigateToNextStepAfterSave = () => {
    if (travelRequestHeader.documentType === 'Visitor') {
      setActiveTab('dependants');
    } else if (travelRequestHeader.documentType === 'Employee') {
      setActiveTab('destinations');
    }
  };

  const handleSubmitForApproval = useCallback(async () => {
    try {
      setIsSubmitting(true);
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: '',
        }
      });
      const res = await codeUnit('sendTravelRequestForApproval', {
        data: { no: travelRequestHeader.no },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      await fetchTravelRequest(travelRequestHeader.no);
      Swal.fire("Success", res.value);
    } catch (error: any) {
      Swal.fire("Error submitting for approval", error.message);
    } finally {
      setIsSubmitting(false);
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
    }
  }, [fetchTravelRequest, travelRequestHeader.no, dispatcher]);

  const handleCreateTravelAdvance = useCallback(async () => {
    try {
      const res = await codeUnit("createTravelAdvanceFromTravel", {
        data: { no: travelRequestHeader.no },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      await fetchTravelRequest(travelRequestHeader.no);
      Swal.fire("Success", "Travel advance created successfully!");
    } catch (error: any) {
      Swal.fire("Error creating advance", error.message);
    }
  }, [fetchTravelRequest, travelRequestHeader.no]);

  // Step configuration
  const allSteps = useMemo<WizardStep[]>(() => [
    {
      id: "info",
      icon: <User size={18} />,
      title: "Travel Details",
      desc: "General travel details",
    },
    {
      id: "destinations",
      icon: <Globe size={18} />,
      title: "Travel Destinations",
      desc: "Travel destination details",
    },
    {
      id: "dependants",
      icon: <Link size={18} />,
      title: "Dependants",
      desc: "Related travel requirements",
    },
    {
      id: "providers",
      icon: <Ticket size={18} />,
      title: "Service Providers",
      desc: "Service providers details",
    },
    {
      id: "checklist",
      icon: <ListChecks size={18} />,
      title: "Visa Checklist",
      desc: "Visa Pre-travel requirements",
    },
    {
      id: "traveller-checklist",
      icon: <ListChecks size={18} />,
      title: "Traveller Checklist",
      desc: "Pre-travel requirements",
    },
    {
      id: "visa",
      icon: <Globe size={18} />,
      title: "Visa Application",
      desc: "Visa documentation",
    },
    {
      id: "permit",
      icon: <FilePlus2 size={18} />,
      title: "Work Permit",
      desc: "Work authorization",
    },
    {
      id: "advance",
      icon: <Briefcase size={18} />,
      title: "Travel Advance",
      desc: "Advance request",
      actions: [{
        id: "action-create-advance",
        caption: "Create Advance",
        fn: handleCreateTravelAdvance,
      }],
    },
    {
      id: "documents",
      icon: <DownloadCloud size={18} />,
      title: "Travel Documentation",
      desc: "Supporting travel files",
    },
  ], [handleCreateTravelAdvance]);

  const getChecklistCount = async (travel, type: "Travel" | "Visa") => {
    try {
      const res = await getResource("travellerChecklist", {
        params: {
          filters: {
            documentNo: travel?.no,
            documentType: travel?.documentType,
            checklistType: type,
          },
          $count: true,
        },
      });

      const count = res["@odata.count"];
      console.log(`${type} checklistCount:`, count);

      if (type === "Travel") {
        setTravelChecklistCount(count);
        console.log('travelChecklistCount', travelChecklistCount)
      } else {
        setVisaChecklistCount(count);
        console.log('visaChecklistCount', visaChecklistCount)
      }
    } catch (error) {
      console.error(`Error fetching ${type} checklist count:`, error);
    }
  };

  const currentSteps = useMemo(() => {
    if (travelRequestHeader.approvalStatus !== 'Open') {
      if (travelRequestHeader.documentType === "Employee") {
        return ["info", "destinations", "dependants",  visaChecklistCount > 0 ? "checklist" : null, travelChecklistCount > 0 ? "traveller-checklist" : null , "visa", "advance"]
            .filter((id): id is string => id !== null).map(id => allSteps.find(s => s.id === id)!);
      } else if (travelRequestHeader.documentType === "Visitor") {
        return ["info", "dependants", "documents", "providers",  visaChecklistCount > 0 ? "checklist" : null, travelChecklistCount > 0 ? "traveller-checklist" : null , "permit", "advance"]
            .filter((id): id is string => id !== null).map(id => allSteps.find(s => s.id === id)!);
      }
    } else {
      if (travelRequestHeader.documentType === "Employee") {
        return ["info", "destinations", "dependants"]
          .map(id => allSteps.find(s => s.id === id)!);
      } else if (travelRequestHeader.documentType === "Visitor") {
        return ["info", "dependants", "documents"]
          .map(id => allSteps.find(s => s.id === id)!);
      }
    }
    return [allSteps.find(s => s.id === "info")!];
  }, [travelRequestHeader.documentType, travelRequestHeader.approvalStatus, allSteps, visaChecklistCount, travelChecklistCount]);

  useEffect(() => {
    const updateCompletedSteps = () => {
      const newCompletedSteps = new Set<string>();

      currentSteps.forEach(step => {
        switch (step.id) {
          case "info":
            if (travelRequestHeader.no) newCompletedSteps.add("info");
            break;
          case "destinations":
            if (travelRequestHeader.travelRequestRoutes?.length) newCompletedSteps.add("destinations");
            break;
          case "dependants":
            const hasDependencies = travelRequestHeader.travellers?.some(
              (t: Record<string, any>) => t.travellerType !== "Self"
            );
            if (hasDependencies) newCompletedSteps.add("dependants");
            break;
        }
      });

      setCompletedSteps(newCompletedSteps);
    };

    if (travelRequestHeader) {
      updateCompletedSteps();
    }
  }, [travelRequestHeader, currentSteps]);

  useEffect(() => {
    if (travelRequestHeader?.no && travelRequestHeader?.documentType) {
      getChecklistCount(travelRequestHeader, "Travel");
      getChecklistCount(travelRequestHeader, "Visa");
    }
  }, [travelRequestHeader?.no, travelRequestHeader?.documentType]);


  // Event handlers
  const handleFormChange = useCallback((field: keyof TravelRequest, value: any) => {
    setTravelRequestHeader(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTabChange = (stepId: string) => {
    if (validateCurrentStep()) {
      setActiveTab(stepId);
    }
  };

  const validateCurrentStep = (): boolean => true;

  // UI calculations
  const currentStepIndex = currentSteps.findIndex(s => s.id === activeTab);
  const progressPercentage = (completedSteps.size / currentSteps.length) * 100;


  const getDocumentTypeCode = (type) => {
    const typeMap = {
      Employee: "0",
      Visitor: "1",
      "Non-Resident": "2",
    };
    return typeMap[type] || "Unknown";
  };

  const downLoadIntroductoryLetter = async () => {
    setIsSaving(true)
    try {
      const docType = getDocumentTypeCode(travelRequestHeader?.documentType);
      const res = await codeUnit('getIntroductoryLetter', {
        data: {
          docType,
          docNo: travelRequestHeader.no,
          destination: travelRequestHeader?.travelRequestRoutes[0]?.destinationCountryCode
        }
      })

      if (res.error) {
        throw new Error(res.error.message)
      }
      downloadFileFromBase64(res.value, "Introductory Letter")
    } catch (error) {
      Swal.fire('Download Failed', error.message);
    } finally {
      setIsSaving(false)
    }
  }


  const downLoadBtaCertificate = async () => {
    try {
      const docType = getDocumentTypeCode(travelRequestHeader?.documentType);
      const docNo = travelRequestHeader?.no;

      const res = await codeUnit('getBTACertificate', {
        data: { docType, docNo }
      });

      if (res.error) {
        throw new Error(res.error.message)
      }
      downloadFileFromBase64(res.value, "BtaCertificate");
    } catch (error) {
      Swal.fire("Error", error.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="travel-wizard">
      <div className="wizard-header">
        <div className="d-flex align-items-start gap-4">
          <div className="">
            <h2 className="wizard-title">Travel Request Application</h2>
            {travelRequestHeader.currentStage && (
                <div className="d-flex align-items-center mt-1">
                  <h5 className="m-0">Current Stage:</h5>
                  <span className="badge bg-primary p-1 ms-2"> { travelRequestHeader.currentStage }</span>
                </div>
            )}
            <p className="wizard-subtitle">Fill out your travel request in steps.</p>
          </div>
        </div>

        <div className="wizard-progress">
          <div
            className="progress-bar"
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      <div className="wizard-body">
        <nav className="wizard-sidebar" aria-label="Travel request steps">
          <ul className="step-list" role="tablist">
            {currentSteps?.map(step => (
              <li key={step?.id} className="step-item">
                <button
                  className={`step-button ${activeTab === step?.id ? "active" : ""} ${completedSteps?.has(step?.id) ? "completed" : ""}`}
                  onClick={() => handleTabChange(step?.id)}
                  role="tab"
                  aria-selected={activeTab === step?.id}
                  aria-controls={`${step?.id}-panel`}
                  id={`${step?.id}-tab`}
                  tabIndex={activeTab === step?.id ? 0 : -1}
                  disabled={disableTabs}
                >
                  <span className="step-icon-wrapper">
                    <span className="step-icon">{step?.icon}</span>
                  </span>
                  <span className="step-content">
                    <span className="step-title">{step?.title}</span>
                    <span className="step-desc">{step.desc}</span>
                  </span>
                  {completedSteps.has(step?.id) && (
                    <span className="step-completed-badge" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="wizard-content">
          <div
            className="step-panel"
            role="tabpanel"
            aria-labelledby={`${activeTab}-tab`}
          >
            <StepHeader
              activeTab={activeTab}
              currentSteps={currentSteps}
              canSubmitForApproval={canSubmitForApproval}
              isSubmitting={isSubmitting}
              handleSubmitForApproval={handleSubmitForApproval}
              downLoadBtaCertificate={downLoadBtaCertificate}
              downLoadIntroductoryLetter={downLoadIntroductoryLetter}
              currentStage={travelRequestHeader.currentStage	}
            />

            <StepContent
              activeTab={activeTab}
              travelRequestHeader={travelRequestHeader}
              headerRequiredFields={headerRequiredFields}
              isReadOnly={isReadOnly}
              isLoading={isLoading}
              isSaving={isSaving}
              saveTravelRequestHeader={saveTravelRequestHeader}
              fetchTravelRequest={fetchTravelRequest}
              handleFormChange={handleFormChange}
              travelChecklistCount={travelChecklistCount}
              visaChecklistCount={visaChecklistCount}
            />

            <StepActions
              activeTab={activeTab}
              currentStepIndex={currentStepIndex}
              currentSteps={currentSteps}
              travelRequestHeader={travelRequestHeader}
              handleTabChange={handleTabChange}
              handleSubmitForApproval={handleSubmitForApproval}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Extracted components for better organization
interface StepHeaderProps {
  activeTab: string;
  currentSteps: WizardStep[];
  canSubmitForApproval: boolean;
  isSubmitting: boolean;
  handleSubmitForApproval: () => Promise<void>;
  downLoadIntroductoryLetter: () => void;
  downLoadBtaCertificate: () => void;
  currentStage: string;
}

const StepHeader: React.FC<StepHeaderProps> = ({
  activeTab,
  currentSteps,
  canSubmitForApproval,
  isSubmitting,
  handleSubmitForApproval,
  downLoadIntroductoryLetter,
  downLoadBtaCertificate,
  currentStage,
}) => (
  <div className="d-flex align-items-center justify-content-between mb-3 p-2 wizard-bg-gray">
    <h4 className="step-panel-title">
      {currentSteps.find(s => s.id === activeTab)?.title}
    </h4>
    <div className="d-flex align-items-center ">
      {currentSteps.find(s => s.id === activeTab)?.actions?.map(action => (
          <button
              key={action.id}
              className="primary-button"
              onClick={action.fn}
          >
            <Plus size={16} />
            {action.caption}
          </button>
      ))}

      {activeTab === "visa" && (
          <div className="btn-group">
            <button
                type="button"
                className="btn btn-outline-danger btn-sm mx-2 dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
              <DownloadIcon size={16} className="button-icon" />
              Download
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" type="button">
                  <FileDownIcon size={16} className="button-icon" />
                  Dummy ticket
                </button>
              </li>
              <li>
                <button className="dropdown-item" type="button">
                  <FileDownIcon size={16} className="button-icon" />
                  Accommodation voucher
                </button>
              </li>
              <li>
                <button className="dropdown-item" type="button">
                  <FileDownIcon size={16} className="button-icon" />
                  Letter of intent
                </button>
              </li>
              <li>
                <button onClick={downLoadIntroductoryLetter} className="dropdown-item" type="button">
                  <FileDownIcon size={16} className="button-icon" />
                  Introductory Letter
                </button>
              </li>
              <li>
                <button onClick={downLoadBtaCertificate} className="dropdown-item" type="button">
                  <FileDownIcon size={16} className="button-icon" />
                  Bta Certificate
                </button>
              </li>
            </ul>
          </div>
      )}

      {canSubmitForApproval && (
          <button
              className="primary-button"
              onClick={handleSubmitForApproval}
              disabled={isSubmitting}
          >
            <Check size={16} className="button-icon" />
            Submit for Approval
          </button>
      )}
    </div>
  </div>
);

interface StepContentProps {
  activeTab: string;
  travelRequestHeader: TravelRequest;
  headerRequiredFields: string[];
  isReadOnly: boolean;
  isLoading: boolean;
  isSaving: boolean;
  saveTravelRequestHeader: () => Promise<void>;
  fetchTravelRequest: () => Promise<void>;
  handleFormChange: (field: keyof TravelRequest, value: any) => void;
  travelChecklistCount: number;
  visaChecklistCount: number;
}

const StepContent: React.FC<StepContentProps> = ({
  activeTab,
  travelRequestHeader,
  headerRequiredFields,
  isReadOnly,
  isSaving,
  isLoading,
  saveTravelRequestHeader,
  fetchTravelRequest,
  handleFormChange,
  travelChecklistCount,
  visaChecklistCount,
}) => {
  switch (activeTab) {
    case "info":
      return (
        isLoading ? (
          <div className={'col-12 text-center'}>
            <SectionLoader size={32} />
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            await saveTravelRequestHeader();
          }}>
            <TravelHeaderForm
              formData={travelRequestHeader}
              requiredFields={headerRequiredFields}
              isReadOnly={isReadOnly}
              onFormChange={handleFormChange}
            />

            {travelRequestHeader.approvalStatus === "Open" && (
              <div className="step-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <SectionLoader classes={'button-icon'} />
                  ) : (
                    <Save size={16} className="button-icon" />
                  )}
                  Save & Continue
                </button>
              </div>
            )}
          </form>
        )
      );
    case "destinations":
      return (
        <TravelDestinations
          travelRequestHeader={travelRequestHeader}
          isReadOnly={isReadOnly}
          onSubmit={fetchTravelRequest}
        />
      );
    case "dependants":
      return (
        <TravelDependencies
          travelRequestHeader={travelRequestHeader}
          isReadOnly={isReadOnly}
          onSubmit={fetchTravelRequest}
        />
      );
    case "providers":
      return <ServiceProvidersList travelRequest={travelRequestHeader} />;
    case "permit":
      return (
        <div className="permit-form">
          <div className="permit-notice mb-4">
            <p className="notice-text">
              <strong>Note:</strong> Work permit applications typically
              take 3-4 weeks to process. Please ensure all documents are
              uploaded completely and accurately.
            </p>
          </div>
          <div className="form-grid">
            {WORK_PERMIT_FIELDS.map(field => (
              <div key={field.id} className="form-group">
                <label htmlFor={field.id}>{field.label}</label>
                <input
                  type={field.type}
                  id={field.id}
                  className="form-control"
                  onChange={e => handleFormChange(
                    field.id as keyof TravelRequest,
                    field.type === "file" ? e.target.files : e.target.value
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      );
    case "advance":
      return (
        <div>
          <TravelAdvanceDetails travelInfo={travelRequestHeader} />
          <TravelAdvanceGLTable
            glLines={travelRequestHeader?.travelRequestLines}
          />
        </div>
      );
    case "visa":
      return <VisaApplicationForm travelRequest={travelRequestHeader} />;
    case "checklist":
      return visaChecklistCount > 0 ? (<VisaChecklist travelInfo={travelRequestHeader} />) : null;
    case "traveller-checklist":
      return travelChecklistCount > 0 ? (
          <TravellerChecklist travelInfo={travelRequestHeader} />
      ) : null;
    case "documents":
      return (
        <TravelDocuments
          primaryKey={{
            no: travelRequestHeader.no,
            documentType: travelRequestHeader.documentType,
          }}
          status={travelRequestHeader.approvalStatus}
          requireETA={travelRequestHeader.requireETA}
          travelId={travelRequestHeader.id}
        />
      );
    default:
      return null;
  }
};

interface StepActionsProps {
  activeTab: string;
  currentStepIndex: number;
  currentSteps: WizardStep[];
  travelRequestHeader: TravelRequest;
  handleTabChange: (stepId: string) => void;
  handleSubmitForApproval: () => Promise<void>;
  isSubmitting: boolean;
}

const StepActions: React.FC<StepActionsProps> = ({
  activeTab,
  currentStepIndex,
  currentSteps,
  travelRequestHeader,
  handleTabChange,
  handleSubmitForApproval,
  isSubmitting,
}) => {
  return (
    <div className="step-actions">
      <div className="d-flex flex-wrap gap-2">
        {currentStepIndex > 0 && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => handleTabChange(currentSteps[currentStepIndex - 1].id)}
          >
            <ArrowLeft size={16} className="button-icon" />
            Previous
          </button>
        )}

        {currentStepIndex < currentSteps.length - 1 && travelRequestHeader.no ? (
          <button
            type="button"
            className="primary-button"
            onClick={() => handleTabChange(currentSteps[currentStepIndex + 1].id)}
          >
            <ArrowRight size={16} className="button-icon" />
            Next
          </button>
        ) : (
          activeTab !== "info" && travelRequestHeader.approvalStatus === 'Open' && (
            <button
              type="submit"
              className="submit-button"
              onClick={handleSubmitForApproval}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <SectionLoader classes={'button-icon'} />
              ) : (
                <Check size={16} className="button-icon" />
              )}
              Submit for Approval
            </button>
          )
        )}
      </div>
    </div>
  );
};
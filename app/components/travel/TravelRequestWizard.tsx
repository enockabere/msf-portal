"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  User,
  ListChecks,
  Globe,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  Ticket,
  DownloadIcon,
  FileDownIcon,
  Plus,
  DownloadCloud,
  CircleX,
  CircleCheckIcon,
  RouteIcon,
  BaggageClaimIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import "./TravelRequestWizard.css";
import { TravelRequest } from "@/app/types/travel";
import {
  codeUnit,
  createResource,
  getResource,
  patchResource,
} from "@/app/lib/api/http";
import {
  decodeValue,
  pickKeys,
  removeNullAndUndefinedFromObject,
} from "@/app/utils/helpers";
import TravelHeaderForm from "../advances/forms/Travel/TravelHeaderForm";
import TravelAdvanceDetails from "./TravelAdvanceDetails";
import TravelAdvanceGLTable from "./TravelAdvanceGLTable";
import VisaApplicationForm from "@/app/components/advances/forms/Travel/VisaApplicationForm";
import ChecklistForm from "@/app/components/advances/forms/Travel/ChecklistForm";
import TravelDestinations from "../advances/forms/Travel/TravelDestinations";
import TravellersForm from "../advances/forms/Travel/TravellersForm";
import ServiceProvidersList from "../advances/forms/Travel/ServiceProvidersList";
import { downloadFileFromBase64 } from "@/app/utils/downloadBas64";
import TravelDocuments from "../advances/forms/Travel/TravelDocuments";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import WelcomePackageModal from "../advances/forms/Travel/WelcomePackageDownload";
import TravelAdvanceForm from "../advances/forms/Travel/TravelAdvanceForm"
import {useMySetups} from "@/app/context/SetupContext";

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
  disabled: boolean;
}

interface Props {
  requestNo?: string;
  profile: Record<string, any>;
}

const INITIAL_TRAVEL_REQUEST: TravelRequest = {
  documentType: "",
  no: "",
  travellerNo: "",
  createdbyProfileNo: "",
  originCountryCode: "",
  originCity: "",
  TypeOfTravel: "",
  purposeOfTravel: "",
  accommodationType: "",
  departureDate: "",
  returnDate: "",
  annualTrip: false,
  modeOfTransport: "AIR",
  arrivalDate: "",
  estimatedTimeOfArrival: "",
  pickupLocation: "",
  dropOffLocation: "",
  passportNo: "",
  requirePerDiem: false,
  requireETA: false,
  hasValidVisa: false,
  shortcutDimension1Code: "",
  shortcutDimension2Code: "",
  budgetCode: "",
  approvalStatus: "Open",
  travelRequestRoutes: [],
  travellers: [],
  visaApplications: [],
  bookingComplete: false,
  missionType: "",
};

export default function TravelRequestWizard({ requestNo, profile }: Props) {
  // State management
  const [activeTab, setActiveTab] = useState("info");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [travelRequestHeader, setTravelRequestHeader] = useState<TravelRequest>(
    INITIAL_TRAVEL_REQUEST
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headerRequiredFields, setHeaderRequiredFields] = useState<string[]>([]);
  const [checklistCount, setChecklistCount] = useState<Record<string, number>>({totalVisaCount: 0, totalTravelCount: 0})
  const { actions } = usePageLoader();
  const { dispatcher } = actions;
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { expenseCodes, fetchSetups } = useMySetups();

  // Derived values
  const isReadOnly = useMemo(
    () => travelRequestHeader.approvalStatus !== "Open" || decodeValue(travelRequestHeader.documentType) === 'Non-Resident',
    [travelRequestHeader.approvalStatus, travelRequestHeader.documentType]
  );

  const disableTabs = useMemo(
    () => !travelRequestHeader.no,
    [travelRequestHeader.no]
  );

  const canSubmitForApproval = useMemo(() => {
    const currentStatus = decodeValue(travelRequestHeader.approvalStatus);

    return (
      travelRequestHeader.documentType === "Employee" &&
      travelRequestHeader.no &&
      currentStatus === "Open" &&
      travelRequestHeader.travelRequestRoutes.length > 0
    );
  }, [travelRequestHeader]);

  const canCancelApprovalRequest = useMemo(() => {
    const currentStatus = decodeValue(travelRequestHeader.approvalStatus);
    return (
      travelRequestHeader.documentType === "Employee" &&
      currentStatus === "Pending Approval"
    );
  }, [travelRequestHeader]);

  const requireVisa = useMemo(() => {
    return travelRequestHeader.approvalStatus === "Released"
      && travelRequestHeader.visaApplications.length > 0
  }, [travelRequestHeader.approvalStatus, travelRequestHeader.visaApplications]);

  const checklistCounter = (travellers: Array<Record<string, any>>) => {
    return travellers.reduce(
      (acc, traveller) => {
        const visaItems = traveller.travellerChecklist?.filter(
          item => item.checklistType === 'Visa'
        ).length || 0;

        const travelItems = traveller.travellerChecklist?.filter(
          item => item.checklistType === 'Travel'
        ).length || 0;

        return {
          totalVisaCount: acc.totalVisaCount + visaItems,
          totalTravelCount: acc.totalTravelCount + travelItems,
        };
      },
      { totalVisaCount: 0, totalTravelCount: 0 }
    );
  };

  // Effects
  useEffect(() => {
    if (
      travelRequestHeader?.no &&
      travelRequestHeader?.currentStage === "WELCOME PACKAGE"
    ) {
      const timeout = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 800);

      return () => clearTimeout(timeout);
    } else {
      setShowWelcomeModal(false);
    }
  }, [travelRequestHeader?.no, travelRequestHeader?.currentStage]);

  useEffect(() => {
    const initializeProfileData = () => {
      const baseData = {
        documentType: decodeValue(profile.type),
        citizenNonCitizen: profile.citizenNonCitizen,
        travellerNo: profile.no,
        createdbyProfileNo: profile.no,
        passportNo: profile.passportNo || '',
        shortcutDimension1Code: profile.shortcutDimension1Code || '',
        shortcutDimension2Code: profile.shortcutDimension2Code || '',
      };

      setTravelRequestHeader((prev) => ({...prev, ...baseData}));
    };

    const setRequiredFieldsBasedOnProfile = () => {
      const baseFields = [
        "documentType",
        "passportNo",
        "travellerNo",
        "requirePerDiem",
        "missionType",
      ];

      if (profile.type === "Employee") {
        setHeaderRequiredFields([
          ...baseFields,
          "TypeOfTravel",
          "purposeOfTravel",
          "departureDate",
          "returnDate",
          "annualTrip",
          "accommodationType",
          "shortcutDimension1Code",
        ]);
      } else if (profile.type === "Visitor") {
        setHeaderRequiredFields([
          ...baseFields,
          "originCity",
          "originCountryCode",
          "purposeOfTravel",
          "departureDate",
          "arrivalDate",
          "returnDate",
          "estimatedTimeOfArrival",
          "budgetCode",
        ]);
      } else {
        setHeaderRequiredFields(baseFields);
      }
    };

    initializeProfileData();
    setRequiredFieldsBasedOnProfile();
  }, [profile, requestNo]);

  const fetchTravelRequestResource = useCallback(async (requestNo: string) => {
    return await getResource('travelRequests', {
      params: {
        filters: { no: requestNo },
        '$expand': "travelRequestRoutes,travelRequestLines,travellers($expand=travellerChecklist($filter=verified eq false)),visaApplications,travelTypeStage",
      }
    })
  }, [])

  const fetchTravelRequest = useCallback(async (requestNo?: string) => {
    try {
      const res = await fetchTravelRequestResource(requestNo ?? travelRequestHeader.no);

      if (res.error) {
        throw new Error(res.error.message);
      }

      const header = res.value.at(0)

      setTravelRequestHeader(prev => ({ ...prev, ...header}));

      setChecklistCount(checklistCounter(header.travellers));
    } catch (error: any) {
      console.error('Error fetching travel request:', error.message);
    }
  }, [fetchTravelRequestResource, travelRequestHeader.no]);

  useEffect(() => {
    const loadHeaderRequest = async (requestNo: string) => {
      try {
        dispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: true,
            message: "Fetching Request",
          },
        });

        const res = await fetchTravelRequestResource(requestNo);

        if (res.error) {
          throw new Error(res.error.message);
        }

        const header = res.value.at(0)

        setTravelRequestHeader(prev => ({ ...prev, ...header}));

        setChecklistCount(checklistCounter(header.travellers));
      } catch (error: any) {
        console.error('Error fetching travel request:', error.message);
      } finally {
        dispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
      }
    };

    if (requestNo) {
      loadHeaderRequest(requestNo);
    }

    fetchSetups(['expenseCodes']);
  }, [dispatcher, fetchSetups, fetchTravelRequestResource, requestNo]);

  const getKeysToRetain = () => {
    const excludedKeys: (keyof typeof INITIAL_TRAVEL_REQUEST)[] = [
      "approvalStatus",
      "travelRequestRoutes",
      "travellers",
      "visaApplications",
      "requireETA",
      "hasValidVisa",
    ];

    return (
      Object.keys(
        INITIAL_TRAVEL_REQUEST
      ) as (keyof typeof INITIAL_TRAVEL_REQUEST)[]
    ).filter((key) => !excludedKeys.includes(key));
  };

  const saveTravelRequestHeader = async () => {
    try {
      const strippedPayload =
        removeNullAndUndefinedFromObject(travelRequestHeader);
      const keysToRetain = getKeysToRetain() as Array<string>;

      const knownSchema = pickKeys(strippedPayload, keysToRetain);
      knownSchema.documentType = decodeValue(knownSchema.documentType);

      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: "Saving Request",
        },
      });
      const operation = knownSchema.no
        ? patchResource("travelRequests", {
            data: knownSchema,
            primaryKey: ["no", "documentType"],
          })
        : createResource("travelRequests", { data: knownSchema });

      const res = await operation;
      if (res.error) {
        throw new Error(res.error.message);
      }

      await fetchTravelRequest(res.no);
      navigateToNextStepAfterSave();
    } catch (error: any) {
      Swal.fire("Error saving request!", error.message);
    } finally {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  };

  const navigateToNextStepAfterSave = () => {
    if (travelRequestHeader.documentType === "Visitor") {
      setActiveTab("travellers");
    } else if (travelRequestHeader.documentType === "Employee") {
      setActiveTab("destinations");
    }
  };

  const handleSubmitForApproval = useCallback(async () => {
    try {
      setIsSubmitting(true);
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: "",
        },
      });
      const res = await codeUnit("sendTravelRequestForApproval", {
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
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  }, [fetchTravelRequest, travelRequestHeader.no, dispatcher]);

  const handleCancelApprovalRequest = useCallback(async () => {
    try {
      setIsSubmitting(true);
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: "",
        },
      });
      const res = await codeUnit("cancelTravelRequestApprovalRequest", {
        data: { no: travelRequestHeader.no },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      await fetchTravelRequest(travelRequestHeader.no);
      Swal.fire("Success", res.value);
    } catch (error: any) {
      Swal.fire("Error canceling approval request", error.message);
    } finally {
      setIsSubmitting(false);
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  }, [fetchTravelRequest, travelRequestHeader.no, dispatcher]);

  // Step configuration
  const allSteps = useMemo<WizardStep[]>(
    () => [
      {
        id: "info",
        icon: <User size={18} />,
        title: "Travel Details",
        desc: "General travel details",
      },
      {
        id: "destinations",
        icon: <RouteIcon size={18} />,
        title: "Travel Destinations",
        desc: "Travel destination details",
      },
      {
        id: "travellers",
        icon: <BaggageClaimIcon size={18} />,
        title: "Travellers",
        desc: "Related travellers' details",
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
        title: "Required Visas",
        desc: "Visa details",
      },
      {
        id: "advance",
        icon: <Briefcase size={18} />,
        title: "Travel Advance",
        desc: "Advance request",
      },
      {
        id: "documents",
        icon: <DownloadCloud size={18} />,
        title: "Travel Documentation",
        desc: "Supporting travel files",
      },
    ],
    []
  );

  const currentSteps = useMemo(() => {
    const baseEmployeeSteps = ["info", "destinations", "travellers"];
    const baseVisitorSteps = ["info", "travellers"];

    const normalizedType = decodeValue(
      travelRequestHeader.documentType || ""
    ).toLowerCase();
    const isVisitorType = ["visitor", "non resident", "non-resident"].includes(
      normalizedType
    );
    const isEmployeeType = normalizedType === "employee";

    if (isVisitorType) {
      baseVisitorSteps.push("documents");
      baseEmployeeSteps.push("documents");
    }

    if (travelRequestHeader.approvalStatus !== "Open") {
      if (isEmployeeType) {
        if (requireVisa) {
          baseEmployeeSteps.push("visa");
        }

        if (checklistCount.totalVisaCount) {
          baseEmployeeSteps.push('checklist');
        }

        if (checklistCount.totalTravelCount) {
          baseEmployeeSteps.push('traveller-checklist');
        }

        if (travelRequestHeader.hasValidVisa) {
          baseEmployeeSteps.push("advance");
        }

        return baseEmployeeSteps.map(id => allSteps.find(s => s.id === id)!);
      } else if (isVisitorType) {
        if (checklistCount.totalVisaCount) {
          baseVisitorSteps.push('checklist');
        }

        if (checklistCount.totalTravelCount) {
          baseVisitorSteps.push('traveller-checklist');
        }

        if (travelRequestHeader.hasValidVisa) {
          baseVisitorSteps.push("advance");
        }

        const steps = [...baseVisitorSteps, "providers"];
        return steps.map((id) => allSteps.find((s) => s.id === id)!);
      }
    } else {
      if (isEmployeeType) {
        return baseEmployeeSteps.map(
          (id) => allSteps.find((s) => s.id === id)!
        );
      } else if (isVisitorType) {
        return baseVisitorSteps.map((id) => allSteps.find((s) => s.id === id)!);
      }
    }

    return [allSteps.find((s) => s.id === "info")!];
  }, [
    travelRequestHeader.documentType,
    travelRequestHeader.approvalStatus,
    travelRequestHeader.hasValidVisa,
    allSteps,
    requireVisa,
    checklistCount.totalVisaCount,
    checklistCount.totalTravelCount
  ]);

  useEffect(() => {
    const updateCompletedSteps = () => {
      const newCompletedSteps = new Set<string>();

      currentSteps.forEach((step) => {
        switch (step.id) {
          case "info":
            if (travelRequestHeader.no) newCompletedSteps.add("info");
            break;
          case "destinations":
            if (travelRequestHeader.travelRequestRoutes?.length)
              newCompletedSteps.add("destinations");
            break;
          case "travellers":
            if (travelRequestHeader.travellers.length) newCompletedSteps.add("travellers");
            break;
          case "visa":
            if (travelRequestHeader.hasValidVisa) newCompletedSteps.add("visa");
            break;
          case "checklist":
            if (travelRequestHeader.hasValidVisa) newCompletedSteps.add("checklist");
            break;
        }
      });

      setCompletedSteps(newCompletedSteps);
    };

    if (travelRequestHeader) {
      updateCompletedSteps();
    }
  }, [travelRequestHeader, currentSteps]);

  // Event handlers
  const handleFormChange = useCallback(
    (field: keyof TravelRequest, value: any) => {
      setTravelRequestHeader((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleTabChange = (stepId: string) => {
    if (validateCurrentStep()) {
      setActiveTab(stepId);
    }
  };

  const validateCurrentStep = (): boolean => true;

  // UI calculations
  const currentStepIndex = currentSteps.findIndex((s) => s.id === activeTab);
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
    try {
      const docType = getDocumentTypeCode(travelRequestHeader?.documentType);
      const docNo = travelRequestHeader?.no;
      const destination =
        docType === "Employee"
          ? travelRequestHeader?.travelRequestRoutes[0]?.destinationCountryCode
          : travelRequestHeader?.destinationCountryCode;

      const res = await codeUnit("getIntroductoryLetter", {
        data: { docType, docNo, destination },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }
      downloadFileFromBase64(res.value, "Introductory Letter");
    } catch (error) {
      Swal.fire("Download Failed", error.message);
    }
  };

  const downLoadBtaCertificate = async () => {
    try {
      const docType = getDocumentTypeCode(travelRequestHeader?.documentType);
      const docNo = travelRequestHeader?.no;

      const res = await codeUnit("getBTACertificate", {
        data: { docType, docNo },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }
      downloadFileFromBase64(res.value, "BtaCertificate");
    } catch (error) {
      Swal.fire("Error", error.message || "An unexpected error occurred.");
    }
  };

  const confirmBooking = async (value) => {
    try {
      const res = await patchResource("travelRequests", {
        data: {
          bookingComplete: value,
          no: travelRequestHeader.no,
          documentType: travelRequestHeader.documentType,
        },
        primaryKey: ["no", "documentType"],
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      await fetchTravelRequest(travelRequestHeader.no);
      Swal.fire("Success", "Travel booking confirmed successfully");
    } catch (error) {
      Swal.fire("Error", error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div>
      {showWelcomeModal && (
        <WelcomePackageModal
          no={travelRequestHeader?.no}
          show={showWelcomeModal}
          onHide={() => setShowWelcomeModal(false)}
        />
      )}
      <div
        className="travel-wizard"
        style={{ filter: showWelcomeModal ? "blur(3px)" : "none" }}
      >
        <div className="wizard-header">
          <div className="d-flex align-items-start gap-4">
            <div className="">
              <h2 className="wizard-title">Travel Request Application</h2>
              {travelRequestHeader.currentStage && (
                <div className="d-flex align-items-center mt-1">
                  <h5 className="m-0">Current Stage:</h5>
                  <span className="badge bg-primary p-1 ms-2">
                    {" "}
                    {travelRequestHeader.travelTypeStage?.description || travelRequestHeader.currentStage}
                  </span>
                </div>
              )}
              <p className="wizard-subtitle">
                Fill out your travel request in steps.
              </p>
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
              {currentSteps?.map((step) => (
                <li key={step?.id} className="step-item">
                  <button
                    className={`step-button ${
                      activeTab === step?.id ? "active" : ""
                    } ${completedSteps?.has(step?.id) ? "completed" : ""}`}
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
              canCancelApprovalRequest={canCancelApprovalRequest}
              isSubmitting={isSubmitting}
              handleSubmitForApproval={handleSubmitForApproval}
              handleCancelApprovalRequest={handleCancelApprovalRequest}
              downLoadBtaCertificate={downLoadBtaCertificate}
              downLoadIntroductoryLetter={downLoadIntroductoryLetter}
            />

            <StepContent
              activeTab={activeTab}
              travelRequestHeader={travelRequestHeader}
              headerRequiredFields={headerRequiredFields}
              isReadOnly={isReadOnly}
              saveTravelRequestHeader={saveTravelRequestHeader}
              fetchTravelRequest={fetchTravelRequest}
              handleFormChange={handleFormChange}
              checklistCount={checklistCount}
              confirmBooking={confirmBooking}
              expenseCodes={expenseCodes}
            />

              <StepActions
                currentStepIndex={currentStepIndex}
                currentSteps={currentSteps}
                travelRequestHeader={travelRequestHeader}
                handleTabChange={handleTabChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepHeaderProps {
  activeTab: string;
  currentSteps: WizardStep[];
  canSubmitForApproval: boolean;
  canCancelApprovalRequest: boolean;
  isSubmitting: boolean;
  handleSubmitForApproval: () => Promise<void>;
  handleCancelApprovalRequest: () => Promise<void>;
  downLoadIntroductoryLetter: () => void;
  downLoadBtaCertificate: () => void;
}

const StepHeader: React.FC<StepHeaderProps> = ({
  activeTab,
  currentSteps,
  canSubmitForApproval,
  canCancelApprovalRequest,
  isSubmitting,
  handleSubmitForApproval,
  handleCancelApprovalRequest,
  downLoadIntroductoryLetter,
  downLoadBtaCertificate,
}) => (
  <div className="d-flex align-items-center justify-content-between mb-3 p-2 wizard-bg-gray">
    <h4 className="step-panel-title">
      {currentSteps.find((s) => s.id === activeTab)?.title}
    </h4>
    <div className="d-flex align-items-center ">
      {currentSteps
        .find((s) => s.id === activeTab)
        ?.actions?.map((action) => (
          <button
            key={action.id}
            className="primary-button"
            onClick={action.fn}
            disabled={action.disabled}
          >
            <Plus size={16} />
            {action.caption}
          </button>
        ))}

      {activeTab === "checklist" && (
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm mx-2 dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <DownloadIcon size={16} className="button-icon" />
            Download Docs
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                onClick={downLoadIntroductoryLetter}
                className="dropdown-item"
                type="button"
              >
                <FileDownIcon size={16} className="button-icon" />
                Introductory Letter
              </button>
            </li>
            <li>
              <button
                onClick={downLoadBtaCertificate}
                className="dropdown-item"
                type="button"
              >
                <FileDownIcon size={16} className="button-icon" />
                BTA Certificate
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
          <CircleCheckIcon size={16} className="button-icon" />
          Submit for Approval
        </button>
      )}

      {canCancelApprovalRequest && (
        <button
          className="btn btn-outline-danger"
          onClick={handleCancelApprovalRequest}
          disabled={isSubmitting}
        >
          <CircleX size={16} className="button-icon" />
          Cancel Approval
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
  saveTravelRequestHeader: () => Promise<void>;
  fetchTravelRequest: () => Promise<void>;
  handleFormChange: (field: keyof TravelRequest, value: any) => void;
  checklistCount: Record<string, number>;
  confirmBooking: (value) => void;
  expenseCodes: Record<string, any>;
}

const StepContent: React.FC<StepContentProps> = ({
  activeTab,
  travelRequestHeader,
  headerRequiredFields,
  isReadOnly,
  saveTravelRequestHeader,
  fetchTravelRequest,
  handleFormChange,
  checklistCount,
  confirmBooking,
  expenseCodes,
}) => {
  switch (activeTab) {
    case "info":
      return (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await saveTravelRequestHeader();
          }}
        >
          <TravelHeaderForm
            formData={travelRequestHeader}
            requiredFields={headerRequiredFields}
            isReadOnly={isReadOnly}
            onFormChange={handleFormChange}
          />

          {!isReadOnly && (
            <div className="step-actions">
              <button
                type="submit"
                className="primary-button"
              >
                <Save size={16} className="button-icon" />
                Save & Continue
              </button>
            </div>
          )}
        </form>
      );
    case "destinations":
      return (
        <TravelDestinations
          travelRequestHeader={travelRequestHeader}
          isReadOnly={isReadOnly}
          onSubmit={fetchTravelRequest}
        />
      );
    case "travellers":
      return (
        <TravellersForm
          travelRequestHeader={travelRequestHeader}
          isReadOnly={isReadOnly}
          onSubmit={fetchTravelRequest}
        />
      );
    case "providers":
      return <ServiceProvidersList travelRequest={travelRequestHeader} />;
    case "advance":
      return travelRequestHeader.hasValidVisa ? (
        <div>
          <div>
            <p className="fw-bold">
              Click this link to complete your travel booking{" "}
              <a
                href="https://fcmtravel.co.ke/msf/"
                target="_blank"
                className=""
              >
                fcmtravel.co.ke/msf
              </a>
            </p>
            <div className="d-flex align-items-center mb-2">
              <span className="me-2">Confirm booking is completed</span>

              <input
                type="checkbox"
                checked={travelRequestHeader?.bookingComplete}
                disabled={travelRequestHeader?.bookingComplete}
                onChange={(e) => confirmBooking(e.target.checked)}
              />
            </div>
          </div>
          <TravelAdvanceDetails travelInfo={travelRequestHeader} />
          <TravelAdvanceForm
              expenseCodes={expenseCodes}
              travelInfo={travelRequestHeader}
              onSubmit={fetchTravelRequest} />
          <TravelAdvanceGLTable
              travelInfo={travelRequestHeader}
          />
        </div>
      ) : null;
    case "visa":
      return <VisaApplicationForm travelRequest={travelRequestHeader} expenseCodes={expenseCodes} onSubmit={fetchTravelRequest} />;
    case "checklist":
      return checklistCount.totalVisaCount > 0 ? (
        <ChecklistForm travelInfo={travelRequestHeader} checklistType={"Visa"} />
      ) : null;
    case "traveller-checklist":
      return checklistCount.totalTravelCount > 0 ? (
        <ChecklistForm travelInfo={travelRequestHeader} checklistType={"Travel"} />
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
  currentStepIndex: number;
  currentSteps: WizardStep[];
  travelRequestHeader: TravelRequest;
  handleTabChange: (stepId: string) => void;
}

const StepActions: React.FC<StepActionsProps> = ({
  currentStepIndex,
  currentSteps,
  travelRequestHeader,
  handleTabChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVisitorSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await codeUnit("submitVisitorTravelRequest", {
        data: { no: travelRequestHeader.no },
      });

      if (res.error) throw new Error(res.error.message);

      Swal.fire("Success", "Travel request submitted successfully!", "success");
      handleTabChange(currentSteps[currentStepIndex + 1].id);
    } catch (err: any) {
      Swal.fire("Submission Failed", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVisitor = travelRequestHeader.documentType === "Visitor";
  const isLastVisitorStepBeforeDocuments =
    isVisitor &&
    currentSteps[currentStepIndex + 1]?.id === "documents" &&
    !travelRequestHeader.currentStage;

  return (
    <div className="step-actions">
      <div className="d-flex flex-wrap gap-2">
        {currentStepIndex > 0 && (
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              handleTabChange(currentSteps[currentStepIndex - 1].id)
            }
          >
            <ArrowLeft size={16} className="button-icon" />
            Previous
          </button>
        )}

        {currentStepIndex < currentSteps.length - 1 &&
          travelRequestHeader.no && (
            <button
              type="button"
              className="primary-button"
              onClick={
                isLastVisitorStepBeforeDocuments
                  ? handleVisitorSubmit
                  : () => handleTabChange(currentSteps[currentStepIndex + 1].id)
              }
              disabled={isSubmitting}
            >
              {isLastVisitorStepBeforeDocuments ? (
                <>
                  <Check size={16} className="button-icon" />
                  Submit Travel Request
                </>
              ) : (
                <>
                  <ArrowRight size={16} className="button-icon" />
                  Next
                </>
              )}
            </button>
          )}
      </div>
    </div>
  );
};

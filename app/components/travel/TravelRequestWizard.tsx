"use client";

import React, {
  useCallback,
  useMemo,
  useState,
  MouseEventHandler,
  useEffect,
} from "react";
import {
  User,
  ListChecks,
  Globe,
  Briefcase,
  FilePlus2,
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  Ticket,
  Link,
  DownloadIcon,
  FileDownIcon,
  Plus,
  Loader,
  Send,
} from "lucide-react";
import "./TravelRequestWizard.css";
import TravelHeaderForm from "../advances/forms/Travel/TravelHeaderForm";
import { TravelRequest } from "@/app/types/travel";
import TravelAdvanceDetails from "./TravelAdvanceDetails";
import TravelAdvanceGLTable from "./TravelAdvanceGLTable";
import VisaApplicationForm from "@/app/components/advances/forms/Travel/VisaApplicationForm";
import VisaChecklist from "@/app/components/advances/forms/Travel/VisaChecklist";
import TravelDestinations from "../advances/forms/Travel/TravelDestinations";
import TravelTicketSelector from "../advances/forms/Travel/TravelTicketSelector";
import TravelDependencies from "../advances/forms/Travel/TravelDependencies";
import { codeUnit, createResource, getResource, patchResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  checkIfMissingRequiredProperty, pickKeys,
  removeNullAndUndefinedFromObject,
} from "@/app/utils/helpers";
import TravellerChecklist from "@/app/components/advances/forms/Travel/TravellerChecklist";

interface WizardStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  actions?: stepAction[];
}

interface stepAction {
  id: any;
  fn: MouseEventHandler<HTMLButtonElement>;
  caption: string;
}

interface TicketItem {
  id: string;
  ticketNumber: string;
  departure: string;
  destination: string;
  travelDate: string;
  airline: string;
}

interface Props {
  requestNo?: string,
  profile: Record<string, any>
}

export default function TravelRequestWizard({ requestNo, profile }: Props) {
  const [activeTab, setActiveTab] = useState("info");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [travelRequestHeader, setTravelRequestHeader] = useState<TravelRequest>({
    documentType: '',
    no: '',
    travellerNo: '',
    createdbyProfileNo: '',
    originCountryCode: '',
    originCity: '',
    destinationCountryCode: '',
    destinationCity: '',
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
    travelRequestRoutes: [],
    travellers: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [headerRequiredFields, setHeaderRequiredFields] = useState(['documentType', 'passportNo', 'shortcutDimension1Code', 'travellerNo'])

  useEffect(() => {
    if (requestNo) {
      setTravelRequestHeader((prev) => ({
        ...prev,
        documentType: profile.type
      }))
    } else {
      setTravelRequestHeader((prev) => ({
        ...prev,
        documentType: profile.type,
        travellerNo: profile.no,
        createdbyProfileNo: profile.no,
        passportNo: profile.passportIDNo,
        shortcutDimension1Code: profile.shortcutDimension1Code,
        shortcutDimension2Code: profile.shortcutDimension2Code,
      }))
    }

    setHeaderRequiredFields((prev) => {
      if (profile.type === 'Employee') {
        return [...prev, 'TypeOfTravel', 'purposeOfTravel', 'departureDate', 'returnDate', 'annualTrip', 'requirePerDiem', 'accommodationType']
      } else if (profile.type === 'Visitor') {
        return [...prev, 'originCity', 'originCountryCode', 'destinationCity', 'destinationCountryCode', 'purposeOfTravel', 'departureDate', 'arrivalDate', 'returnDate', 'estimatedTimeOfArrival']
      }
      return [...prev]
    })
  }, [profile, requestNo]);

  useEffect(() => {
    if (requestNo) {
      fetchTravelRequest(requestNo)
    }
  }, [requestNo]);

  const fetchTravelRequest = async (requestNo: string) => {
    try {
      const res = await getResource('travelRequests', {
        params: {
          filters: {
            no: requestNo
          },
          '$expand': 'travelRequestRoutes,travelRequestLines,travellers,visaApplications',
        }
      });

      if (res.error) {
        console.log('Travel request error: ', res.error);
        toast.error(res.error.message)
      } else {
        setTravelRequestHeader((prev: Record<string, any>) => ({...prev, ...res.value.at(0)}))
        console.log('Travel Request Header', res.value.at(0))
      }
    } catch (error: any) {
      console.log('Error fetching travel request!', error.message)
    }
  }

  const saveTravelRequestHeader = async () => {
    try {
      const strippedPayLoad = removeNullAndUndefinedFromObject(travelRequestHeader);
      const keysToRetain = [
        'no',
        'documentType',
        'passportNo',
        'shortcutDimension1Code',
        'travellerNo',
        'createdbyProfileNo',
        'TypeOfTravel',
        'purposeOfTravel',
        'annualTrip',
        'requirePerDiem',
        'originCity',
        'originCountryCode',
        'destinationCity',
        'destinationCountryCode',
        'departureDate',
        'arrivalDate',
        'returnDate',
        'modeOfTransport',
        'accommodationType',
        'estimatedTimeOfArrival',
      ] as Array<string>;
      const knownSchema = pickKeys(strippedPayLoad, keysToRetain);

      const isMissingRequiredProp = checkIfMissingRequiredProperty(knownSchema, headerRequiredFields);

      if (!isMissingRequiredProp) return Swal.fire("Validation Error!", `Not a valid payload`);

      if (isMissingRequiredProp.missing) {
        return Swal.fire("Validation Error!", `Missing [${isMissingRequiredProp.prop.join(",")}] ${isMissingRequiredProp.prop.length > 1 ? 'Properties' : 'Property'}`);
      }

      setIsSubmitting(true)

      const res = knownSchema.no
        ? await patchResource('travelRequests', {
          data: knownSchema,
          primaryKey: ['no', 'documentType'],
        })
        : await createResource('travelRequests', {
          data: knownSchema,
        });

      if (res.error) {
        setIsSubmitting(false)
        return Swal.fire(res.error.code, res.error.message);
      }

      // Refetch travel request
      await fetchTravelRequest(res.no)

      setIsSubmitting(false)

      setCompletedSteps((prev) => new Set(prev).add("info"));

      if (travelRequestHeader.documentType === 'Visitor') {
        setActiveTab('checklist');
      } else if (travelRequestHeader.documentType === 'Employee') {
        setActiveTab('destinations');
      }
    } catch (error: any) {
      await Swal.fire('Error!', error.message)
      setIsSubmitting(false)
    }
  };

  const canSubmitForApproval = useMemo(() => {
    const canSubmit = travelRequestHeader.no && travelRequestHeader.approvalStatus && travelRequestHeader.approvalStatus === 'Open'
    if (travelRequestHeader.documentType === 'Employee') {
      return canSubmit && travelRequestHeader.travelRequestRoutes.length > 0
    }

    return canSubmit
  }, [travelRequestHeader])

  const handleSubmitForApproval = useCallback(async () => {
    try {
      const res = await codeUnit('sendTravelRequestForApproval', {
        data: {
          no: travelRequestHeader.no,
        },
      });
      if (res.error) {
        return Swal.fire("Error submitting for approval!", res.error.message);
      }

      // Refetch travel request
      await fetchTravelRequest(res.no)

      Swal.fire("Success", res.value);
    } catch (error) {
      Swal.fire("Error", error.message);
    }
  }, [travelRequestHeader.no])

  const [availableTickets] = useState<TicketItem[]>([
    {
      id: "1",
      ticketNumber: "TK123456",
      departure: "Nairobi",
      destination: "London",
      travelDate: "2025-06-10",
      airline: "Kenya Airways",
    },
    {
      id: "2",
      ticketNumber: "TK654321",
      departure: "Nairobi",
      destination: "Dubai",
      travelDate: "2025-07-02",
      airline: "Emirates",
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleSelectTicket = useCallback((ticketId: string) => {
    setSelectedTicketId(ticketId);
  }, []);

  const handleCreateTravelAdvance = useCallback(async () => {
    try {
      const res = await codeUnit("createTravelAdvanceFromTravel", {
        data: {
          no: "",
        },
      });
      if (res.error) {
        Swal.fire("Error Creating Travel Advance!", res.error.message);
      } else {
        Swal.fire("Success", "You have successfully created travel advance!");
      }
    } catch (error) {
      Swal.fire("Error", error.message);
    }
  }, []);

  const allSteps = useMemo<WizardStep[]>(
    () => [
      {
        id: "info",
        icon: <User size={18}/>,
        title: "Your Info",
        desc: "Basic travel details",
      },
      {
        id: "destinations",
        icon: <Globe size={18}/>,
        title: "Travel Destinations",
        desc: "Travel destination details",
      },
      {
        id: "dependencies",
        icon: <Link size={18}/>,
        title: "Dependants",
        desc: "Related travel requirements",
      },
      {
        id: "ticket",
        icon: <Ticket size={18}/>,
        title: "Annual Travel Ticket",
        desc: "Flight/train reservations",
      },
      {
        id: "checklist",
        icon: <ListChecks size={18}/>,
        title: "Visa Checklist",
        desc: "Visa Pre-travel requirements",
      },
      {
        id: "traveller-checklist",
        icon: <ListChecks size={18}/>,
        title: "Traveller Checklist",
        desc: "Pre-travel requirements",
      },
      {
        id: "visa",
        icon: <Globe size={18}/>,
        title: "Visa Application",
        desc: "Visa documentation",
      },
      {
        id: "permit",
        icon: <FilePlus2 size={18}/>,
        title: "Work Permit",
        desc: "Work authorization",
      },
      {
        id: "advance",
        icon: <Briefcase size={18}/>,
        title: "Travel Advance",
        desc: "Advance request",
        actions: [
          {
            id: "action-create-advance",
            caption: "Create Advance",
            fn: async () => {
              await handleCreateTravelAdvance();
            },
          },
        ],
      },
    ],
    [handleCreateTravelAdvance]
  ); // ✅ Correct dependencies

  // Get the appropriate steps based on user type
  const currentSteps = useMemo((): WizardStep[] => {
    if (travelRequestHeader.documentType === "Employee") {
      return [
        "info",
        "destinations",
        "dependencies",
        "ticket",
        "checklist",
        "traveller-checklist",
        "visa",
        "advance",
      ].map((id) => allSteps.find((s) => s.id === id)!);
    } else if (travelRequestHeader.documentType === "Visitor") {
      return ["info", "dependencies", "checklist", "traveller-checklist", "permit", "advance"].map(
        (id) => allSteps.find((s) => s.id === id)!
      );
    }
    return [allSteps.find((s) => s.id === "info")!];
  }, [travelRequestHeader.documentType, allSteps]);

  const handleFormChange = useCallback((field: keyof TravelRequest, value: any) => {
    setTravelRequestHeader((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleTabChange = async (stepId: string) => {
    if (validateCurrentStep()) {
      setActiveTab(stepId);
      setCompletedSteps((prev) => new Set(prev).add(activeTab));
    }
  };

  const validateCurrentStep = (): boolean => {
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const currentStepIndex = currentSteps.findIndex((s) => s.id === activeTab);
  const progressPercentage = (completedSteps.size / currentSteps.length) * 100;

  // Work Permit form fields
  const workPermitFields = [
    {id: "country", label: "Country of Work", type: "text"},
    {id: "duration", label: "Duration (days)", type: "number"},
    {id: "documents", label: "Required Documents", type: "file"},
  ];

  return (
    <div className="travel-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">Travel Request Application</h2>
        <p className="wizard-subtitle">
          Fill out your travel request in steps.
        </p>

        <div className="wizard-progress">
          <div
            className="progress-bar"
            style={{width: `${progressPercentage}%`}}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      <div className="wizard-body">
        <nav className="wizard-sidebar" aria-label="Travel request steps">
          <ul className="step-list" role="tablist">
            {currentSteps.map((step) => (
              <li key={step.id} className="step-item">
                <button
                  className={`step-button ${
                    activeTab === step.id ? "active" : ""
                  } ${completedSteps.has(step.id) ? "completed" : ""}`}
                  onClick={() => handleTabChange(step.id)}
                  role="tab"
                  aria-selected={activeTab === step.id}
                  aria-controls={`${step.id}-panel`}
                  id={`${step.id}-tab`}
                  tabIndex={activeTab === step.id ? 0 : -1}
                >
                  <span className="step-icon-wrapper">
                    <span className="step-icon">{step.icon}</span>
                  </span>
                  <span className="step-content">
                    <span className="step-title">{step.title}</span>
                    <span className="step-desc">{step.desc}</span>
                  </span>
                  {completedSteps.has(step.id) && (
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
            <div className="d-flex align-items-center justify-content-between mb-3 p-2 wizard-bg-gray">
              <h4 className="step-panel-title">
                {currentSteps.find((s) => s.id === activeTab)?.title}
              </h4>
              {currentSteps.find((s) => s.id === activeTab)?.actions &&
                currentSteps
                  .find((s) => s.id === activeTab)
                  ?.actions.map((action: stepAction) => {
                  return (
                    <button
                      key={action.id}
                      className="primary-button"
                      onClick={action.fn}
                    >
                      <Plus size={16}/>
                      {action.caption}
                    </button>
                  );
                })}
              {activeTab === "visa" && (
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mx-2 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <DownloadIcon size={16} className="button-icon"/>
                    Download
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" type="button">
                        <FileDownIcon size={16} className="button-icon"/>
                        Dummy ticket
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" type="button">
                        <FileDownIcon size={16} className="button-icon"/>
                        Accommodation voucher
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" type="button">
                        <FileDownIcon size={16} className="button-icon"/>
                        Letter of intent
                      </button>
                    </li>
                  </ul>
                </div>
              )}
              {canSubmitForApproval && (
                <button
                  className="primary-button"
                  onClick={handleSubmitForApproval}
                >
                  <Send size={16}/>
                  Submit for Approval
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === "info" && (
                <TravelHeaderForm
                  formData={travelRequestHeader}
                  requiredFields={headerRequiredFields}
                  onFormChange={handleFormChange}
                />
              )}

              {activeTab === "destinations" && (
                <TravelDestinations
                  travelRequestHeader={travelRequestHeader}
                  onSubmit={fetchTravelRequest}
                />
              )}

              {activeTab === "ticket" && (
                <TravelTicketSelector
                  tickets={availableTickets}
                  selectedTicketId={selectedTicketId}
                  onSelectTicket={handleSelectTicket}
                />
              )}

              {activeTab === "dependencies" && (
                <TravelDependencies
                  travelRequestHeader={travelRequestHeader}
                  onSubmit={fetchTravelRequest}
                />
              )}

              {activeTab === "permit" && (
                <div className="permit-form">
                  <div className="permit-notice mb-4">
                    <p className="notice-text">
                      <strong>Note:</strong> Work permit applications typically
                      take 3-4 weeks to process. Please ensure all documents are
                      uploaded completely and accurately.
                    </p>
                  </div>

                  <div className="form-grid">
                    {workPermitFields.map((field) => (
                      <div key={field.id} className="form-group">
                        <label htmlFor={field.id}>{field.label}</label>
                        {field.type === "file" ? (
                          <input
                            type="file"
                            id={field.id}
                            className="form-control"
                            onChange={(e) =>
                              handleFormChange(
                                field.id as keyof TravelRequest,
                                e.target.files
                              )
                            }
                          />
                        ) : (
                          <input
                            type={field.type}
                            id={field.id}
                            className="form-control"
                            onChange={(e) =>
                              handleFormChange(
                                field.id as keyof TravelRequest,
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "advance" && (
                <div>
                  <TravelAdvanceDetails travelInfo={travelRequestHeader}/>
                  <TravelAdvanceGLTable
                    glLines={[
                      {
                        account: "6001",
                        description: "Flight Ticket",
                        amount: 500,
                        currency: travelRequestHeader.currency,
                        department: "",
                        project: "",
                      },
                      {
                        account: "6002",
                        description: "Hotel",
                        amount: 300,
                        currency: travelRequestHeader.currency,
                        department: "",
                        project: "",
                      },
                    ]}
                  />
                </div>
              )}

              {activeTab === "visa" && <VisaApplicationForm />}

              {activeTab === "traveller" && <VisaApplicationForm/>}

              {activeTab === "checklist" && <VisaChecklist travelInfo={travelRequestHeader}/>}

              {activeTab === "traveller-checklist" && <TravellerChecklist travelInfo={travelRequestHeader}/>}

              <div className="step-actions">
                {activeTab === "info" ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={saveTravelRequestHeader}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? <Loader size={16} className="button-icon blink-animation"/>
                      : <Save size={16} className="button-icon"/>}
                    Save & Continue
                  </button>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {currentStepIndex > 0 && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleTabChange(currentSteps[currentStepIndex - 1].id)
                        }
                      >
                        <ArrowLeft size={16} className="button-icon"/>
                        Previous
                      </button>
                    )}

                    {activeTab === "visa" &&
                    travelRequestHeader.documentType === "Employee" ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setCompletedSteps((prev) =>
                            new Set(prev).add("visa")
                          );
                          setActiveTab("advance");
                        }}
                      >
                        <Check size={16} className="button-icon"/>
                        Submit Travel Request
                      </button>
                    ) : activeTab === "permit" &&
                    travelRequestHeader.documentType === "Visitor" ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setCompletedSteps((prev) =>
                            new Set(prev).add("permit")
                          );
                          setActiveTab("advance");
                        }}
                      >
                        <Check size={16} className="button-icon"/>
                        Submit Travel Request
                      </button>
                    ) : currentStepIndex < currentSteps.length - 1 ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          handleTabChange(currentSteps[currentStepIndex + 1].id)
                        }
                      >
                        <ArrowRight size={16} className="button-icon"/>
                        Next
                      </button>
                    ) : (
                      <button type="submit" className="submit-button">
                        <Check size={16} className="button-icon"/>
                        Submit Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

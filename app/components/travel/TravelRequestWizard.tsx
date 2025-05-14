"use client";

import React, {
    useCallback,
    useMemo,
    useState,
    MouseEventHandler, useEffect,
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
} from "lucide-react";
import "./TravelRequestWizard.css";
import TravelHeaderForm from "../advances/forms/Travel/TravelHeaderForm";
import {TravelInfo} from "@/app/types/travel";
import TravelAdvanceDetails from "./TravelAdvanceDetails";
import TravelAdvanceGLTable from "./TravelAdvanceGLTable";
import VisaApplicationForm from "@/app/components/advances/forms/Travel/VisaApplicationForm";
import TravelDestinations from "../advances/forms/Travel/TravelDestinations";
import TravelTicketSelector from "../advances/forms/Travel/TravelTicketSelector";
import TravelDependencies from "../advances/forms/Travel/TravelDependencies";
import {codeUnit, getResource} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import {useSession} from "next-auth/react";
import {toast} from "react-toastify";

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

interface DestinationItem {
    id: string;
    originCountry: string;
    originCity: string;
    destinationCountry: string;
    destinationCity: string;
    travelDate: string;
    transportMode: string;
    visaRequired: string;
}

interface TicketItem {
    id: string;
    ticketNumber: string;
    departure: string;
    destination: string;
    travelDate: string;
    airline: string;
}

interface Dependency {
    id: string;
    fullName: string;
    relationship: string;
}

export default function TravelRequestWizard() {
    const [activeTab, setActiveTab] = useState("info");
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [travelInfo, setTravelInfo] = useState<TravelInfo>({
        documentType: '',
        no: '',
        travellerNo: '',
        TypeOfTravel: '',
        purposeOfTravel: '',
        departureDate: '',
        returnDate: '',
        annualTrip: false,
        modeOfTransport: '',
        arrivalDate: '',
        estimatedTimeOfArrival: '',
        pickupLocation: '',
        dropOffLocation: '',
        passportNo: '',
        requirePerDiem: '',
        shortcutDimension1Code: '',
        shortcutDimension2Code: '',

        basedOnRequest: "Yes",
        travelRequestId: "",
        tripType: "",
        costCenter: "",
        remainingTrips: "",
        tripDates: {from: "", to: ""},
        destination: "",
        applyForOther: "No",
        currency: "",
        paymentMethod: "",
        travelType: "",
        visaRequired: "No",
        workPermitRequired: "No",
        destinations: [],
    });

    const [submitted, setSubmitted] = useState(false);

    console.log(submitted);

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

    const {data: session} = useSession();
    const profileNo = session?.user?.profile?.no
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getResource('travelProfile', {
                    params: {
                        filters: {
                            no: profileNo
                        }
                    }
                });

                if (res.error) {
                    console.log("Response Error: ", res.error);
                    toast.error(res.error.message)
                } else {
                    setProfile(res.value.at(0))
                }
            } finally {
                //
            }
        };

        fetchProfile();
    }, [profileNo]);

    useEffect(() => {
        if (profile) {
            setTravelInfo((prev) => ({
                ...prev,
                documentType: profile.type,
                travellerNo: profile.no,
                passportNo: profile.passportIDNo,
                shortcutDimension1Code: profile.shortcutDimension1Code,
                shortcutDimension2Code: profile.shortcutDimension2Code,
            }))
        }
    }, [profile]);

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    const handleSelectTicket = useCallback((ticketId: string) => {
        setSelectedTicketId(ticketId);
    }, []);

    const [availableDependencies] = useState<Dependency[]>([
        {
            id: "01",
            fullName: "Alice Mwangi",
            relationship: "Wife",
        },
        {
            id: "02",
            fullName: "James Otieno",
            relationship: "Son",
        },
        {
            id: "03",
            fullName: "Sarah Wanjiku",
            relationship: "Daughter",
        },
    ]);

    const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
        []
    );

    const handleSelectDependency = (id: string) => {
        setSelectedDependencies((prev) => [...prev, id]);
    };

    const handleDeselectDependency = (id: string) => {
        setSelectedDependencies((prev) => prev.filter((d) => d !== id));
    };

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

    const handleAddDestination = useCallback(() => {
        setTravelInfo((prev) => ({
            ...prev,
            destinations: [
                ...prev.destinations,
                {
                    id: Date.now().toString(),
                    originCountry: "",
                    originCity: "",
                    destinationCountry: "",
                    destinationCity: "",
                    travelDate: "",
                    transportMode: "",
                    visaRequired: "No",
                } as any,
            ],
        }));
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
                actions: [
                    {
                        id: "action-add-destination",
                        caption: "Add Destination",
                        fn: () => {
                            handleAddDestination();
                        },
                    },
                ],
            },
            {
                id: "dependencies",
                icon: <Link size={18}/>,
                title: "Travel Dependencies",
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
                title: "Checklist",
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
        [handleAddDestination, handleCreateTravelAdvance]
    ); // ✅ Correct dependencies

    // Get the appropriate steps based on user type
    const currentSteps = useMemo((): WizardStep[] => {
        if (travelInfo.documentType === "Employee") {
            return [
                "info",
                "destinations",
                "dependencies",
                "ticket",
                "checklist",
                "visa",
                "advance",
            ].map((id) => allSteps.find((s) => s.id === id)!);
        } else if (travelInfo.documentType === "Visitor") {
            return ["info", "checklist", "permit", "advance"].map(
                (id) => allSteps.find((s) => s.id === id)!
            );
        }
        return [allSteps.find((s) => s.id === "info")!];
    }, [travelInfo.documentType, allSteps]);

    const handleChange = useCallback((field: keyof TravelInfo, value: any) => {
        setTravelInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleTabChange = (stepId: string) => {
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

    const handleInitialSubmit = () => {
        setCompletedSteps((prev) => new Set(prev).add("info"));
        setSubmitted(true);

        if (travelInfo.documentType === "Visitor") {
            setActiveTab("checklist");
        } else if (travelInfo.documentType === "Employee") {
            setActiveTab("destinations");
        }
    };

    const handleDestinationChange = useCallback(
        <K extends keyof DestinationItem>(
            index: number,
            field: K,
            value: DestinationItem[K]
        ) => {
            setTravelInfo((prev) => {
                const newDestinations = [...prev.destinations];
                newDestinations[index] = {
                    ...newDestinations[index],
                    [field]: value,
                };
                return {
                    ...prev,
                    destinations: newDestinations,
                };
            });
        },
        []
    );

    const handleRemoveDestination = useCallback((index: number) => {
        setTravelInfo((prev) => ({
            ...prev,
            destinations: prev.destinations.filter((_, i) => i !== index),
        }));
    }, []);

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
                        </div>

                        <form onSubmit={handleSubmit}>
                            {activeTab === "info" && (
                                <TravelHeaderForm
                                    travelInfo={travelInfo}
                                    handleChange={handleChange}
                                />
                            )}

                            {activeTab === "destinations" && (
                                <TravelDestinations
                                    destinations={travelInfo.destinations as any}
                                    onDestinationChange={handleDestinationChange}
                                    onRemoveDestination={handleRemoveDestination}
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
                                    availableDependencies={availableDependencies}
                                    selectedDependencies={selectedDependencies}
                                    onSelectDependency={handleSelectDependency}
                                    onDeselectDependency={handleDeselectDependency}
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
                                                            handleChange(
                                                                field.id as keyof TravelInfo,
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
                                                            handleChange(
                                                                field.id as keyof TravelInfo,
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
                                    <TravelAdvanceDetails travelInfo={travelInfo}/>
                                    <TravelAdvanceGLTable
                                        glLines={[
                                            {
                                                account: "6001",
                                                description: "Flight Ticket",
                                                amount: 500,
                                                currency: travelInfo.currency,
                                                department: "",
                                                project: "",
                                            },
                                            {
                                                account: "6002",
                                                description: "Hotel",
                                                amount: 300,
                                                currency: travelInfo.currency,
                                                department: "",
                                                project: "",
                                            },
                                        ]}
                                    />
                                </div>
                            )}

                            {activeTab === "visa" && <VisaApplicationForm/>}

                            {activeTab === "checklist" && (
                                <div className="mb-3">
                                    <div className="bg-light-subtle p-3 rounded">
                                        <p className="fw-bold mb-2">Checklist</p>
                                        <ul className="mb-0">
                                            {travelInfo.documentType === "Visitor" ? (
                                                <li>Work Permit is required for this trip.</li>
                                            ) : (
                                                <li>Visa is required for this trip.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            <div className="step-actions">
                                {activeTab === "info" ? (
                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={handleInitialSubmit}
                                    >
                                        <Save size={16} className="button-icon"/>
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
                                        travelInfo.documentType === "Employee" ? (
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
                                        travelInfo.documentType === "Visitor" ? (
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

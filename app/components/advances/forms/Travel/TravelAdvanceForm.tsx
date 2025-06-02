import React, { useCallback, useState } from "react";
import { codeUnit, createResource } from "@/app/lib/api/http";
import { TravelRequest } from "@/app/types/travel";
import { Wallet } from "lucide-react";
import Swal from "sweetalert2";
import SectionLoader from "@/app/components/loaders/SectionLoader";

type AdvanceLine = {
    billingCode: string;
    amount: number;
};

export default function TravelAdvanceForm({
                                              travelInfo,
                                              onSubmit,
                                              expenseCodes,
                                          }: {
    travelInfo: TravelRequest;
    onSubmit: () => void;
    expenseCodes: Record<string, any>;
}) {
    const [lines, setLines] = useState([{ billingCode: "", amount: 0 }]);
    const [loading, setLoading] = useState(false);

    const handleLineChange = (
        index: number,
        field: keyof AdvanceLine,
        value: string | number
    ) => {
        const updated = [...lines];
        if (field === "amount" && typeof value === "number") {
            updated[index].amount = value;
        } else if (field === "billingCode" && typeof value === "string") {
            updated[index].billingCode = value;
        }
        setLines(updated);
    };



    const handleAddLine = async (index: number) => {
        const line = lines[index];
        try {
            setLoading(true);
            const res = await createResource("travelRequestLine", {
                data: {
                    documentType: travelInfo.documentType,
                    documentNo: travelInfo.no,
                    billingCode: line.billingCode,
                    unitAmount: line.amount,
                },
            });

            if (res.error) throw new Error(res.error.message);
            Swal.fire("Success", "Travel advance line created successfully!");
        } catch (error: any) {
            Swal.fire("Error creating travel advance line", error.message);
        } finally {
            setLoading(false);
        }
    };

    const createVisaAdvance = useCallback(async () => {
        try {
            const res = await codeUnit("createTravelAdvanceFromTravel", {
                data: { no: travelInfo.no },
            });

            if (res.error) {
                throw new Error(res.error.message);
            }

            Swal.fire("Success", "Travel advance created successfully!");
        } catch (error: any) {
            Swal.fire("Error creating travel advance", error.message);
        } finally {
            setLoading(false);
            onSubmit();
        }
    }, [travelInfo.no]);

    const addNewLine = () => {
        setLines((prev) => [...prev, { billingCode: "", amount: 0 }]);
    };

    return (
        <div>
            <h4>Create Travel Advance Lines</h4>
            <div className="alert alert-primary" role="alert">
                <strong>Note:</strong> Create advance items before creating the <strong>Travel Advance</strong>
            </div>

            {lines.map((line, index) => (
                <div key={index} className="d-flex align-items-center mb-3 row">
                    <div className="me-2 col">
                        <label htmlFor={`billingCode-${index}`} className="form-label">
                            Select expense code
                        </label>
                        <select
                            className="form-select"
                            id={`billingCode-${index}`}
                            value={line.billingCode}
                            onChange={(e) =>
                                handleLineChange(index, "billingCode", e.target.value)
                            }
                            required
                        >
                            <option value="">-- Select Expense Code --</option>
                            {expenseCodes.map((item: any) => (
                                <option key={item.code} value={item.code}>
                                    {item.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col">
                        <label className="form-label">Enter Advance Amount</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter Amount"
                            value={line.amount}
                            onChange={(e) =>
                                handleLineChange(index, "amount", Number(e.target.value))
                            }
                        />
                    </div>

                    <div className="mt-3 col">
                        <button
                            className="primary-button ms-2 w-100"
                            onClick={() => handleAddLine(index)}
                            disabled={
                                !travelInfo.bookingComplete ||
                                !line.billingCode ||
                                !line.amount ||
                                loading
                            }
                        >
                            {loading ? (
                                <SectionLoader size={16}/>
                            ) : (
                                <span>
                  <Wallet className="me-1" size={16}/>
                  create advance item
                </span>
                            )}
                        </button>
                    </div>
                </div>
            ))}

            <div className="mb-3 text-end">
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={addNewLine}
                >
                    + Add another advance item
                </button>
            </div>

            <div className="d-flex align-items-center justify-content-end">
                <button
                    className="primary-button ms-2"
                    onClick={createVisaAdvance}
                    disabled={
                        !travelInfo.bookingComplete ||
                        loading ||
                        lines.some((line) => !line.billingCode || !line.amount)
                    }
                >
                    {loading ? (
                        <SectionLoader size={16}/>
                    ) : (
                        <span>
              <Wallet className="me-1" size={16}/>
              Create Travel Advance
            </span>
                    )}
                </button>
            </div>
        </div>
    );
}

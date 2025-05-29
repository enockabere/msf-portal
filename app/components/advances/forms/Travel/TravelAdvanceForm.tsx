import React, { useCallback, useEffect, useState } from 'react';
import {codeUnit, createResource} from "@/app/lib/api/http";
import { TravelRequest } from "@/app/types/travel";
import {Wallet} from "lucide-react";
import Swal from "sweetalert2";
import {useMySetups} from "@/app/context/SetupContext";
import SectionLoader from "@/app/components/loaders/SectionLoader";

export default function TravelAdvanceForm({ travelInfo, onSubmit, expenseCodes  }: { travelInfo: TravelRequest, onSubmit: () => void, expenseCodes: Record<string, any>}) {
    // const { expenseCodes, fetchSetups } = useMySetups();
    const [advanceAmount, setAdvanceAmount] = useState<number>(0);
    const [billingCode, setBillingCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);


    const createVisaAdvance = useCallback(async () => {
        try {
            const res = await codeUnit("createTravelAdvanceFromTravel", {
                data: { no: travelInfo.no },
            });

            if (res.error) {
                throw new Error(res.error.message);
            }

            Swal.fire("Success", "Visa advance created successfully!");
        } catch (error: any) {
            Swal.fire("Error creating visa advance", error.message);
        } finally {
            setLoading(false)
        }

        onSubmit()
    }, [travelInfo.no]);

    const createVisaRequestLine = async () => {
        try {
            setLoading(true)
            const res = await createResource('travelRequestLine', {
                data: {
                    documentType: travelInfo.documentType,
                    documentNo: travelInfo.no,
                    billingCode: billingCode,
                    unitAmount: advanceAmount
                },
            });

            if (res.error) {
                throw new Error(res.error.message);
            }

            await createVisaAdvance()
        } catch (error) {
            Swal.fire("Error creating visa advance", error.message);
        }

    }

    useEffect(() => {
        // fetchSetups(['expenseCodes'])
        console.log('expenseCodes', expenseCodes)
    }, [travelInfo.no]);

    return (
        <div className="">
            <h4 className="">Create Travel Advance</h4>
            <div className="d-flex align-items-center mb-3 row">
                <div className="me-2 col">
                    <label htmlFor="billingCode" className="form-label">
                        Select expense code
                    </label>
                    <select
                        className="form-select"
                        id="expenseCode"
                        onChange={(e) => setBillingCode(e.target.value)}
                        required
                    >
                        <option value="">-- Select Expense Code --</option>
                        {expenseCodes.map((item) => (
                            <option key={item.code} value={item.code}>
                                {item.description	}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col">
                    <label className="form-label">
                        Create Visa advance
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id=""
                        placeholder="Enter Amount needed"
                        onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                    />
                </div>
                <div className="mt-3 col">
                    <button
                        className="primary-button ms-2 w-100"
                        onClick={createVisaRequestLine}
                        disabled={!travelInfo.bookingComplete || !advanceAmount || !billingCode ||  loading}
                    >
                        {loading ? (
                            <SectionLoader size={16} />
                        ) : (
                            <span>
                                <Wallet className="me-1" size={16} />
                                Create Travel Advance
                            </span>
                        )}

                    </button>
                </div>
            </div>
        </div>
    );
}
'use client';

import { createContext, useReducer, useContext, ReactNode, useCallback, useMemo } from "react";
import { ReducerFunctionActionType } from "../types/global";
import { RequestOptions, RequestResponse } from "../types/options";
import { ENDPOINTMAP } from "../utils/endpointMap";
import { getResource } from "../lib/api/http";
import Swal from "sweetalert2";
import { ExpenseItem, FormData } from "../types/advance";

const initialState = {
    advanceTypes: [
        {
            code: "SALARY",
            documentType: "SALARY",
            description: "Salary Advance"
        },
    ],
    formData: {
        imprestType: "",
        Purpose: "",
        amountToPayHeader: null,
        currencyCode: "",
        paymentMethod: "",
        cashCollectionDate: "",
        cashHours: "",
        idPassportNumber: "",
        accountNo: "",
        bankNo: "",
        branch: "",
        swiftCode: "",
        phoneNo: "",
        accountName: "",
    } satisfies FormData,
    expenses: [] as ExpenseItem[],
    isNew: false satisfies boolean,
    isEditing: false satisfies boolean,
    setForView: false satisfies boolean,
    actions: {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        fetchAdvanceTypes: (endpoints: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
            return Promise.resolve({ success: false })
        },
        dispatcher: (options: ReducerFunctionActionType): void => { },
    }
}
export type AdvanceState = typeof initialState;

function AdvanceReducer(state: any, action: ReducerFunctionActionType) {
    switch (action.type) {
        case 'UPDATE_ADVANCE_TYPES': {
            return {
                ...state,
                advanceTypes: [
                    {
                        code: "SALARY",
                        documentType: "SALARY",
                        description: "Salary Advance"
                    },
                    ...action.payload
                ]
            }
        }
        case 'CHANGE_ADVANCE_FORMDATA_FIELD': {
            return {
                ...state,
                formData: {
                    ...state.formData,
                    ...action.payload,
                },
            }
        }
        case 'OPEN_EXISTING_ADVANCE': {
            return {
                ...state,
                formData: action.payload,
            }
        }
        case 'SET_EXISTING_ADVANCE_LINES': {
            return {
                ...state,
                expenses: action.payload,
            }
        }
        case 'ADVANCE_CREATION_STATUSES': {
            return {
                ...state,
                ...action.payload,
            }
        }
    }
}

const AdvanceContext = createContext<AdvanceState | undefined>(undefined);


export const AdvanceContextProvider = ({ children }: { children: ReactNode }) => {
    const [advance, dispatcher] = useReducer(AdvanceReducer, initialState);

    const fetchAdvanceTypes = useCallback(
        async (endpoint: ENDPOINTMAP, options: RequestOptions) => {
            const controller = new AbortController();
            try {
                const res = await getResource(endpoint, {
                    ...options,
                    headers: {
                        signal: controller.signal
                    }
                });
                if (res.error) {
                    Swal.fire('Error!', 'Error fetching advance types!', 'error');
                    return;
                }
                if (Array.isArray(res.value)) {
                    dispatcher({
                        type: 'UPDATE_ADVANCE_TYPES',
                        payload: res.value
                    });
                } else {
                    Swal.fire('Error!', 'Invalid advance types data!', 'error');
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    Swal.fire('Error!', 'Request failed!', 'error');
                }
            }
            return () => controller.abort();
        },
        []
    );

    const dispatcherCaller = useCallback((option: ReducerFunctionActionType) => {
        dispatcher(option);
    }, []);
    const contextValue = useMemo(() => ({

        ...advance,
        actions: {
            ...advance.actions,
            dispatcher: dispatcherCaller,
            fetchAdvanceTypes,
        }
    }), [advance, advance.actions, fetchAdvanceTypes]);

    return (
        <AdvanceContext.Provider value={contextValue} >
            {children}
        </AdvanceContext.Provider >
    )
}

export const useAdvance = () => {
    const ctx = useContext(AdvanceContext);
    if (!ctx) {
        throw new Error("useAdvance must be used within AdvanceContextProvider");
    }
    return ctx;
}

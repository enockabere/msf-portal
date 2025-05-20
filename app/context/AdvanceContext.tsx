'use client';

import { createContext, useReducer, useContext, ReactNode, useCallback, useMemo } from "react";
import { ReducerFunctionActionType } from "../types/global";
import { RequestOptions, RequestResponse } from "../types/options";
import { ENDPOINTMAP } from "../utils/endpointMap";
import { getResource } from "../lib/api/http";
import Swal from "sweetalert2";
import { AdvanceCount, AdvanceType, ExpenseItem, FormData } from "../types/advance";
import { useMySetups } from "./SetupContext";

const initialState = {
    advanceTypes: [
        {
            title: 'Salary Advance',
            key: 'Salary',
            route: 'advances'
        },
        {
            title: 'Other Advance',
            key: 'Other',
            route: 'otherAdvances'
        },
    ] satisfies AdvanceType[],
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
        no: "",
        imprestStatus: "",
        status: "",
    } satisfies FormData,
    expenses: [] as ExpenseItem[],
    advanceCounts: {
        open: 0,
        pending: 0,
        released: 0,
        total: 0
    } satisfies AdvanceCount,
    isNew: false satisfies boolean,
    isEditing: false satisfies boolean,
    setForView: false satisfies boolean,
    showAdvannceSettlementForm: false satisfies boolean,
    advanceLineSelectedForAccounting: {} as Record<string, any>,
    actions: {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        fetchAdvanceTypes: (endpoints: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
            return Promise.resolve({ success: false })
        },
        /* eslint-disable @typescript-eslint/no-unused-vars */
        dispatcher: (options: ReducerFunctionActionType): void => { },
        /* eslint-disable @typescript-eslint/no-unused-vars */
        handleFetchingSetup: (): Promise<void> => { return Promise.resolve() },
        /* eslint-disable @typescript-eslint/no-unused-vars */
        fetchLineSetup: (): Promise<void> => { return Promise.resolve() },
    }
}
export type AdvanceState = typeof initialState;

function AdvanceReducer(state: AdvanceState, action: ReducerFunctionActionType) {
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
        case 'ADD_NEW_ADVANCE_LINE': {
            return {
                ...state,
                expenses: [
                    ...state.expenses,
                    action.payload,
                ],
            }
        }
        case 'CHANGE_EXPENSE_LINE': {
            const draftExpenses = state.expenses;
            draftExpenses[action.payload.index] = {
                ...draftExpenses[action.payload.index],
                ...action.payload.update,
            }
            return {
                ...state,
                expenses: draftExpenses,
            }
        }
        case 'REMOVE_EXPENSE_LINE': {
            const expenseDraft = [...state.expenses];
            expenseDraft.splice(action.payload.index, 1);
            return {
                ...state,
                expenses: expenseDraft,
            }
        }
        case 'ADVANCE_CREATION_STATUSES': {
            return {
                ...state,
                ...action.payload,
            }
        }

        case 'SET_ADVANCES_COUNTS': {
            return {
                ...state,
                advanceCounts: action.payload,
            }
        }
        case 'SET_SETTLEMENT_MODAL': {
            return {
                ...state,
                showAdvannceSettlementForm: action.payload
            }
        }
        case 'SET_ADVANCE_LINE_SELECTED_FOR_ACCOUNTING': {
            return {
                ...state,
                advanceLineSelectedForAccounting: action.payload
            }
        }
    }
}

const AdvanceContext = createContext<AdvanceState | undefined>(undefined);


export const AdvanceContextProvider = ({ children }: { children: ReactNode }) => {
    const [advance, dispatcher] = useReducer(AdvanceReducer, initialState);
    const { fetchSetups } = useMySetups();

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

    const handleFetchingSetup = async () => {
        await fetchSetups([
            'imprestTypes',
            'currencies',
            {
                paymentMethods: {
                    filters: {
                        isImprest: true,
                    }
                }
            }
        ]).catch((err) => {
            Swal.fire({
                title: "Error Fetching setups!",
                text: "Please try again later. " + err.message,
            });
        });
    }
    const fetchLineSetup = () => {
        Promise.all([
            fetchSetups([
                {
                    dimensions: {
                        $filter: `dimensionCode eq 'DEPARTMENTS' or dimensionCode eq 'PROJECT'`
                    }
                }
            ]),
            fetchSetups([
                {
                    expenseCodes: {
                        filters: {
                            imprestType: advance.formData?.imprestType
                        }
                    }
                }
            ], true),
        ])
    }
    const contextValue = useMemo(() => ({

        ...advance,
        actions: {
            ...advance.actions,
            handleFetchingSetup,
            fetchLineSetup,
            dispatcher: dispatcherCaller,
            fetchAdvanceTypes,
        }
    }), [advance, advance.actions, fetchAdvanceTypes, dispatcherCaller, handleFetchingSetup, fetchLineSetup]);

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

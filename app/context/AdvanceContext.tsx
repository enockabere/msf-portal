'use client';

import { createContext, useReducer, useContext, ReactNode, useCallback, useMemo } from "react";
import { ReducerFunctionActionType } from "../types/global";
import { RequestOptions, RequestResponse } from "../types/options";
import { ENDPOINTMAP } from "../utils/endpointMap";
import { getResource } from "../lib/api/http";
import Swal from "sweetalert2";
import { AdvanceCount, AdvanceType, ExpenseItem, FormData, Advance } from "../types/advance";
import { useMySetups } from "./SetupContext";
import { useSession } from "next-auth/react";
import { usePageLoader } from "./PageLoaderContext";

const initialState = {
    advanceData: [] satisfies Advance[],
    advanceTypes: [
        {
            title: 'Salary Advance',
            key: 'Salary',
            route: 'advances',
            disabled: false,
        },
        {
            title: 'Other Advance',
            key: 'Other',
            route: 'otherAdvances',
            disabled: false,
        },
    ] satisfies AdvanceType[],
    formData: {
        documentType: "",
        imprestType: "",
        Purpose: "",
        amountToPayHeader: null,
        currencyCode: "KES",
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
        relatedDocNo: "",
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
    showAdvanceAccountedLineDetailsModal: false satisfies boolean,
    advanceLineSelectedForAccounting: {} as Record<string, any>,
    accountedLines: [] as Record<string, any>[],
    selectedAdvanceLineForView: {} as Record<string, any>,
    selectedAdvanceLineForViewAccountingDetails: [] as Record<string, any>[],
    showAssociatedTravelRequestControl: false satisfies boolean,
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
        fetchImprestsPendingSettlement: (): Promise<void> => { return Promise.resolve() },
        fetchAdvances: (): Promise<void> => { return Promise.resolve() },
        /* eslint-disable @typescript-eslint/no-unused-vars */
        fetchAdvanceLines: (no: string, isSettled = false): Promise<void> => { return Promise.resolve() },
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
        case 'SET_DETAILED_ACCOUNTING_LINES': {
            return {
                ...state,
                accountedLines: action.payload,
            }
        }
        case 'SET_ADVANCE_ACCOUNTED_LINE_DETAILS_MODAL': {
            return {
                ...state,
                showAdvanceAccountedLineDetailsModal: action.payload,
            }
        }
        case 'SET_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS': {
            return {
                ...state,
                selectedAdvanceLineForView: action.payload,
            }
        }
        case 'SET_ACCOUNTING_LINES_FOR_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS': {
            return {
                ...state,
                selectedAdvanceLineForViewAccountingDetails: action.payload,
            }
        };
        case 'SET_SHOW_ASSOCIATED_TRAVEL_REQUEST_CONTROL': {
            return {
                ...state,
                showAssociatedTravelRequestControl: action.payload,
            }
        }
        case 'PATCH_ADVANCE_TYPES_DISABLE_STATUS': {
            return {
                ...state,
                advanceTypes: state.advanceTypes.map((type) => {
                    if (type.key === action.payload.key) {
                        type = {
                            ...type,
                            ...action.payload,
                        };
                        return type;
                    }
                    return type;
                }),
            }
        }
        case 'SET_ADVANCEDATA': {
            return {
                ...state,
                advanceData: action.payload,
            }
        }
    }
}

const AdvanceContext = createContext<AdvanceState | undefined>(undefined);


export const AdvanceContextProvider = ({ children }: { children: ReactNode }) => {
    const [advance, dispatcher] = useReducer(AdvanceReducer, initialState);
    const { fetchSetups } = useMySetups();
    const { data: session } = useSession();
    const { actions } = usePageLoader();
    const { dispatcher: dispatchLoader } = actions;

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

    const handleFetchingSetup = useCallback(async () => {
        await fetchSetups([
            'imprestTypes',
            'currencies',
            'globalCurrencies',
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
    }, [fetchSetups]);
    const fetchLineSetup = useCallback(async () => {
        Promise.all([
            fetchSetups([
                {
                    dimensions: {
                        $filter: `dimensionCode eq 'DEPARTMENTS' or dimensionCode eq 'PROJECT' or dimensionCode eq 'OC'`
                    }
                }
            ], true),
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
    }, [advance.formData, fetchSetups]);
    const fetchImprestsPendingSettlement = useCallback(async () => {
        const ocludedStatuses = ['Draft', 'Pending', 'Approved', 'Issued', 'Accounted'];
        let query: string;
        ocludedStatuses.forEach((ocludedStatus) => {
            if (query) {
                query = `${query} or imprestStatus eq '${ocludedStatus}'`;
            } else {
                query = `imprestStatus eq '${ocludedStatus}'`;
            }
        });
        const imprest = await getResource(`imprest`, {
            params: {
                returnRecords: false,
                '$count': true,
                '$filter': `no eq '${session?.user?.profile?.no}' and ${query}`,
            }
        });
        console.log('imprest count: ', imprest);
        dispatcher({
            type: 'PATCH_ADVANCE_TYPES_DISABLE_STATUS',
            payload: {
                key: 'Other',
                disabled: (imprest as unknown as number) > 2,
            },
        })
    }, [session?.user?.profile?.no, dispatcher]);
    const fetchAdvances = useCallback(async () => {
        const employeeNo = session?.user?.profile?.no;
        if (!employeeNo) return;
        dispatchLoader({
            type: 'PATCH_LOADING_STATE',
            payload: {
                loading: true,
                message: '',
            }
        });

        try {
            const res = await getResource('imprest', {
                params: {
                    filters: {
                        employeeNo,
                    },
                    '$orderby': 'no desc',
                }
            });
            if (res.error) {
                return Swal.fire(res.error.code, res.error.message, 'error');
            }
            dispatcher({
                type: 'SET_ADVANCEDATA',
                payload: res.value.reverse(),
            });
        } catch (err: any) {
            Swal.fire('Error!', err.message, 'error');
        } finally {
            dispatchLoader({
                type: 'PATCH_LOADING_STATE',
                payload: {
                    loading: false,
                    message: '',
                }
            });
        }
    }, [session, dispatchLoader]);
    const fetchAdvanceLines = useCallback(async (no, isSettlment = false) => {
        const fetchLines = async () => {
            const res = await getResource('imprestLine', {
                params: {
                    filters: {
                        documentNo: no,
                        ...(isSettlment && { Surrender: true }),
                    },
                },
            });
            if (res.error) {
                return Swal.fire(res.error.code, res.error.message, 'error');
            }
            dispatcher(
                {
                    type: 'SET_EXISTING_ADVANCE_LINES',
                    payload: res.value,
                },
            );
        }
        await Promise.all([
            fetchLineSetup(),
            fetchLines(),
        ]);
    }, [dispatcher, fetchLineSetup]);
    const contextValue = useMemo(() => ({

        ...advance,
        actions: {
            ...advance.actions,
            handleFetchingSetup,
            fetchLineSetup,
            dispatcher: dispatcherCaller,
            fetchAdvanceTypes,
            fetchImprestsPendingSettlement,
            fetchAdvances,
            fetchAdvanceLines,
        }
    }), [advance, fetchAdvanceTypes, dispatcherCaller, handleFetchingSetup, fetchLineSetup, fetchImprestsPendingSettlement, fetchAdvances]);

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

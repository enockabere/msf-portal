import { createContext, useReducer, useContext, ReactNode, useCallback } from "react";
import { ReducerFunctionActionType } from "../types/global";
import { RequestOptions, RequestResponse } from "../types/options";
import { ENDPOINTMAP } from "../utils/endpointMap";
import { getResource } from "../lib/api/http";
import { toast } from "react-toastify";

const initialState = {
    advanceTypes: [
        {
            code: "SALARY",
            documentType: "SALARY",
            description: "Salary Advance"
        },
    ],
    actions: {
        fetchAdvanceTypes: (endpoints: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
            return Promise.resolve({ success: false })
        }
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
    }
}

const AdvanceContext = createContext<AdvanceState | undefined>(undefined);


export const AdvanceContextProvider = ({ children }: { children: ReactNode }) => {
    const [advance, dispatcher] = useReducer(AdvanceReducer, initialState);

    const fetchAdvanceTypes = useCallback(
        async (
            endpoint: ENDPOINTMAP,
            options: RequestOptions,
        ) => {
            const res = await getResource(endpoint, options);
            if (res.error) {
                console.log("Response Eror: ", res.error);
                toast.error(res.error.message)
            }
            dispatcher({
                type: 'UPDATE_ADVANCE_TYPES',
                payload: res.value
            })
        },
        []
    )
    return (
        <AdvanceContext.Provider value={advance} >
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
"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "react-toastify";

type RecordAny = Record<string, any>;
interface MySetupsState {
  imprestTypes: RecordAny[];
  currencies: RecordAny[];
  dimensions: RecordAny[];
  expenseCodes: RecordAny[];
  projects: RecordAny;
  projectActivities: RecordAny[];
  modesOfTransport: RecordAny[];
  unitsOfMeasure: RecordAny[];
  dimensionSpeedKeys: RecordAny[];
  paymentMethods: RecordAny[];
  banks: RecordAny[];
  bankBranches: RecordAny[];
  requisitionDimensions: RecordAny[];
  billingItems: RecordAny[];
  locations: RecordAny[];
  employees: RecordAny[];
  employeeBanks: RecordAny[];
  payrollPeriods: RecordAny[];
}

const initialState: MySetupsState = {
  imprestTypes: [],
  currencies: [],
  dimensions: [],
  expenseCodes: [],
  projects: {},
  projectActivities: [],
  modesOfTransport: [],
  unitsOfMeasure: [],
  dimensionSpeedKeys: [],
  paymentMethods: [],
  banks: [],
  bankBranches: [],
  requisitionDimensions: [],
  billingItems: [],
  locations: [],
  employees: [],
  employeeBanks: [],
  payrollPeriods: [],
};

type Action =
  | { type: "PATCH"; payload: Partial<MySetupsState> }
  | { type: "RESET" };

function reducer(state: MySetupsState, action: Action): MySetupsState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
interface MySetupsContextValue extends MySetupsState {
  fetchSetups: (
    endpoints: Array<string | Record<string, unknown>>,
    resolveAll?: boolean
  ) => Promise<void>;
}

const MySetupsContext = createContext<MySetupsContextValue | undefined>(
  undefined
);
const DispatchSetupsContext = createContext<React.Dispatch<Action> | undefined>(
  undefined
);
export const MySetupsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchSetups = useCallback(
    async (
      setupsArray: Array<string | Record<string, unknown>>,
      resolveAll = false
    ) => {
      if (!Array.isArray(setupsArray) || setupsArray.length === 0) {
        toast.error(
          "Wrong usage of fetchSetups: provide a non-empty array of setup names."
        );
        return;
      }

      try {
        const res = await fetch("/selfservice/api/setups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoints: setupsArray, resolveAll }),
        });

        const json = await res.json();
        dispatch({ type: "PATCH", payload: json });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch setups.");
      }
    },
    []
  );

  return (
    <MySetupsContext.Provider value={{ ...state, fetchSetups }}>
      <DispatchSetupsContext.Provider value={dispatch}>
        {children}
      </DispatchSetupsContext.Provider>
    </MySetupsContext.Provider>
  );
};

export const useMySetups = (): MySetupsContextValue => {
  const ctx = useContext(MySetupsContext);
  if (!ctx) {
    throw new Error("useMySetups must be used within MySetupsProvider");
  }
  return ctx;
};

export const useMySetupDispatcher = () => {
  const ctx = useContext(DispatchSetupsContext);
  if (!ctx) {
    throw new Error(
      "useMySetupDispatcher must be used within MySetupsProvider"
    );
  }
  return ctx;
};

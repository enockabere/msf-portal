"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "react-toastify";
import type { ENDPOINTMAP } from "../utils/endpointMap";
import { EndpointOptions } from "../types/global";

// 🚀 Local in-memory cache for setups
const localSetupCache = new Map<string, any>();

const state = {
  imprestTypes: [] as Array<Record<string, any>>,
  DEPARTMENTS: [] as Array<Record<string, any>>,
  OC: [] as Array<Record<string, any>>,
  PROJECT: [] as Array<Record<string, any>>,
  travelRequests: [] as Array<Record<string, any>>,
  currencies: [] as Array<Record<string, any>>,
  globalCurrencies: [] as Array<Record<string, any>>,
  dimensions: [] as Array<Record<string, any>>,
  expenseCodes: [] as Array<Record<string, any>>,
  projects: [] as Array<Record<string, any>>,
  projectActivities: [] as Array<Record<string, any>>,
  modesOfTransport: [] as Array<Record<string, any>>,
  unitsOfMeasure: [] as Array<Record<string, any>>,
  dimensionSpeedKeys: [] as Array<Record<string, any>>,
  paymentMethods: [] as Array<Record<string, any>>,
  banks: [] as Array<Record<string, any>>,
  bankBranches: [] as Array<Record<string, any>>,
  requisitionDimensions: [] as Array<Record<string, any>>,
  billingItems: [] as Array<Record<string, any>>,
  locations: [] as Array<Record<string, any>>,
  employees: [] as Array<Record<string, any>>,
  employeeBanks: [] as Array<Record<string, any>>,
  payrollPeriods: [] as Array<Record<string, any>>,
  purposeOfTravel: [] as Array<Record<string, any>>,
  countries: [] as Array<Record<string, any>>,
  cities: [] as Array<Record<string, any>>,
  modeOfTransport: [] as Array<Record<string, any>>,
  perDiemAllotments: [] as Array<Record<string, any>>,
  genders: [] as Array<Record<string, any>>,
  profileTitles: [] as Array<Record<string, any>>,
  userProfiles: [] as Array<Record<string, any>>,
  missionTypes: [] as Array<Record<string, any>>,
};

type MySetupsState = typeof state;
const initialState: MySetupsState = {
  ...state,
};

type Action =
  | { type: "PATCH"; payload: Partial<MySetupsState> }
  | { type: "RESET" };

function reducer(state: MySetupsState, action: Action): MySetupsState {
  switch (action.type) {
    case "PATCH":
      {
        if (action.payload.dimensions) {
          console.log('dimensions: ', action.payload.dimensions);
          action.payload.PROJECT = action.payload.dimensions.filter((dimension: Record<string, any>) => dimension.dimensionCode === 'PROJECT');
          action.payload.DEPARTMENTS = action.payload.dimensions.filter((dimension: Record<string, any>) => dimension.dimensionCode === 'DEPARTMENTS');
          action.payload.OC = action.payload.dimensions.filter((dimension: Record<string, any>) => dimension.dimensionCode === 'OC');
        }
        return { ...state, ...action.payload };
      }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface MySetupsContextValue extends MySetupsState {
  fetchSetups: (
    endpoints: Array<
      ENDPOINTMAP | Partial<Record<ENDPOINTMAP, EndpointOptions>>
    >,
    ignoreCache?: boolean,
    resolveAll?: boolean
  ) => Promise<void>;
}

const MySetupsContext = createContext<MySetupsContextValue | undefined>(
  undefined
);

export const MySetupsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchSetups = useCallback(
    async (
      setupsArray: Array<ENDPOINTMAP | Record<ENDPOINTMAP, EndpointOptions>>,
      ignoreCache: boolean = false,
      resolveAll: boolean = false
    ) => {
      if (!Array.isArray(setupsArray) || setupsArray.length === 0) {
        toast.error(
          "Wrong usage of fetchSetups: provide a non-empty array of setup names."
        );
        return;
      }

      try {
        let missingEndpoints = [];
        if (ignoreCache) {
          missingEndpoints = setupsArray;
        } else {
          missingEndpoints = setupsArray.filter((setup) => {
            const key =
              typeof setup === "string" ? setup : Object.keys(setup)[0];
            return !localSetupCache.has(key);
          });
          if (missingEndpoints.length === 0) {
            console.log("✅ All requested setups loaded from cache.");
            return;
          }
        }

        const res = await fetch("/api/setups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoints: missingEndpoints, resolveAll }),
        });

        const json = await res.json();

        // Update React state
        dispatch({ type: "PATCH", payload: json });

        // Save to local memory cache
        for (const key of Object.keys(json)) {
          localSetupCache.set(key, json[key]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch setups.");
      }
    },
    []
  );

  return (
    <MySetupsContext.Provider value={{ ...state, fetchSetups }}>
      {children}
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

"use client";

interface ActionType { type: string; payload: any }

const iniatialLoaderState = {
  loading: false,
  message: 'Please wait a minute...',
  actions: {
    dispatcher: (option: ActionType): void => { },
  },
};

export type LoaderState = typeof iniatialLoaderState;
const loadingStateReducer = (state: Partial<LoaderState>, action: ActionType) => {
  switch (action.type) {
    case 'PATCH_LOADING_STATE': {
      return {
        ...state,
        ...(action.payload),
      }
    }
  }
}

import { createContext, useContext, useState, ReactNode, useReducer, useMemo, useCallback } from "react";

type PageLoaderContextType = {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
};

const PageLoaderContext = createContext<LoaderState | undefined>(
  undefined
);

export function PageLoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [loaderState, dispatcher] = useReducer(loadingStateReducer, iniatialLoaderState);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setTimeout(() => setLoading(false), 500); // Smooth UX

  const dispatcherCaller = useCallback((option: ActionType) => {
    dispatcher(option);
  }, []);

  const loaderContextValue = useMemo(() => ({
    ...loaderState,
    actions: {
      ...loaderState.actions,
      dispatcher: dispatcherCaller,
    }
  }), [loaderState, dispatcher])

  return (
    <PageLoaderContext.Provider value={loaderContextValue}>
      {children}
    </PageLoaderContext.Provider>
  );
}

export function usePageLoader() {
  const context = useContext(PageLoaderContext);
  if (!context) {
    throw new Error("usePageLoader must be used within a PageLoaderProvider");
  }
  return context;
}

export { };

declare global {
  interface Window {
    bootstrap: any;
  }
}

export interface APIResponse {
  value?: Array<Record<string, any>>;
  [key: string]: any;
}

export interface ReducerFunctionActionType {
  type: string
  payload?: any
}

export interface Dependency {
  visitorNo?: string;
  profileNo?: string;
  lineNo?: number;
  dob: string;
  name: string;
  nationality?: string;
  relation: string;
  gender: string;
  countryOfOrigin: string;
  [key: string]: any;
}
export interface EndpointOptions {
  filters?: Record<string, any>;
  select?: Array<string>;
  [key: string]: any;
}
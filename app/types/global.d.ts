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
visitorNo: string;
lineNo: number;
dob: string;
name: string;
relation: string;
gender: string;
countryOfOrigin: string;
[key: string]: any;
}
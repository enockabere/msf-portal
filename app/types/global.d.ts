export {};

declare global {
  interface Window {
    bootstrap: any;
  }
}

export interface APIResponse {
  value?: Array<Record<string, any>>;
  [key: string]: any;
}

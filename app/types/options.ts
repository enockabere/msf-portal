import { ENDPOINTMAP } from "../utils/endpointMap";

export interface RequestOptions {
    data?: Record<string, any> | undefined
    headers?: Record<string, any> | undefined
    params?: Record<string, any> | undefined
    method?: "GET" | "PUT" | "POST" | "DELETE" | "PATCH" | "OPTIONS" | "HEADER" | undefined,
    options?: Record<string, any>
    batch?: Array<Record<string, any>>,
    primaryKey?: Array<string>,
}

export interface batchRequestOptions extends RequestOptions {
    endpoint: ENDPOINTMAP;
}

export interface Error {
    code?: string | any;
    message?: string | any;
    [key: string]: any;
}
export interface RequestResponse {
    error?: Error | undefined;
    value?: Record<string, any> | Record<string, any>[] | any;
    [key: string]: any | undefined;

}

export interface BatchRequestResponse {
    error?: Error;
    [key: string]: {
        error?: Error | any;
        [key: string]: any;
    };
}

export type HTTMETHODS = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "CU" | 'BATCH';

export class ApiError extends Error {
    constructor(message: string, public status?: number, public code?: string) {
        super(message);
        this.name = 'ApiError';
    }
}
export interface RequestOptions {
    data?: Record<string, any> | undefined
    headers?: Record<string, any> | undefined
    params?: Record<string, any> | undefined
    method?: "GET" | "PUT" | "POST" | "DELETE" | "PATCH" | "OPTIONS" | "HEADER" | undefined
}
export interface RequestResponse {
    error?: Record<string, any> | undefined
    [key: string]: any | undefined

}

export type HTTMETHODS = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "CU";

export class ApiError extends Error {
    constructor(message: string, public status?: number, public code?: string) {
        super(message);
        this.name = 'ApiError';
    }
}
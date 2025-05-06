'use server'

import { RequestOptions, RequestResponse } from "@/app/types/options";
import { ENDPOINTMAP } from "@/app/utils/endpointMap"
import { apiFetch } from "@/app/utils/api";

export const getResource = async (endpoint: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
    return await apiFetch('GET', endpoint, options);
}

export const createResource = async (endpoint: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
    return await apiFetch('POST', endpoint, options);
}
export const patchResource = async (endpoint: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
    return await apiFetch('PATCH', endpoint, options);
}

export const putResource = async (endpoint: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
    return await apiFetch('GET', endpoint, options);
}

export const deleteResource = async (endpoint: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
    return await apiFetch('DELETE', endpoint, options);
}

export const codeUnit = async (endpoint: ENDPOINTMAP, options: RequestOptions): Promise<RequestResponse> => {
    return await apiFetch('CU', endpoint, options)
}
export const batchRequest = async (options: RequestOptions): Promise<RequestResponse> => {
    return apiFetch('BATCH', 'batch', options);
}
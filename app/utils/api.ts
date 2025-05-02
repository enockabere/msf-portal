'use server'
import { transport } from '@brainspore/hypernexus';
import type { HTTMETHODS, RequestOptions, RequestResponse } from '../types/options';
import { ENDPOINTMAP, memoryMap } from './endpointMap';

export async function apiFetch<T>(
    method: HTTMETHODS = 'GET',
    endpoint: ENDPOINTMAP,
    options: RequestOptions = {}
): Promise<RequestResponse> {
    let response: RequestResponse = {};
    if (method) {
        if (!options.params) {
            options.params = {};
        }
        options.params = {
            ...options.params,
            company: process.env.BC_COMPANY_NAME,
        }
        const { data, params, ...rest } = options;
        switch (method.toLowerCase()) {
            case 'get':
                response = transport.get(memoryMap.get(endpoint), params, rest); break;
            case 'post':
                response = transport.post(memoryMap.get(endpoint), data, rest); break;
            case 'put':
                response = transport.put(memoryMap.get(endpoint), data, rest); break;
            case 'patch':
                response = transport.patch(memoryMap.get(endpoint), data, rest); break;
            case 'cu':
                response = transport.cu(memoryMap.get(endpoint), data, rest); break;
        }
    }
    return response;
}
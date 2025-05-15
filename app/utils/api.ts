'use server'
import { transport } from '@brainspore/hypernexus';
import type { HTTMETHODS, RequestOptions, RequestResponse } from '../types/options';
import { ENDPOINTMAP, memoryMap } from './endpointMap';

export async function apiFetch(
    method: HTTMETHODS = 'GET',
    endpoint: ENDPOINTMAP,
    options: RequestOptions = {}
): Promise<RequestResponse> {
    let response: RequestResponse = {};
    const batchRequests = [];
    if (method) {
        if (!options.params) {
            options.params = {};
        }
        if (options.params.filters && Object.keys(options.params.filters)) {
            const { filters, ...otherParams } = options.params;
            const filter = transport.filter(filters);
            if (filter) {
                options.params = {
                    ...filter,
                    ...otherParams,
                }
            }
        }
        const allowedMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];
        if (options.batch && Array.isArray(options.batch) && options.batch.length) {
            options.batch.forEach((req: Record<string, any>) => {
                if (!allowedMethods.includes(String(req.method).toUpperCase())) {
                    response.error.message = 'Method passed in the batch options is not whitelisted!';
                    return response
                }

                // eslint-disable-next-line prefer-const
                let { method, endpoint, data, params, headers } = req;
                const url = memoryMap.get(endpoint);
                const methodUpperCase = method.toUpperCase();
                if (!params) {
                    params = {};
                }
                if (params.filters && Object.keys(params.filters)) {
                    const { filters, ...otherParams } = params;
                    const filter = transport.filter(filters);
                    params = {
                        ...filter,
                        ...otherParams,
                    };
                }
                if (methodUpperCase === 'PATCH' || methodUpperCase === 'PUT' || methodUpperCase === 'DELETE') {
                    if (!headers) {
                        headers = {}
                    }
                    headers['If-Match'] = "*";
                }
                batchRequests.push({
                    method: methodUpperCase,
                    url,
                    params: {
                        ...params,
                        company: process.env.BC_COMPANY_NAME,
                    },
                    headers,
                    data,
                });
            });
        }
        options.params = {
            ...options.params,
            company: process.env.BC_COMPANY_NAME,
        }
        const { data, params, batch, ...rest } = options;
        const otherOptions = {params: params as never, ...rest};
        switch (method.toLowerCase()) {
            case 'get':
                console.log('Dependency tab: 3 ', memoryMap.get(endpoint), params);
                response = await transport.get<RequestResponse>(memoryMap.get(endpoint), params, rest); break;
            case 'post':
                response = await transport.post<RequestResponse>(memoryMap.get(endpoint), data, otherOptions); break;
            case 'put':
                response = await transport.put<RequestResponse>(memoryMap.get(endpoint), data, otherOptions); break;
            case 'patch':
                response = await transport.patch<RequestResponse>(memoryMap.get(endpoint), data, otherOptions); break;
            case 'delete':
                response = await transport.delete<RequestResponse>(memoryMap.get(endpoint), data, otherOptions); break;
            case 'cu':
                response = await transport.cu<RequestResponse>(memoryMap.get(endpoint), data, otherOptions); break;
            case 'batch': {
                const batchReponse = await transport.batch<RequestResponse>(batchRequests);
                if (!batchReponse || !Array.isArray(batchReponse)) {
                    response.error.message = 'Did not resolve to array of response as expected'
                    return response;
                }
                batchReponse.forEach((resp, index) => {
                    const key = batch[index]['endpoint'];
                    if (key) {
                        response[key] = resp?.value || []
                    }
                })

                break;
            }
        }
        return response;
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { transport } from "@brainspore/hypernexus";
import { ENDPOINTMAP, memoryMap } from "@/app/utils/endpointMap";
import { APIResponse, EndpointOptions } from "@/app/types/global";
export async function POST(request: Request) {
  try {
    const { endpoints, resolveAll } = await request.json();
    if (!endpoints || !Array.isArray(endpoints) || !endpoints.length) {
      return NextResponse.json(
        { error: "Invalid request', 'Endpoints array expected!" },
        { status: 400 }
      );
    }
    const batchRequest = endpoints.map((endpoint: Record<ENDPOINTMAP, EndpointOptions> | string) => {
      const requstOptions = {} as Record<string, any>;
      if (typeof endpoint === "object") {
        for (const [key, value] of Object.entries(endpoint)) {
          requstOptions["url"] = memoryMap.get(key);
          console.log("url: ", requstOptions["url"])
          if (value && typeof value === "object") {
            const typedValue = value as Record<string, unknown>;
            if (typedValue.filters && typeof typedValue.filters === "object") {
              const filter = transport.filter(typedValue.filters);
              requstOptions["params"] = filter;
            }
            if (typedValue.select && Array.isArray(typedValue.select)) {
              const allSelectArrayItemsStrings = typedValue.select.every(
                (s) => typeof s === "string"
              );
              if (allSelectArrayItemsStrings) {
                requstOptions["params"]["$select"] =
                  typedValue.select.join(",");
              }
            }
            delete typedValue.filters;
            delete typedValue.select;
            requstOptions["params"] = {
              ...requstOptions["params"],
              ...typedValue,
              company: process.env.BC_COMPANY_NAME,
            };
            requstOptions["method"] = "GET";
          } else {
            throw new Error('Endpoint Value must be an object!', { cause: 400 });
          }
        }
      }
      else if (typeof endpoint === "string") {
        requstOptions["method"] = "GET";
        requstOptions["url"] = memoryMap.get(endpoint);
        requstOptions["params"] = {
          company: process.env.BC_COMPANY_NAME,
        };
      } else {
        throw new Error("endpoint can only be of type string or object!", { cause: 400 });
      }
      return requstOptions;
    });
    console.log('batchRequest: ', batchRequest);
    const batchReponse = await transport.batch<APIResponse>(batchRequest);
    console.log("batch response: ", batchReponse);
    if (!batchReponse || !Array.isArray(batchReponse)) {
      return NextResponse.json(
        {
          error:
            "Invalid request', Did not resolve to array of response as expected!",
        },
        { status: 400 }
      );
    }
    if (resolveAll && batchReponse.length !== endpoints.length) {
      return NextResponse.json(
        { error: "Invalid request', 'All endpoints were not resolved!" },
        { status: 400 }
      );
    }
    const result: Record<string, any> = {};
    batchReponse.forEach((response, index) => {
      const key = endpoints[index];
      if (key) {
        if (typeof key === "object") {
          for (const prop in key) {
            result[prop] = response?.value || [];
          }
        }
        if (typeof key === "string") {
          result[key] = response?.value || [];
        }
      }
    });
    return NextResponse.json(result);
  } catch (e: any) {
    let status: number = 500;
    let statusCode: string = 'Internal Server Error!';
    switch (e.cause) {
      case 400: {
        status = 400;
        statusCode = 'Invalid Request!';
        break;
      }
      case 404: {
        status = 404;
        statusCode = 'Not Found!';
        break;
      }
      case 415: {
        status = 415;
        statusCode = 'Huge payload!';
        break;
      }
      case 302: {
        status = 302;
        statusCode = 'Redirect!';
        break;
      }
    }
    return NextResponse.json(
      { error: `${statusCode}, ${e.message || 'Server Error!'}` },
      { status: status }
    );
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const memoryCache: Record<string, { data: any; expiry: number }> = {};
export const CACHE_TTL_SECONDS = 300;

import { decodeValue } from "./helpers";

// utils/normalizeDocType.ts
export const normalizeDocType = (type: string | undefined | null): string => {
  if (!type) return "";
  const decoded = decodeValue(type).toLowerCase().trim();
  return decoded.replace(/[_\x002d]+/gi, " ").replace(/\s+/g, " ");
};

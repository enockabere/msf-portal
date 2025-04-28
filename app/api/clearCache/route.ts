import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";
import { memoryCache, CACHE_TTL_SECONDS } from "./cache";

interface AdvanceEntry {
  no: string;
  employeeName: string;
  applicationDate: string;
  preferredDisbursementDate: string;
  advanceType: string;
  status: string;
  applicationAmount: number;
  currencyCode: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const employeeNo = searchParams.get("employeeNo");

  if (!employeeNo) {
    return NextResponse.json(
      { error: "Missing employee number" },
      { status: 400 }
    );
  }

  const cacheKey = `advances-${employeeNo}`;
  const now = Date.now();

  const cached = memoryCache[cacheKey];
  if (cached && cached.expiry > now) {
    console.log(`⚡ Returning cached advances for ${employeeNo}`);
    return NextResponse.json({ data: cached.data });
  }

  console.log(`⏳ Fetching fresh advances for ${employeeNo}...`);
  const start = performance.now();

  try {
    const response = (await transport.get(
      "/api/KineticTechnology/PayRoll/v2.0/payrollAdvance",
      {
        $filter: `employeeCode eq '${employeeNo}'`,
        $select:
          "no,employeeName,applicationDate,preferredDisbursementDate,advanceType,status,applicationAmount,currencyCode",
      }
    )) as { value: AdvanceEntry[] };

    const sorted = [...response.value].sort(
      (a, b) =>
        new Date(b.applicationDate).getTime() -
        new Date(a.applicationDate).getTime()
    );

    memoryCache[cacheKey] = {
      data: { value: sorted },
      expiry: now + CACHE_TTL_SECONDS * 1000,
    };

    const end = performance.now();
    console.log(`⚡ Fetched and cached in ${(end - start).toFixed(2)} ms`);

    return NextResponse.json({ data: { value: sorted } });
  } catch (error) {
    console.error("❌ Fetch Salary Advance Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary advance" },
      { status: 500 }
    );
  }
}

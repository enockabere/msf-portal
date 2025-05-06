/* eslint-disable @typescript-eslint/no-explicit-any */

import { transport } from "@brainspore/hypernexus";
import { NextRequest, NextResponse } from "next/server";

const memoryCache: Record<string, { data: any; expiry: number }> = {};
const CACHE_TTL_SECONDS = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentNo = searchParams.get("documentNo");

    if (!documentNo) {
      return NextResponse.json(
        { error: "Missing document number in query" },
        { status: 400 }
      );
    }

    const cacheKey = `approvals-${documentNo}`;
    const cached = memoryCache[cacheKey];
    const now = Date.now();

    if (cached && cached.expiry > now) {
      return NextResponse.json({ data: cached.data });
    }
    // const start = performance.now(); // Start timer

    const response = await transport.get(
      "/api/Kinetics/VOYAGER/v1.0/approvalEntries",
      {
        $filter: `documentNo eq '${documentNo}'`,
        $select:
          "documentNo,approverID,approveForName,status,sendByName,dateTimeSentForApproval,lastDateTimeModified,ageing,approvalComments",
        $expand: "*",
      }
    );
    memoryCache[cacheKey] = {
      data: response,
      expiry: now + CACHE_TTL_SECONDS * 1000,
    };

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error("❌ Fetch Salary Advance Approval Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary advance approval entries" },
      { status: 500 }
    );
  }
}

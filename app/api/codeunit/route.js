import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const payload = await request.json();
    const { empNo, currencyCode } = payload;

    const result = await transport.cu(
      "/ODataV4/PayrollIntegration_getPayrollAdvanceLimitAmount",
      { empNo, currencyCode },
      {
        params: { company: process.env.BC_COMPANY_NAME },
      }
    );
    return NextResponse.json({ limit: result });
  } catch (err) {
    console.error("❌ Codeunit exception:", {
      error: err.message,
      stack: err.stack,
      fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
    });

    return NextResponse.json(
      { error: "Something went wrong calling the codeunit" },
      { status: 500 }
    );
  }
}

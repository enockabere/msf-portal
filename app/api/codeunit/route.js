import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("🔄 Codeunit route hit…");
  try {
    const { empNo } = await request.json();
    const result = await transport.cu(
      "/ODataV4/PayrollIntegration_getPayrollAdvanceLimitAmount",
      { empNo },
      {
        params: { company: process.env.BC_COMPANY_NAME },
      }
    );
    return NextResponse.json({ limit: result });
  } catch (err) {
    console.error("❌ Codeunit exception:", err);
    return NextResponse.json(
      { error: "Something went wrong calling the codeunit" },
      { status: 500 }
    );
  }
}

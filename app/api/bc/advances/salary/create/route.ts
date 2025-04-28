import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

interface Payload {
  employeeCode: string;
  applicationAmount: number;
  currencyCode: string;
  applicationDate: string;
  paymentMethod: string;
  payrollPeriod: string;
  mobilePhoneNo?: string;
  identificationDocumentNo?: string;
  accountNo?: string;
  bankCode?: string;
  employeeBranchCode?: string;
  employeeBranchName?: string;
  employeeBankName?: string;
  chequeName?: string;
  swiftCode?: string;
}

export async function POST(request: Request) {
  const start = performance.now();

  try {
    const body = await request.json();

    const payload: Payload = {
      ...body,
      applicationDate: new Date().toISOString().split("T")[0],
    };

    const options: any = {};
    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
    }

    console.log("📦 Sending Payload:", JSON.stringify(payload, null, 2));

    const response = await transport.post(
      "/api/KineticTechnology/PayRoll/v2.0/payrollAdvance",
      payload,
      options
    );

    const end = performance.now();
    console.log(`⏱ Transport request took ${(end - start).toFixed(2)} ms`);
    console.log("📨 Received Response:", JSON.stringify(response, null, 2));

    if ((response as any)?.error) {
      console.error("🔴 API returned error:", (response as any).error);
      return NextResponse.json(
        {
          success: false,
          rawResponse: response,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response, // <-- return the whole response like PATCH
      message: "Salary advance created successfully",
    });
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "POST_ERROR",
          message: error?.message || "Failed to create salary advance",
        },
      },
      { status: 500 }
    );
  }
}

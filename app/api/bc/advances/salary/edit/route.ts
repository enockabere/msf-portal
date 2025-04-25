import { NextRequest, NextResponse } from "next/server";
import { transport } from "@brainspore/hypernexus";

export async function PATCH(request: NextRequest) {
  try {
    const { no: advanceNo, ...body } = await request.json();

    if (!advanceNo) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NO_ID", message: "Missing advance number (no)" },
        },
        { status: 400 }
      );
    }

    const payload = { ...body, no: advanceNo };
    console.log("🔧 Payload being sent to transport.patch:", payload);

    const options: any = {};
    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
    }

    const response = await transport.patch(
      "/api/KineticTechnology/PayRoll/v2.0/payrollAdvance",
      payload,
      {
        ...options,
        primaryKey: ["no"],
      }
    );
    if ((response as any)?.error) {
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
      data: response,
      message: "Salary advance updated successfully",
    });
  } catch (error: any) {
    console.error("❌ Update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PATCH_ERROR",
          message: error?.message || "Failed to update salary advance",
        },
      },
      { status: 500 }
    );
  }
}

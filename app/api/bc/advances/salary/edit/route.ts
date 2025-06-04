import { NextRequest, NextResponse } from "next/server";
import { transport } from "@brainspore/hypernexus";

function formatTime(value: string): string {
  if (!value || typeof value !== "string") return "00:00:00";
  const [hh = "00", mm = "00"] = value.split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`;
}

function formatDate(value: string): string {
  if (!value || typeof value !== "string") return "0001-01-01";
  return new Date(value).toISOString().split("T")[0];
}

export async function PATCH(request: NextRequest) {
  try {
    const {
      no: advanceNo,
      collectionDate,
      cashHours,
      ...body
    } = await request.json();

    if (!advanceNo) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NO_ID", message: "Missing advance number (no)" },
        },
        { status: 400 }
      );
    }

    const payload = {
      ...body,
      no: advanceNo,
      collectionDate: formatDate(collectionDate),
      cashHours: formatTime(cashHours),
    };

    console.log("📤 PATCH Payload:", payload);

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

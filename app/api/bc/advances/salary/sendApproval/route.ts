import { transport } from "@brainspore/hypernexus";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { advanceNo } = await request.json();
    if (!advanceNo) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NO_ID", message: "Missing advance number" },
        },
        { status: 400 }
      );
    }

    const options: Record<string, any> = {};
    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
    }

    const response = await transport.cu(
      "/ODataV4/PayrollIntegration_SendApprovalRequest",
      {
        docNo: advanceNo,
      },
      options
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
      message: "Approval request sent successfully",
    });
  } catch (error: any) {
    console.error("❌ Error sending approval:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SEND_APPROVAL_ERROR",
          message:
            error?.message || "Failed to send salary advance for approval",
        },
      },
      { status: 500 }
    );
  }
}

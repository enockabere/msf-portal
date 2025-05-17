import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { profileNo, lineNo } = body;
    if (!profileNo || lineNo === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Missing required 'profileNo' or 'lineNo' for deletion.",
          },
        },
        { status: 400 }
      );
    }

    const options: any = {
      primaryKey: ["profileNo", "lineNo"],
    };

    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
    }
    const response = await transport.delete(
      "/api/kinetics/adminTravel/v1.0/profileDependants",
      { profileNo, lineNo },
      options
    );
    if ((response as any)?.error) {
      return NextResponse.json(
        {
          success: false,
          rawResponse: response,
          message: "Failed to delete dependent",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Dependent deleted successfully",
      data: response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: error?.message || "Failed to delete dependent",
        },
      },
      { status: 500 }
    );
  }
}

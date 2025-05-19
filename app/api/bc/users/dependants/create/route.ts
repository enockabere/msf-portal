/* eslint-disable @typescript-eslint/no-explicit-any */
import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload: Record<string, any> = {
      profileNo: body.profileNo,
      name: body.name,
      relation: body.relation,
      dob: body.dob,
      gender: body.gender,
      countryOfOrigin: body.countryOfOrigin,
    };

    const options: any = {};
    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
    }

    const response = await transport.post(
      "/api/kinetics/adminTravel/v1.0/profileDependants",
      payload,
      options
    );

    if ((response as any)?.error) {
      console.error("❌ BC API error:", (response as any).error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create profile dependent",
          rawResponse: response,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dependent created successfully",
      data: response,
    });
  } catch (error: any) {
    console.error("❌ Unexpected error while creating dependent:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DEPENDENT_CREATE_ERROR",
          message: error?.message || "Something went wrong",
        },
      },
      { status: 500 }
    );
  }
}

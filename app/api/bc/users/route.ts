/* eslint-disable @typescript-eslint/no-explicit-any */
import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload: Record<string, any> = {
      type: body.type || "51650",
      no: body.no || "",
      firstName: body.firstName,
      middleName: body.middleName || "",
      lastName: body.lastName,
      phoneNo: body.phone,
      eMail: body.email,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      countryRegionCode: body.countryRegionCode,
      passportIDNo: body.passportIDNo || "",
    };
    const options: any = {};
    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
    }

    const response = (await transport.post(
      "/api/kinetics/adminTravel/v1.0/userProfiles",
      payload,
      options
    )) as { id?: string; status?: string; value?: { id?: string } };

    if ((response as any)?.error) {
      console.error("API returned error:", (response as any).error);
      return NextResponse.json(
        {
          success: false,
          rawResponse: response,
          message: "Failed to update user profile",
        },
        { status: 400 }
      );
    }

    const successResponse = {
      success: true,
      data: {
        id: response?.id || response?.value?.id || "",
        status: "Updated",
      },
      message: "User profile updated successfully",
    };

    return NextResponse.json(successResponse);
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "POST_ERROR",
          message: error?.message || "Failed to update user profile",
        },
      },
      { status: 500 }
    );
  }
}

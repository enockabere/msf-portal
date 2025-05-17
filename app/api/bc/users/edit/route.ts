/* eslint-disable @typescript-eslint/no-explicit-any */
import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    console.log(body);

    const { no, type } = body;

    if (!no || !type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Missing required 'type' or 'no' field for update.",
          },
        },
        { status: 400 }
      );
    }

    const payload: Record<string, any> = {
      no,
      type,
      firstName: body.firstName,
      middleName: body.middleName || body.secondName || "",
      lastName: body.lastName,
      phoneNo: body.phoneNo,
      eMail: body.eMail || body.email, // must be present
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      countryRegionCode: body.countryRegionCode || body.countryCode,
      passportIDNo: body.passportIDNo || body.identificationDocumentNo || "",
      city: body.city,
      citizenNonCitizen: body.citizenNonCitizen || "",
      title: body.profileTitle || "",
    };

    const options: any = {
      primaryKey: ["type", "no"],
    };

    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
      console.log("Using company parameter:", process.env.BC_COMPANY_NAME);
    }

    const response = await transport.patch(
      "/api/kinetics/adminTravel/v1.0/userProfiles",
      payload,
      options
    );

    console.log("API PATCH response:", JSON.stringify(response, null, 2));

    if ((response as any)?.error) {
      return NextResponse.json(
        {
          success: false,
          rawResponse: response,
          message: "Failed to patch user profile",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: "User profile updated successfully",
    });
  } catch (error: any) {
    console.error("❌ PATCH error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PATCH_ERROR",
          message: error?.message || "Failed to patch user profile",
        },
      },
      { status: 500 }
    );
  }
}

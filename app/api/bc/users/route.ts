/* eslint-disable @typescript-eslint/no-explicit-any */
import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

interface UserProfilePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  countryRegionCode: string;
  title?: string;
  passportIDNo?: string;
  city: string;
  postCode?: string;
  citizenNonCitizen: string;
  image?: string;
}

export async function POST(request: Request) {
  try {
    // Log the incoming request
    console.log("Incoming request to /api/bc/user-profiles");

    const body = await request.json();
    console.log("Received form data:", JSON.stringify(body, null, 2));

    const payload: Record<string, any> = {
      type: body.type || "Visitor", // or "Employee" based on your logic
      no: body.no || "", // required field, empty for new creation
      firstName: body.firstName,
      middleName: body.middleName || "",
      lastName: body.lastName,
      phoneNo: body.phone, // mapped correctly
      eMail: body.email, // mapped correctly
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      countryRegionCode: body.countryRegionCode,
      title: body.title || "",
      passportIDNo: body.passportIDNo || "",
      city: body.city,
      postCode: body.postCode || "",
      citizenNonCitizen: body.citizenNonCitizen,
    };
    console.log("Constructed payload:", JSON.stringify(payload, null, 2));
    const options: any = {};
    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
      console.log("Using company parameter:", process.env.BC_COMPANY_NAME);
    }
    console.log(
      "Making request to /api/kinetics/adminTravel/v1.0/userProfiles with payload:",
      payload
    );

    const response = (await transport.post(
      "/api/kinetics/adminTravel/v1.0/userProfiles",
      payload,
      options
    )) as { id?: string; status?: string; value?: { id?: string } };

    console.log(
      "Received response from API:",
      JSON.stringify(response, null, 2)
    );

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

    console.log(
      "Returning success response:",
      JSON.stringify(successResponse, null, 2)
    );

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

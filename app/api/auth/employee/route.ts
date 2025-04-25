import { transport } from "@brainspore/hypernexus";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Missing 'email' query parameter." },
        { status: 400 }
      );
    }

    const response = await transport.get(
      "/api/KineticTechnology/ESS/v1.0/leavemployees",
      {
        $filter: `email eq '${email}'`,
      }
    );

    return NextResponse.json({
      data: response,
    });
  } catch (error) {
    console.error("Fetch Employee Data Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee data" },
      { status: 500 }
    );
  }
}

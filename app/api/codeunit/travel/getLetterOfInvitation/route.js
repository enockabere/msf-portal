import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { docType, docNo } = body;

    if (!docType || !docNo) {
      return NextResponse.json(
        { error: { message: "Missing docType or docNo in request body" } },
        { status: 400 }
      );
    }

    const result = await transport.cu(
      "/ODataV4/TravelManager_getLetterOfInvitation",
      { docType, docNo },
      {
        params: { company: process.env.BC_COMPANY_NAME },
      }
    );

    console.log("📄 LOI Raw Result:", JSON.stringify(result, null, 2));
    console.log("📄 Type of result:", typeof result);

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ downloadUrl: result });
  } catch (err) {
    console.error("❌ Codeunit exception:", {
      error: err.message,
      stack: err.stack,
      fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
    });

    return NextResponse.json(
      { error: { message: err.message || "Unexpected error" } },
      { status: 500 }
    );
  }
}

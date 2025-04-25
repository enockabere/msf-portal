import { transport } from "@brainspore/hypernexus";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentNo = searchParams.get("documentNo");

    if (!documentNo) {
      return NextResponse.json(
        { error: "Missing document number in query" },
        { status: 400 }
      );
    }

    const response = await transport.get(
      "/api/Kinetics/VOYAGER/v1.0/approvalEntries",
      {
        $filter: `documentNo eq '${documentNo}'`,
      }
    );

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error("Fetch Salary Advance Approval Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary advance approval entries" },
      { status: 500 }
    );
  }
}

import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const employeeNo = searchParams.get("employeeNo");

  if (!employeeNo) {
    return NextResponse.json(
      { error: "Missing employee number" },
      { status: 400 }
    );
  }

  console.log("📩 Employee Number from Client:", employeeNo);

  try {
    const response = await transport.get(
      "/api/KineticTechnology/PayRoll/v2.0/payrollAdvance",
      {
        $filter: `employeeCode eq '${employeeNo}'`,
      }
    );
    return NextResponse.json({ data: response });
  } catch (error) {
    console.error("Fetch Salary Advance Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary advance" },
      { status: 500 }
    );
  }
}

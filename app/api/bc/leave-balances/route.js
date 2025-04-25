import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await transport.get(
      "/api/BusinessCentral/Leave/v1.0/LeaveBalance",
      {},
      { headers: { Prefer: "maxpagesize=50" } }
    );

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error("Leave Balances Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave balances" },
      { status: 500 }
    );
  }
}

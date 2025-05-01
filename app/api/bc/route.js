import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filters = transport.filter({ eMail: "victor.okinyi@kinetics.co.ke" });

    const response = await transport.get(
      "/api/kinetics/enigma/v1.0/userProfiles",
      filters,
      { headers: { Prefer: "maxpagesize=2" } }
    );

    const json = await response.json();
    return NextResponse.json(json.value);
  } catch (err) {
    console.error("❌ Error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { transport } from "@brainspore/hypernexus";
import { memoryMap } from "../../../utils/endpointMap";

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const res = (await transport.get(memoryMap.get("userProfiles"), {
      $filter: `eMail eq '${email}' and eMail ne ''`,
      company: process.env.BC_COMPANY_NAME,
    })) as { value: any[] };

    const user = res?.value?.[0];
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}

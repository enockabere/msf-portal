import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { memoryMap } from "../../../utils/endpointMap";
import { transport } from "@brainspore/hypernexus";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const res = (await transport.get(memoryMap.get("userProfiles"), {
      $filter: `eMail eq '${email}' and eMail ne ''`,
      company: process.env.BC_COMPANY_NAME,
    })) as { value: any[] };

    const profile = res?.value?.[0];
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    console.log("🔐 Current token before update:", session);

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("❌ Token update failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

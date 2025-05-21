import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { memoryMap } from "@/app/utils/endpointMap";
import { transport } from "@brainspore/hypernexus";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const email = token?.email;


  if (!email || !token) {
    console.warn("❌ Invalid request: Missing token or email");
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const response = (await transport.get(memoryMap.get("userProfiles"), {
      $filter: `eMail eq '${email}' and eMail ne ''`,
      company: process.env.BC_COMPANY_NAME,
    })) as { value: any[] };


    const userProfile = response?.value?.[0];

    if (!userProfile) {
      console.warn("❌ User profile not found in BC");
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile: userProfile });
  } catch (error) {
    console.error("❌ Failed to refresh session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

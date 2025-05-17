import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { transport } from "@brainspore/hypernexus";
import { memoryMap } from "@/app/utils/endpointMap";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
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
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}

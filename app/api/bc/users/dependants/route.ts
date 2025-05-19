import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

interface DependantEntry {
  profileNo: string;
  lineNo: number;
  dob: string;
  name: string;
  relation: string;
  gender: string;
  countryOfOrigin: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const employeeNo = searchParams.get("employeeNo");

  if (!employeeNo) {
    return NextResponse.json({ error: "Missing portal ID" }, { status: 400 });
  }

  try {
    const response = (await transport.get(
      "/api/kinetics/adminTravel/v1.0/profileDependants",
      {
        $filter: `profileNo eq '${employeeNo}'`,
        $select: "profileNo,lineNo,dob,name,relation,gender,countryOfOrigin",
      }
    )) as { value: DependantEntry[] };

    const sorted = [...response.value].sort(
      (a, b) => new Date(b.dob).getTime() - new Date(a.dob).getTime()
    );

    return NextResponse.json({ data: { value: sorted } });
  } catch (error) {
    console.error("❌ Fetch Travel Dependants Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Travel Dependants" },
      { status: 500 }
    );
  }
}

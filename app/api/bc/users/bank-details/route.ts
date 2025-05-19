import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

// Define the shape of the profile response
interface UserProfile {
  currencyCode?: string;
  bankName?: string;
  bankBranchNo?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
  no?: string;
  type?: string;
  eMail?: string;
  gender?: string;
  passportIDNo?: string;
}

interface TransportResponse {
  value?: UserProfile[];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const employeeNo = searchParams.get("employeeNo");

  if (!employeeNo) {
    return NextResponse.json(
      { error: "Missing employee number" },
      { status: 400 }
    );
  }

  try {
    const response = (await transport.get(
      "/api/kinetics/adminTravel/v1.0/userProfiles",
      {
        $filter: `no eq '${employeeNo}'`,
        $select: [
          "currencyCode",
          "bankName",
          "bankBranchNo",
          "bankAccountNo",
          "bankAccountName",
          "no",
          "type",
          "eMail",
          "gender",
          "passportIDNo",
        ].join(","),
      }
    )) as TransportResponse;

    const profile = response?.value?.[0];

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        currency: profile.currencyCode || "",
        bankCode: profile.bankName || "",
        branchNo: profile.bankBranchNo || "",
        accountNumber: profile.bankAccountNo || "",
        accountName: profile.bankAccountName || "",
        no: profile.no || "",
        type: profile.type || "",
        eMail: profile.eMail || "",
        gender: profile.gender || "",
        passportIDNo: profile.passportIDNo || "",
      },
    });
  } catch (error) {
    console.error("❌ Bank Details Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank details" },
      { status: 500 }
    );
  }
}

import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

interface AdvanceEntry {
  no: string;
  employeeName: string;
  applicationDate: string;
  preferredDisbursementDate: string;
  advanceType: string;
  status: string;
  applicationAmount: number;
  currencyCode: string;
  bankCode?: string;
  accountNo?: string;
  mobilePhoneNo?: string;
  identificationDocumentNo?: string;
  employeeBankName?: string;
  employeeBranchCode?: string;
  employeeBranchName?: string;
  chequeName?: string;
  swiftCode?: string;
  paymentMethod?: string;
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
      "/api/KineticTechnology/PayRoll/v2.0/payrollAdvance",
      {
        $filter: `employeeCode eq '${employeeNo}'`,
        $select:
          "no,employeeName,applicationDate,preferredDisbursementDate,advanceType,status,applicationAmount,currencyCode,bankCode,accountNo,mobilePhoneNo,identificationDocumentNo,employeeBankName,employeeBranchCode,employeeBranchName,chequeName,swiftCode,paymentMethod",
      }
    )) as { value: AdvanceEntry[] };

    const sorted = [...response.value].sort(
      (a, b) =>
        new Date(b.applicationDate).getTime() -
        new Date(a.applicationDate).getTime()
    );

    return NextResponse.json({ data: { value: sorted } });
  } catch (error) {
    console.error("❌ Fetch Salary Advance Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary advance" },
      { status: 500 }
    );
  }
}

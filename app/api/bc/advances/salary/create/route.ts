/* eslint-disable @typescript-eslint/no-explicit-any */
import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

interface Payload {
  employeeCode: string;
  applicationAmount: number;
  currencyCode: string;
  applicationDate: string;
  paymentMethod: string;
  payrollPeriod: string;
  mobilePhoneNo?: string;
  identificationDocumentNo?: string;
  accountNo?: string;
  bankCode?: string;
  employeeBranchCode?: string;
  employeeBranchName?: string;
  employeeBankName?: string;
  chequeName?: string;
  swiftCode?: string;
  collectionDate: string;
  cashHours: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const formatTime = (time: string | undefined): string => {
      if (!time || time.trim() === "") return "00:00:00";
      return time.length === 5 ? `${time}:00` : time;
    };

    const formatDate = (date: string | undefined): string => {
      if (!date || date.trim() === "") return "0001-01-01";
      return new Date(date).toISOString().split("T")[0];
    };

    const payload: Payload = {
      ...body,
      applicationDate: new Date().toISOString().split("T")[0],
      collectionDate: formatDate(body.collectionDate),
      cashHours: formatTime(body.cashHours),
    };

    const options: any = {};
    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
    }

    const response = await transport.post(
      "/api/KineticTechnology/PayRoll/v2.0/payrollAdvance",
      payload,
      options
    );

    if ((response as any)?.error) {
      return NextResponse.json(
        {
          success: false,
          rawResponse: response,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: "Salary advance created successfully",
    });
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "POST_ERROR",
          message: error?.message || "Failed to create salary advance",
        },
      },
      { status: 500 }
    );
  }
}

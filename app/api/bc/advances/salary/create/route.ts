import { transport } from "@brainspore/hypernexus";
import { NextResponse } from "next/server";

interface ApiError {
  code: string;
  message: string;
  correlationId?: string;
}

interface ApiSuccessResponse {
  no: string;
  applicationDate: string;
  employeeCode: string;
  employeeName: string;
  preferredDisbursementDate: string;
  advanceType: string;
  applicationAmount: number;
  payrollPeriod: string;
  status: string;
  currencyCode: string;
  bankCode?: string;
  employeeBankName?: string;
  employeeBranchCode?: string;
  employeeBranchName?: string;
  accountNo?: string;
  chequeName?: string;
  swiftCode?: string;
  paymentMethod: string;
}

interface ApiResponse {
  data?: ApiSuccessResponse;
  error?: ApiError;
}

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
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload: Payload = {
      ...body,
      applicationDate: new Date().toISOString().split("T")[0],
    };

    const options: any = {};
    if (process.env.BC_COMPANY_NAME) {
      options.params = { company: process.env.BC_COMPANY_NAME };
    }

    const response = await transport.post<ApiResponse>(
      "/api/KineticTechnology/PayRoll/v2.0/payrollAdvance",
      payload,
      options
    );

    if (response.error) {
      console.error("🔴 API returned error:", response.error);
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 }
      );
    }

    if (!response.data) {
      console.warn("🟠 API returned empty data");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_RESPONSE",
            message: "API returned empty response",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: "Salary advance created successfully",
    });
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.response?.data?.code || "API_ERROR",
          message:
            error.response?.data?.message || "Failed to create salary advance",
        },
      },
      { status: error.response?.status || 500 }
    );
  }
}

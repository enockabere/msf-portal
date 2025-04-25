import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("✅ [API] /api/auth/token POST endpoint hit");
  console.log(
    "📍 Redirect URI received:",
    process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI
  );

  try {
    const body = await req.json();
    const code = body.code;

    console.log("🔍 Authorization code received:", code);

    const params = new URLSearchParams();
    params.append("client_id", process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!);
    params.append(
      "client_secret",
      process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET!
    );
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append(
      "redirect_uri",
      process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI!
    );
    params.append("scope", process.env.NEXT_PUBLIC_AZURE_AD_SCOPE!);

    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("❌ Token fetch failed:", errorText);
      return NextResponse.json(
        { error: "Token exchange failed." },
        { status: 500 }
      );
    }

    const tokenData = await tokenRes.json();

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("❗ API error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (request.nextUrl.pathname === "/") {
    const type = (token?.profile as { type?: string })?.type;

    if (type === "Employee") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (type === "Visitor") {
      return NextResponse.redirect(new URL("/dashboard/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};

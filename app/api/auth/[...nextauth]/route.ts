import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/auth";
import { isProviderSigninPath } from "@/lib/auth-env";

export const { POST } = handlers;

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isProviderSigninPath(pathname)) {
    const dest = req.nextUrl.clone();
    dest.pathname = "/signin";
    dest.search = "";
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) dest.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(dest);
  }
  return handlers.GET(req);
}

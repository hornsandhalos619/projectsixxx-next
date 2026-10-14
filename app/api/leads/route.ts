import { NextResponse } from "next/server";
import { captureLead } from "@/lib/leads";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      source?: string;
      tag?: string;
    };
    const email = String(body.email ?? "");
    const source = String(body.source ?? "unknown");
    const tag = body.tag ? String(body.tag) : undefined;
    const result = await captureLead({ email, source, tag });
    return NextResponse.json(result, { status: result.persisted ? 200 : 503 });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_email") {
      return NextResponse.json({ ok: false, reason: "invalid_email" }, { status: 400 });
    }
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

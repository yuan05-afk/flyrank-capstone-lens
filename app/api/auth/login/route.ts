import { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { apiKey } = (await request.json().catch(() => ({}))) as { apiKey?: string };
  const expected = process.env.DEMO_API_KEY || "lens_demo_key_001";
  if (apiKey !== expected) {
    return Response.json({ error: "Invalid demo key" }, { status: 401 });
  }
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${expected}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
  );
  return response;
}

export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  return response;
}

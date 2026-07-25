import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { decisionSchema } from "@/lib/validation";
import { pairingsRepository } from "@/repositories";

type Ctx = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Ctx) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  const parsed = decisionSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  try {
    return Response.json({
      pairing: await pairingsRepository.decide(params.id, parsed.data.decision),
    });
  } catch {
    return Response.json({ error: "Pairing not found" }, { status: 404 });
  }
}

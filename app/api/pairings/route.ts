import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { pairingSchema } from "@/lib/validation";
import { pairingsRepository } from "@/repositories";
import { matchingService } from "@/services/matching.service";

export async function GET(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  return Response.json({ pairings: await pairingsRepository.listDesk() });
}

export async function POST(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  const parsed = pairingSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  try {
    const pairing = await matchingService.forcePair(parsed.data.postId, parsed.data.imageId);
    return Response.json({ pairing }, { status: 201 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}

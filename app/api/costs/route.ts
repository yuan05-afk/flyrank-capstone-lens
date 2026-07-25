import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { costsRepository } from "@/repositories";

export async function GET(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  const events = await costsRepository.list();
  return Response.json({
    events,
    totalUsd: events.reduce((sum, event) => sum + event.totalUsd, 0),
    visionCalls: events.filter((event) => event.kind === "vision").length,
    embeddingCalls: events.filter((event) => event.kind === "embedding").length,
  });
}

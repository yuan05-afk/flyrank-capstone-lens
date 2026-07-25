import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { classificationService } from "@/services/classification.service";

export async function POST(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  return Response.json(await classificationService.enqueuePending(), { status: 202 });
}

import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { imagesRepository } from "@/repositories";

export async function GET(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  return Response.json({ images: await imagesRepository.list() });
}

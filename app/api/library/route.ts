import { NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoAuth } from "@/lib/auth";
import { libraryService } from "@/services/library.service";

const imageSchema = z.object({
  name: z.string().min(1).max(160),
  relativePath: z.string().min(1).max(260),
});

const postSchema = z.object({
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
  subject: z.string().min(1).max(120).nullable().optional(),
  url: z.string().url().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  return Response.json(await libraryService.snapshot());
}

export async function POST(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  const body = await request.json();
  const kind = body?.kind;

  if (kind === "image") {
    const input = imageSchema.parse(body);
    const image = await libraryService.registerImage(input);
    return Response.json({ image }, { status: 201 });
  }

  if (kind === "post") {
    const input = postSchema.parse(body);
    const post = await libraryService.registerPost(input);
    return Response.json({ post }, { status: 201 });
  }

  return Response.json(
    { error: "kind must be image or post" },
    { status: 400 }
  );
}

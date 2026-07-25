import fs from "fs";
import path from "path";
import { imageTagsSchema, type ImageTags } from "@/lib/validation";
import type { EmbeddingProvider, VisionProvider } from "./contracts";

function apiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is required for live providers");
  return key;
}

export class OpenAIVisionProvider implements VisionProvider {
  readonly id = "gpt-4.1-mini";

  async classify(input: { imagePath: string; mimeType?: string }): Promise<ImageTags> {
    const absolute = path.isAbsolute(input.imagePath)
      ? input.imagePath
      : path.join(process.cwd(), input.imagePath.replace(/^\//, "public/"));
    const mime = input.mimeType || (absolute.endsWith(".svg") ? "image/svg+xml" : "image/jpeg");
    const data = fs.readFileSync(absolute).toString("base64");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.id,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "Identify only what is visible. Return strict structured tags. If uncertain, lower confidence instead of guessing." },
            { type: "input_image", image_url: `data:${mime};base64,${data}` },
          ],
        }],
        text: {
          format: {
            type: "json_schema",
            name: "image_tags",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["subject", "category", "attributes", "caption", "confidence"],
              properties: {
                subject: { type: "string" },
                category: { type: "string" },
                attributes: { type: "array", items: { type: "string" } },
                caption: { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
              },
            },
          },
        },
      }),
    });
    if (!response.ok) throw new Error(`vision provider failed ${response.status}`);
    const json = (await response.json()) as { output_text?: string };
    return imageTagsSchema.parse(JSON.parse(json.output_text || "{}"));
  }
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly id = "text-embedding-3-small";

  async embed(text: string): Promise<number[]> {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.id, input: text }),
    });
    if (!response.ok) throw new Error(`embedding provider failed ${response.status}`);
    const json = (await response.json()) as { data: Array<{ embedding: number[] }> };
    return json.data[0].embedding;
  }
}

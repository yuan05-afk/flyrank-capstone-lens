import path from "path";
import { CORPUS, SPECIES } from "@/fixtures/catalog";
import { imageTagsSchema, type ImageTags } from "@/lib/validation";
import type { EmbeddingProvider, VisionProvider } from "./contracts";

export class SeedVisionProvider implements VisionProvider {
  readonly id = "seed-vision-v1";

  async classify(input: { imagePath: string }): Promise<ImageTags> {
    const name = path.basename(input.imagePath);
    const item = CORPUS.find((candidate) => candidate.name === name);
    if (!item) throw new Error(`seed vision has no fixture for ${name}`);

    return imageTagsSchema.parse({
      subject: item.subject,
      category: item.category,
      attributes: item.attributes,
      caption: `${item.subject} with ${item.attributes.slice(0, 3).join(", ")} in a natural ${item.category} setting`,
      confidence: item.confidence,
    });
  }
}

const DIMENSIONS = 48;

function hashToken(token: string): number {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function canonicalTokens(text: string): string[] {
  let normalized = text.toLowerCase();
  for (const species of SPECIES) {
    for (const alias of [species.subject, ...species.aliases]) {
      if (normalized.includes(alias)) {
        normalized += ` ${species.slug.replace(/-/g, " ")} ${species.subject}`;
      }
    }
  }
  return normalized.match(/[a-z0-9]+/g) ?? [];
}

export class SeedEmbeddingProvider implements EmbeddingProvider {
  readonly id = "seed-embedding-v1";

  async embed(text: string): Promise<number[]> {
    const vector = Array.from({ length: DIMENSIONS }, () => 0);
    const tokens = canonicalTokens(text);
    for (const token of tokens) {
      const hash = hashToken(token);
      vector[hash % DIMENSIONS] += 1;
      vector[(hash >>> 8) % DIMENSIONS] += 0.35;
    }
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => value / norm);
  }
}

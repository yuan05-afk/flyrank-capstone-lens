import type { EmbeddingProvider, VisionProvider } from "./contracts";
import { OpenAIEmbeddingProvider, OpenAIVisionProvider } from "./openai";
import { SeedEmbeddingProvider, SeedVisionProvider } from "./seed";

export function visionProvider(): VisionProvider {
  return process.env.VISION_PROVIDER === "openai"
    ? new OpenAIVisionProvider()
    : new SeedVisionProvider();
}

export function embeddingProvider(): EmbeddingProvider {
  return process.env.EMBEDDING_PROVIDER === "openai"
    ? new OpenAIEmbeddingProvider()
    : new SeedEmbeddingProvider();
}

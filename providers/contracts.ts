import type { ImageTags } from "@/lib/validation";

export interface VisionProvider {
  readonly id: string;
  classify(input: {
    imagePath: string;
    mimeType?: string;
  }): Promise<ImageTags>;
}

export interface EmbeddingProvider {
  readonly id: string;
  embed(text: string): Promise<number[]>;
}

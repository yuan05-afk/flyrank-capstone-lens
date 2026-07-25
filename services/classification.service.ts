import { GUARD_CONFIG } from "@/config/guard.config";
import { PRICING } from "@/config/pricing.config";
import { imageTagsSchema } from "@/lib/validation";
import { visionProvider } from "@/providers/registry";
import {
  costsRepository,
  imagesRepository,
  jobsRepository,
  tagsRepository,
} from "@/repositories";
import { costService } from "@/services/cost.service";

async function classifyWithRepair(imagePath: string) {
  const provider = visionProvider();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const raw = await provider.classify({
        imagePath,
        mimeType: "image/svg+xml",
      });
      return {
        tags: imageTagsSchema.parse(raw),
        provider: provider.id,
        attempts: attempt,
        repaired: attempt > 1,
      };
    } catch (error) {
      lastError = error as Error;
      // Second attempt re-invokes the provider seam. Live providers may return
      // repaired JSON; seed providers stay deterministic and should not fail.
    }
  }

  throw lastError ?? new Error("vision classification failed");
}

export const classificationService = {
  async enqueuePending() {
    const pending = await imagesRepository.pending();
    const jobs = [];
    for (const image of pending) {
      jobs.push(
        await jobsRepository.enqueue(
          "classify",
          JSON.stringify({ imageId: image.id }),
          `classify:${image.id}`
        )
      );
    }
    return { enqueued: jobs.length, jobs };
  },

  async classifyOne(imageId: string) {
    await costService.assertWithinBudget();
    const image = await imagesRepository.findById(imageId);
    if (!image) throw new Error("image not found");

    const { tags, provider, attempts, repaired } = await classifyWithRepair(image.path);
    const flaggedLowConfidence = tags.confidence < GUARD_CONFIG.confidenceThreshold;

    await tagsRepository.upsert({
      imageId,
      subject: tags.subject,
      category: tags.category,
      attributesJson: JSON.stringify(tags.attributes),
      caption: tags.caption,
      confidence: tags.confidence,
      flaggedLowConfidence,
      provider,
    });
    await imagesRepository.markStatus(imageId, flaggedLowConfidence ? "review" : "tagged");

    const pricing = PRICING[provider as keyof typeof PRICING] ?? { usdPerUnit: 0 };
    // Charge once per successful validated tag, including repair attempts.
    await costsRepository.create({
      kind: "vision",
      model: provider,
      units: attempts,
      unitCostUsd: pricing.usdPerUnit,
      totalUsd: pricing.usdPerUnit * attempts,
      refType: "image",
      refId: imageId,
    });

    return {
      imageId,
      tags,
      flaggedLowConfidence,
      provider,
      attempts,
      repaired,
    };
  },
};

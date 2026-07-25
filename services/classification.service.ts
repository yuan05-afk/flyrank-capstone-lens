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

export const classificationService = {
  async enqueuePending() {
    const pending = await imagesRepository.pending();
    const jobs = [];
    for (const image of pending) {
      jobs.push(await jobsRepository.enqueue("classify", JSON.stringify({ imageId: image.id })));
    }
    return { enqueued: jobs.length, jobs };
  },

  async classifyOne(imageId: string) {
    const image = await imagesRepository.findById(imageId);
    if (!image) throw new Error("image not found");
    const provider = visionProvider();
    const tags = imageTagsSchema.parse(
      await provider.classify({ imagePath: image.path, mimeType: "image/svg+xml" })
    );
    const flaggedLowConfidence = tags.confidence < GUARD_CONFIG.confidenceThreshold;

    await tagsRepository.upsert({
      imageId,
      subject: tags.subject,
      category: tags.category,
      attributesJson: JSON.stringify(tags.attributes),
      caption: tags.caption,
      confidence: tags.confidence,
      flaggedLowConfidence,
      provider: provider.id,
    });
    await imagesRepository.markStatus(imageId, flaggedLowConfidence ? "review" : "tagged");

    const pricing = PRICING[provider.id as keyof typeof PRICING] ?? {
      usdPerUnit: 0,
    };
    await costsRepository.create({
      kind: "vision",
      model: provider.id,
      units: 1,
      unitCostUsd: pricing.usdPerUnit,
      totalUsd: pricing.usdPerUnit,
      refType: "image",
      refId: imageId,
    });

    return { imageId, tags, flaggedLowConfidence, provider: provider.id };
  },
};

import { PRICING } from "@/config/pricing.config";
import { embeddingProvider } from "@/providers/registry";
import {
  costsRepository,
  embeddingsRepository,
  imagesRepository,
  jobsRepository,
  postsRepository,
} from "@/repositories";

export const embeddingService = {
  async enqueueAll() {
    const [images, posts] = await Promise.all([
      imagesRepository.list(),
      postsRepository.list(),
    ]);
    let enqueued = 0;
    for (const image of images.filter((item) => item.tag)) {
      await jobsRepository.enqueue(
        "embed",
        JSON.stringify({ ownerType: "image", ownerId: image.id })
      );
      enqueued += 1;
    }
    for (const post of posts) {
      await jobsRepository.enqueue(
        "embed",
        JSON.stringify({ ownerType: "post", ownerId: post.id })
      );
      enqueued += 1;
    }
    return { enqueued };
  },

  async embedOne(ownerType: "image" | "post", ownerId: string) {
    const provider = embeddingProvider();
    let text: string;

    if (ownerType === "image") {
      const image = await imagesRepository.findById(ownerId);
      if (!image?.tag) throw new Error("tagged image not found");
      text = `${image.tag.subject}. ${image.tag.category}. ${image.tag.caption}. ${JSON.parse(image.tag.attributesJson).join(", ")}`;
    } else {
      const post = await postsRepository.findById(ownerId);
      if (!post) throw new Error("post not found");
      text = `${post.subject ?? ""}. ${post.title}. ${post.body}`;
    }

    const vector = await provider.embed(text);
    if (ownerType === "image") {
      await embeddingsRepository.upsertForImage(ownerId, provider.id, vector);
    } else {
      await embeddingsRepository.upsertForPost(ownerId, provider.id, vector);
    }

    const units = Math.max(1, Math.ceil(text.length / 4));
    const pricing = PRICING[provider.id as keyof typeof PRICING] ?? {
      usdPerUnit: 0,
    };
    await costsRepository.create({
      kind: "embedding",
      model: provider.id,
      units,
      unitCostUsd: pricing.usdPerUnit,
      totalUsd: units * pricing.usdPerUnit,
      refType: ownerType,
      refId: ownerId,
    });
    return { ownerType, ownerId, dims: vector.length, provider: provider.id };
  },
};

import { cosineSimilarity } from "@/lib/similarity";
import {
  imagesRepository,
  pairingsRepository,
  postsRepository,
} from "@/repositories";
import { guardPairing } from "./guard.service";

function vectorOf(value: string | null | undefined): number[] {
  if (!value) return [];
  return JSON.parse(value) as number[];
}

export const matchingService = {
  async rank(postId: string, limit = 8, persist = false) {
    const [post, images] = await Promise.all([
      postsRepository.findById(postId),
      imagesRepository.list(),
    ]);
    if (!post?.embedding) throw new Error("post embedding not found");
    const postVector = vectorOf(post.embedding.vectorJson);

    const ranked = images
      .filter((image) => image.tag && image.embedding)
      .map((image) => {
        const score = cosineSimilarity(
          postVector,
          vectorOf(image.embedding?.vectorJson)
        );
        const verdict = guardPairing({
          postSubject: post.subject,
          imageSubject: image.tag!.subject,
          score,
          confidence: image.tag!.confidence,
        });
        return {
          image,
          score,
          verdict,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (persist) {
      for (const candidate of ranked.slice(0, 3)) {
        await pairingsRepository.upsert({
          postId,
          imageId: candidate.image.id,
          score: candidate.score,
          status: candidate.verdict.status,
          guardReason: candidate.verdict.reason,
        });
      }
    }

    const firstAccepted = ranked.find((candidate) => candidate.verdict.accepted);
    return {
      post,
      status: firstAccepted ? "suggested" : "no_match",
      reason: firstAccepted
        ? null
        : ranked[0]?.verdict.reason || "No embedded images are available.",
      candidates: ranked,
    };
  },

  async forcePair(postId: string, imageId: string) {
    const [post, image] = await Promise.all([
      postsRepository.findById(postId),
      imagesRepository.findById(imageId),
    ]);
    if (!post?.embedding) throw new Error("post embedding not found");
    if (!image?.embedding || !image.tag) throw new Error("tagged image embedding not found");
    const score = cosineSimilarity(
      vectorOf(post.embedding.vectorJson),
      vectorOf(image.embedding.vectorJson)
    );
    const verdict = guardPairing({
      postSubject: post.subject,
      imageSubject: image.tag.subject,
      score,
      confidence: image.tag.confidence,
    });
    return pairingsRepository.upsert({
      postId,
      imageId,
      score,
      status: verdict.status,
      guardReason: verdict.reason,
    });
  },
};

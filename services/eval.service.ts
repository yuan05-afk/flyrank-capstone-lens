import { EVAL_CASES } from "@/fixtures/catalog";
import { postsRepository } from "@/repositories";
import { matchingService } from "./matching.service";

export const evalService = {
  async run() {
    const results = [];
    let correct = 0;
    for (const testCase of EVAL_CASES) {
      const post = await postsRepository.findBySlug(testCase.postSlug);
      if (!post) throw new Error(`missing eval post ${testCase.postSlug}`);
      const ranked = await matchingService.rank(post.id, 8, false);
      const accepted = ranked.candidates.find((candidate) => candidate.verdict.accepted);
      const predicted = accepted?.image.tag?.subject ?? null;
      const pass =
        testCase.expectedSubject === null
          ? ranked.status === "no_match"
          : predicted === testCase.expectedSubject;
      if (pass) correct += 1;
      results.push({
        postSlug: testCase.postSlug,
        expected: testCase.expectedSubject,
        predicted,
        status: ranked.status,
        pass,
      });
    }
    return {
      total: results.length,
      correct,
      top1Precision: results.length ? correct / results.length : 0,
      results,
    };
  },
};

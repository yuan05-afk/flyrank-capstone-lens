import { BUDGET_CONFIG } from "@/config/budget.config";
import { costsRepository, pairingsRepository } from "@/repositories";

export const costService = {
  async summary() {
    const [spentUsd, kindCounts, outcomes] = await Promise.all([
      costsRepository.totalUsd(),
      costsRepository.countsByKind(),
      pairingsRepository.countsByStatus(),
    ]);
    const visionCalls = kindCounts.vision ?? 0;
    const embeddingCalls = kindCounts.embedding ?? 0;
    const budgetUsd = BUDGET_CONFIG.maxBatchUsd;
    const remainingUsd = Math.max(0, budgetUsd - spentUsd);

    return {
      events: [],
      totalUsd: spentUsd,
      visionCalls,
      embeddingCalls,
      budgetUsd,
      remainingUsd,
      budgetExhausted: spentUsd >= budgetUsd,
      costPerVisionCall: visionCalls ? spentUsd / Math.max(visionCalls, 1) : 0,
      costPerAcceptedPairing: outcomes.accepted ? spentUsd / outcomes.accepted : null,
      outcomes,
    };
  },

  async assertWithinBudget() {
    const spentUsd = await costsRepository.totalUsd();
    if (spentUsd >= BUDGET_CONFIG.maxBatchUsd) {
      const error = new Error(
        `Batch budget exhausted: spent $${spentUsd.toFixed(4)} of $${BUDGET_CONFIG.maxBatchUsd.toFixed(2)}`
      );
      (error as Error & { code?: string }).code = "BUDGET_EXHAUSTED";
      throw error;
    }
    return { spentUsd, remainingUsd: BUDGET_CONFIG.maxBatchUsd - spentUsd };
  },
};

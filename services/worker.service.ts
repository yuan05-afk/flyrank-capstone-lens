import { BUDGET_CONFIG } from "@/config/budget.config";
import { classificationService } from "@/services/classification.service";
import { embeddingService } from "@/services/embedding.service";
import { costService } from "@/services/cost.service";
import { jobsRepository } from "@/repositories";

export const workerService = {
  async tickOnce() {
    try {
      await costService.assertWithinBudget();
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === "BUDGET_EXHAUSTED") {
        return { processed: false, stopped: "budget", error: err.message };
      }
      throw error;
    }

    const job = await jobsRepository.claimDue(BUDGET_CONFIG.leaseMs);
    if (!job) return { processed: false };

    try {
      await jobsRepository.heartbeat(job.id, BUDGET_CONFIG.leaseMs);
      const payload = JSON.parse(job.payload) as {
        imageId?: string;
        ownerType?: "image" | "post";
        ownerId?: string;
      };

      if (job.type === "classify" && payload.imageId) {
        const result = await classificationService.classifyOne(payload.imageId);
        await jobsRepository.done(job.id);
        return {
          processed: true,
          jobId: job.id,
          type: job.type,
          attempts: job.attempts,
          result,
        };
      }

      if (job.type === "embed" && payload.ownerType && payload.ownerId) {
        const result = await embeddingService.embedOne(payload.ownerType, payload.ownerId);
        await jobsRepository.done(job.id);
        return {
          processed: true,
          jobId: job.id,
          type: job.type,
          attempts: job.attempts,
          result,
        };
      }

      throw new Error(`unsupported job type ${job.type}`);
    } catch (error) {
      const message = (error as Error).message;
      const terminal = job.attempts >= BUDGET_CONFIG.maxAttempts;
      await jobsRepository.retry(job.id, message, 500 * 2 ** job.attempts, terminal);
      return {
        processed: true,
        jobId: job.id,
        error: message,
        terminal,
        attempts: job.attempts,
        // One failed item retries; the batch continues on the next tick.
        partialFailure: !terminal,
      };
    }
  },

  async drain(max = 200) {
    const results = [];
    for (let i = 0; i < max; i += 1) {
      const result = await this.tickOnce();
      if (!result.processed) {
        if ("stopped" in result && result.stopped) {
          return { processed: results.length, results, stopped: result.stopped, error: result.error };
        }
        break;
      }
      results.push(result);
    }
    return { processed: results.length, results };
  },

  async timeline() {
    return jobsRepository.timeline();
  },
};

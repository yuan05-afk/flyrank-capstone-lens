import { z } from "zod";

export const imageTagsSchema = z.object({
  subject: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  attributes: z.array(z.string().min(1).max(80)).max(20),
  caption: z.string().min(1).max(800),
  confidence: z.number().min(0).max(1),
});

export type ImageTags = z.infer<typeof imageTagsSchema>;

export const jobSchema = z.object({
  type: z.enum(["classify", "embed"]),
});

export const pairingSchema = z.object({
  postId: z.string().min(1),
  imageId: z.string().min(1),
});

export const decisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
});

export const GUARD_CONFIG = {
  similarityThreshold: Number(process.env.SIM_THRESHOLD || 0.42),
  confidenceThreshold: Number(process.env.CONF_THRESHOLD || 0.72),
} as const;

export const SUBJECT_ALIASES: Record<string, string[]> = {
  "red fox": ["red fox", "fox", "vulpes vulpes", "vulpes"],
  wolf: ["wolf", "gray wolf", "grey wolf", "canis lupus"],
  dog: ["dog", "domestic dog", "canis familiaris", "canis lupus familiaris"],
  owl: ["owl", "barn owl", "tyto alba"],
  eagle: ["eagle", "bald eagle", "haliaeetus leucocephalus"],
  "polar bear": ["polar bear", "ursus maritimus"],
  "brown bear": ["brown bear", "grizzly", "ursus arctos"],
  tiger: ["tiger", "panthera tigris"],
  lion: ["lion", "panthera leo"],
  leopard: ["leopard", "panthera pardus"],
};

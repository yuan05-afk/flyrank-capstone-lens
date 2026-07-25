export type SpeciesFixture = {
  subject: string;
  slug: string;
  category: string;
  aliases: string[];
  attributes: string[];
  palette: [string, string, string];
};

export const SPECIES: SpeciesFixture[] = [
  { subject: "red fox", slug: "red-fox", category: "wildlife", aliases: ["fox", "vulpes vulpes"], attributes: ["rust coat", "white chest", "pointed ears", "bushy tail"], palette: ["#9A3412", "#EA580C", "#FED7AA"] },
  { subject: "gray wolf", slug: "gray-wolf", category: "wildlife", aliases: ["wolf", "canis lupus"], attributes: ["gray coat", "long muzzle", "upright ears", "pack animal"], palette: ["#334155", "#64748B", "#CBD5E1"] },
  { subject: "domestic dog", slug: "domestic-dog", category: "companion animal", aliases: ["dog", "canis familiaris"], attributes: ["domestic", "collar", "short muzzle", "friendly"], palette: ["#78350F", "#B45309", "#FDE68A"] },
  { subject: "barn owl", slug: "barn-owl", category: "bird", aliases: ["owl", "tyto alba"], attributes: ["heart-shaped face", "pale feathers", "nocturnal", "wings"], palette: ["#57534E", "#A8A29E", "#FEF3C7"] },
  { subject: "bald eagle", slug: "bald-eagle", category: "bird", aliases: ["eagle", "haliaeetus leucocephalus"], attributes: ["white head", "dark wings", "hooked beak", "raptor"], palette: ["#1F2937", "#374151", "#F8FAFC"] },
  { subject: "polar bear", slug: "polar-bear", category: "wildlife", aliases: ["ursus maritimus"], attributes: ["white fur", "arctic", "large mammal", "black nose"], palette: ["#64748B", "#CBD5E1", "#F8FAFC"] },
  { subject: "brown bear", slug: "brown-bear", category: "wildlife", aliases: ["grizzly", "ursus arctos"], attributes: ["brown fur", "shoulder hump", "large mammal", "forest"], palette: ["#451A03", "#92400E", "#D6D3D1"] },
  { subject: "tiger", slug: "tiger", category: "wildlife", aliases: ["panthera tigris"], attributes: ["orange coat", "black stripes", "big cat", "predator"], palette: ["#7C2D12", "#F97316", "#FFEDD5"] },
  { subject: "lion", slug: "lion", category: "wildlife", aliases: ["panthera leo"], attributes: ["golden coat", "mane", "big cat", "savanna"], palette: ["#713F12", "#CA8A04", "#FEF9C3"] },
  { subject: "leopard", slug: "leopard", category: "wildlife", aliases: ["panthera pardus"], attributes: ["spotted coat", "rosettes", "big cat", "climber"], palette: ["#422006", "#A16207", "#FDE68A"] },
];

export const CORPUS = SPECIES.flatMap((species) =>
  Array.from({ length: 5 }, (_, index) => ({
    ...species,
    variant: index + 1,
    name: `${species.slug}-${index + 1}.svg`,
    path: `/corpus/${species.slug}-${index + 1}.svg`,
    confidence: index === 4 ? 0.68 : Number((0.97 - index * 0.025).toFixed(3)),
  }))
);

export const POST_FIXTURES = [
  {
    slug: "red-fox-field-guide",
    title: "Red fox field guide",
    body: "How Vulpes vulpes uses its rust coat, pointed ears, and bushy tail to thrive at woodland edges.",
    subject: "red fox",
    url: "https://example.com/red-fox-field-guide",
  },
  {
    slug: "vulpes-vulpes-habitat",
    title: "Vulpes vulpes at the woodland edge",
    body: "A natural history of the adaptable fox species and its changing habitat.",
    subject: "red fox",
    url: "https://example.com/vulpes-vulpes",
  },
  {
    slug: "barn-owl-flight",
    title: "Why barn owls fly in silence",
    body: "The heart-shaped face and pale feathers of Tyto alba support a remarkable nocturnal hunter.",
    subject: "barn owl",
    url: "https://example.com/barn-owl-flight",
  },
  {
    slug: "tiger-stripes",
    title: "Every tiger wears a different pattern",
    body: "Panthera tigris hides in tall grass with an orange coat and unique black stripes.",
    subject: "tiger",
    url: "https://example.com/tiger-stripes",
  },
  {
    slug: "urban-rooftop-gardens",
    title: "How rooftop gardens cool a city",
    body: "An architecture guide to planted roofs, stormwater, and urban heat. This library has no relevant city image.",
    subject: "urban rooftop garden",
    url: "https://example.com/rooftop-gardens",
  },
];

export const EVAL_CASES = [
  { postSlug: "red-fox-field-guide", expectedSubject: "red fox" },
  { postSlug: "vulpes-vulpes-habitat", expectedSubject: "red fox" },
  { postSlug: "barn-owl-flight", expectedSubject: "barn owl" },
  { postSlug: "tiger-stripes", expectedSubject: "tiger" },
  { postSlug: "urban-rooftop-gardens", expectedSubject: null },
];

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(10).max(70),
    seoTitle: z.string().min(10).max(70).optional(),
    description: z.string().min(50).max(160),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("EvaMariaDreams"),
    category: z.string().min(2),
    tags: z.array(z.string()).min(1),
    image: z.string().optional(),
    imageAvif: z.string().optional(),
    imageWebp: z.string().optional(),
    imageAlt: z.string().optional(),
    imageWidth: z.number().int().positive().optional(),
    imageHeight: z.number().int().positive().optional(),
    socialImage: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    related: z.array(z.string()).default([]),
  }).superRefine((data, context) => {
    if (data.image && !data.imageAlt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imageAlt"],
        message: "imageAlt is required when image is provided.",
      });
    }

    if ((data.imageAvif || data.imageWebp || data.socialImage) && !data.image) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["image"],
        message: "image is required when optimized or social image variants are provided.",
      });
    }
  }),
});

export const collections = { blog };

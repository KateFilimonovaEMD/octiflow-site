import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(10).max(70),
    description: z.string().min(50).max(160),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("EvaMariaDreams"),
    category: z.string().min(2),
    tags: z.array(z.string()).min(1),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
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
  }),
});

export const collections = { blog };

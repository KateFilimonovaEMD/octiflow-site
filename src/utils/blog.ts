import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export const isPublished = (post: BlogPost) =>
  !post.data.draft && post.data.publishDate <= new Date();

export const sortPosts = (posts: BlogPost[]) =>
  [...posts].sort(
    (a, b) =>
      b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );

export const postUrl = (post: BlogPost | string) =>
  `/blog/${typeof post === "string" ? post : post.id}.html`;

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);

export const readingTime = (body: string | undefined) => {
  const words = (body ?? "")
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
};

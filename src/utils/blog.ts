import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export const BLOG_TOPICS = [
  "Hydration Basics",
  "Habits & Tracking",
  "Health & Safety",
  "Exercise & Environment",
  "Sleep & Wellness",
] as const;


export const isPublished = (post: BlogPost) =>
  !post.data.draft && post.data.publishDate <= new Date();

export const sortPosts = (posts: BlogPost[]) =>
  [...posts].sort((a, b) => {
    const byDate = b.data.publishDate.getTime() - a.data.publishDate.getTime();
    if (byDate !== 0) return byDate;
    return a.data.title.localeCompare(b.data.title, "en");
  });

export const postUrl = (post: BlogPost | string) =>
  `/blog/${typeof post === "string" ? post : post.id}/`;

export const topicSlug = (topic: string) =>
  topic
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const topicUrl = (topic: string) => `/blog/?topic=${topicSlug(topic)}#guides`;

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);

export const wordCount = (body: string | undefined) =>
  (body ?? "")
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export const readingTime = (body: string | undefined) =>
  Math.max(1, Math.ceil(wordCount(body) / 220));

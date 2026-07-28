import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://octiflow.app",
  trailingSlash: "never",
  build: {
    format: "directory",
  },
  integrations: [
    mdx(),
    sitemap(),
  ],
});

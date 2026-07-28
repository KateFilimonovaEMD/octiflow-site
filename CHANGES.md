# Blog scaffold changes

## Added

- `astro.config.mjs`
- `package.json`
- `tsconfig.json`
- `BLOG-GUIDE.md`
- `CHANGES.md`
- `src/content.config.ts`
- `src/content/blog/article-template.md`
- `src/utils/blog.ts`
- `src/layouts/BaseLayout.astro`
- `src/layouts/ArticleLayout.astro`
- `src/components/blog/ArticleCard.astro`
- `src/components/blog/ArticleCta.astro`
- `src/components/blog/RelatedArticles.astro`
- `src/pages/blog.astro`
- `src/pages/blog/[id].astro`
- `src/pages/rss.xml.js`

## Changed

- `src/layouts/ContentLayout.astro`: now uses the shared HTML/SEO shell in
  `BaseLayout.astro`; page markup and legal content are unchanged.
- `src/components/SiteFooter.astro`: added the Blog link.
- `src/styles/site.css`: added isolated blog and article styles.
- `src/pages/contact.astro`: added an explicit empty TOC type for strict
  TypeScript validation; rendered content is unchanged.
- `src/pages/support.astro`: added an explicit empty TOC type for strict
  TypeScript validation; rendered content is unchanged.

## Not changed

- `src/pages/privacy.astro`
- `src/pages/terms.astro`
- `src/components/SiteHeader.astro`
- `src/scripts/site.js`

## Delete

- Nothing.

## Dependency changes

- Added `@astrojs/mdx`
- Added `@astrojs/rss`
- Added `@astrojs/sitemap`
- Added `@astrojs/check` and TypeScript for validation

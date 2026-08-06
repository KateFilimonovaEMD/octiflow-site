# Octi Flow website

Marketing, support, legal, and blog website for [Octi Flow](https://octiflow.app), built with Astro.

## Requirements

- Node.js 22.12 or newer
- npm

## Commands

```bash
npm ci
npm run dev
npm run audit:styles
npm run check
npm run build
npm run preview
```

## Project structure

- `src/pages` - site routes
- `src/layouts` - shared page shells
- `src/components` - reusable UI and blog components
- `src/content/blog` - Markdown articles
- `src/styles` - tokens, shared components, content styles, and page-specific layout
- `public` - images, video, icons, redirects, and security headers

See `CSS-STRUCTURE.md` for the stylesheet architecture and `BLOG-GUIDE.md` for publishing articles.

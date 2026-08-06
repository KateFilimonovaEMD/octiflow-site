# Project rules

- Preserve legal text unless a legal-content change is explicitly requested.
- Preserve the current visual output during structural refactors.
- Prefer tokens and shared classes from `src/styles/core` and `src/styles/components` before adding page-specific CSS.
- Keep page-specific CSS for geometry, responsive layout, and unique art direction.
- Use `StoreBadges.astro` instead of copying store-badge markup.
- Run `npm run audit:styles`, `npm run check`, and `npm run build` before publishing structural changes.

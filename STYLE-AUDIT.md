# Style audit

## Scope

The complete Astro project was checked, including every `.astro`, `.js`, `.ts`, and CSS file under `src/`.

## Problems found in the uploaded project

- The main stylesheet had grown to more than 4,800 lines before cleanup.
- Typography was repeated in page-specific selectors for Home, Blog, About, Support, Contact, legal pages, and article layouts.
- Visually identical kicker/title/lead combinations used unrelated classes and unrelated margins.
- Several sets of app-store badge markup and styling existed instead of one component.
- Old product-page CSS remained although the corresponding page no longer existed.
- Repeated image resets, grid declarations, action rows, SVG rules, gradient backgrounds, and card typography were defined under different names.
- The stylesheet referenced `Inter` conceptually in earlier iterations, but no font file or provider actually loaded it. Browsers therefore fell back inconsistently to system fonts.
- An inline `<style>` block remained inside `about.astro` for a grid already handled elsewhere.

## Refactor completed

- Added a cascade-layered design system with one actual font stack and semantic type roles.
- Moved all shared typography and spacing into `design-system.css`.
- Standardized heading-group spacing across the project.
- Replaced repeated store badge markup with `StoreBadges.astro`.
- Reused universal button, link, grid, card, media, icon, metadata, and gradient-section primitives.
- Removed obsolete product/flow CSS classes and dead rules.
- Removed the inline About stylesheet.
- Replaced element-based heading selectors with semantic class selectors.
- Added `scripts/audit-styles.mjs` and connected it to the build command.
- Consolidated About and Home decorative orbit rules into one shared primitive.
- Replaced page-specific section-heading, stacked-action, and responsive store-badge classes with shared modifiers.
- Centralized gradient page-title treatment instead of decorating semantic title roles in page CSS.
- Removed the second reduced-motion reset that duplicated the global accessibility rule.

## Final static audit result

- Unused CSS classes: **0**
- Duplicate selectors in the same cascade context: **0**
- Repeated declaration blocks in the same cascade context: **0**
- Semantic typography overrides in component CSS: **0**
- Element-based heading typography outside article prose: **0**
- Component-level font-family declarations: **0**
- Exact declaration blocks of four or more properties across files/contexts: **0**
- Inline `<style>` blocks and `style` attributes: **0**
- Raw store-badge markup outside the shared component: **0**

`site.css` was reduced from roughly 4,882 lines to 2,784 lines. Shared rules now live in `design-system.css` rather than being copied into each page section. The final static audit covers 557 CSS rules and 241 used classes.

## Build verification

The style audit passes locally with Node. A full Astro dependency install could not be completed in the provided environment because its internal npm mirror returns `404` for `zwitch@2.0.4`. This is an environment registry failure, not a project source error.

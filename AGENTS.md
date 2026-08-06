## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## CSS architecture

Before adding or changing site styles, read `STYLE-SYSTEM.md` and run `npm run audit:styles`. Shared typography, spacing, buttons, badges, grids, media resets, and card-copy rules belong in `design-system.css`; `site.css` is reserved for component-specific layout and visuals.


### Shared style primitives

Use `.section-heading`, `.action-stack`, `.decorative-orb-section`, `.store-badges--responsive-center`, and the other primitives documented in `STYLE-SYSTEM.md` before adding a page-specific equivalent. `npm run audit:styles` must pass before committing.

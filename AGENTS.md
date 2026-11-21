# ndigo-site — Agent Guidelines

Marketing site and documentation for Ndigo (`ndigo.dev`). Astro + Starlight.

## Commands

```bash
npm run sync          # sync content from the ndigo monorepo
npm run dev           # sync + astro dev
npm run build         # sync + check + astro build
npm run check:concepts # validate concept pages
```

Override the source repo with `NDIGO_REPO=/path/to/ndigo`.

## Conventions

- Synced files (`src/content/docs/guides/`, `concepts/`, `reference/`,
  `ui/`, `src/styles/ndigo-*.css`) are gitignored and regenerated — never
  edit by hand.
- Hand-authored pages (`index.mdx`, `get-started.mdx`, `*-index.mdx`,
  `packages.mdx`) are committed.
- Brand tokens live in `src/styles/tokens.css` (synced from `@ndigo/ui`).
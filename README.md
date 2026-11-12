# ndigo-site

Marketing site and documentation for [Ndigo](https://ndigo.dev) — a TypeScript
framework for the web.

## Stack

- **Astro** + **Starlight** (static, MDX, search, sidebar, i18n-ready)
- **Mermaid** diagrams rendered client-side (`astro-mermaid`)
- **Internal link validation** at build time (`starlight-links-validator`)
- **Brand theme**: dark-first, indigo → violet gradient, Michroma wordmark,
  Inter headings, Fira Code for code. Tokens in `src/styles/tokens.css`.
- **Hosting**: Cloudflare Pages (unlimited bandwidth, free custom domain + SSL).
  Domain registered with Squarespace; DNS points at Cloudflare Pages.

## Commands

```bash
npm install          # install deps
npm run dev          # local dev server
npm run sync         # pull docs and the UI registry from the ndigo monorepo (../ndigo)
npm run check:concepts # guard generated Concepts pages against internal refs
npm run build        # sync + check + build static site -> dist/
npm run preview      # preview the built site
```

## Content sync

Documentation source of truth lives in the `ndigo` monorepo (`docs/`,
`ARCHITECTURE.md`, `STYLE_GUIDE.md`, `CHANGELOG.md`). `npm run sync` (also runs
as part of `npm run build`) copies and normalizes that content into
`src/content/docs/` (gitignored).

Concepts is a flat section: `ARCHITECTURE.md` becomes Architecture Overview,
`STYLE_GUIDE.md` becomes Style Guide, and each `docs/architecture/*.md` page
becomes its own `/concepts/<slug>/` page. The sync adds the title and
description frontmatter, while `check:concepts` fails the build if an ADR ID or
a link to the private framework repo leaks into the generated pages.

`npm run sync:registry` builds the shadcn channel in `public/r/` from
`packages/ndigo-ui/registry.json` and generates the `/ui` catalogue into
`src/content/docs/ui/`. Both outputs are gitignored; the canonical registry
stays in the ndigo repo.

Override the source repo path with `NDIGO_REPO=/path/to/ndigo npm run sync`.
For local channel testing, set `NDIGO_REGISTRY_BASE=http://127.0.0.1:4321/r`
before `npm run sync:registry` so item dependencies resolve against the local
preview server.

## Brand assets

- `public/brand/ndigo.svg` — logo mark (copy of `ndigo/assets/images/Ndigo.svg`).
- `public/fonts/michroma.*` — Michroma display typeface (moved from
  `ndigo/assets/fonts/`). OFL 1.1; see `public/fonts/OFL.txt`.
- `src/assets/ndigo.svg` — logo used by Starlight's header/hero.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to Cloudflare
Pages on push to `main`. Requires repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Custom domain `ndigo.dev` is configured in the Cloudflare Pages dashboard.

## Notes

- The CLI may use `{N}` as a terminal prompt/prefix glyph (brand mark) while
  printing the full name "Ndigo" in `--version` output. (Future enhancement.)
EOF
echo done
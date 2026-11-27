# AGENTS.md — ndigo-site

Astro + Starlight site for Ndigo. This repo owns presentation, navigation,
sync, and deployment; the documentation source of truth is the framework repo
at `../ndigo`.

Follow `../AGENTS.md` (workspace) for the issue/worktree/PR rules and
`../ndigo/AGENTS.md` when editing framework content. This file covers only the
site-specific traps.

## Commands

```bash
npm ci                  # after package-lock.json changes
npm run sync            # pull docs, UI registry, and standalone READMEs
npm run sync:external   # only ../create-ndigo-app + ../ndigo-skills
npm run check:concepts  # guard generated Concepts content
npm run build           # sync + check + astro build
npm run preview         # Astro 7 preview daemon
npx astro preview status|logs|stop
```

Testing against a framework worktree instead of the primary checkout:

```bash
NDIGO_REPO=/home/jeff/Workspace/ndigo-<issue>-<slug> npm run sync
NDIGO_REPO=/home/jeff/Workspace/ndigo-<issue>-<slug> npm run build
```

The standalone sources default to sibling checkouts. Override them the same way:

```bash
CREATE_NDIGO_APP_REPO=/path/to/create-ndigo-app \
NDIGO_SKILLS_REPO=/path/to/ndigo-skills npm run sync:external
```

## Generated content — never edit these

`npm run sync` overwrites them:

- `src/content/docs/guides/*.md`
- `src/content/docs/concepts/*.md`
- `src/content/docs/reference/changelog.md` and `contributing.md`
- `src/content/docs/reference/packages.mdx`
- `src/content/docs/reference/scaffolding.md` and `skills.md`
- `src/content/docs/examples.mdx`
- `src/content/docs/ui/index.md` and `src/content/docs/ui/<item>.md`
- `public/r/`
- `src/styles/ndigo-tokens.css`, `ndigo-base.css`, `ndigo-components.css`

Hand-authored pages are `src/content/docs/index.mdx`, `get-started.mdx`,
`concepts/index.mdx`, `guides/index.mdx`, and `ui/demo.mdx`.

## Source-of-truth map

| Site file | Framework source |
| :--- | :--- |
| `concepts/architecture-overview.md` | `ARCHITECTURE.md` |
| `concepts/style-guide.md` | `STYLE_GUIDE.md` |
| `concepts/environment.md` | `docs/architecture/environment.md` |
| `concepts/lifecycle-and-ownership.md` | `docs/architecture/lifecycle-and-ownership.md` |
| `concepts/micro-frontends.md` | `docs/architecture/micro-frontends.md` |
| `concepts/security.md` | `docs/architecture/security.md` |
| `guides/NN-*.md` | `docs/guides/NN-*.md` |
| `reference/changelog.md` | `CHANGELOG.md` |
| `reference/contributing.md` | `CONTRIBUTING.md` |
| `reference/packages.mdx` | `packages/*/package.json` + standalone repo manifests |
| `reference/scaffolding.md` | `../create-ndigo-app/README.md` |
| `reference/skills.md` | `../ndigo-skills/README.md` + `*/SKILL.md` |
| `examples.mdx` | `apps/*/README.md` |
| `ui/*.md`, `public/r/` | `packages/ndigo-ui/registry.json` |

Concepts is a flat section. Its page list, titles, and descriptions live in
`scripts/concept-pages.mjs` (`CONCEPT_PAGES`), shared by the content sync and
the sidebar config; add or reorder pages there.

Guides are grouped for navigation in `scripts/guide-groups.mjs`
(`GUIDE_GROUPS`), shared by the All Guides index and the Guides sidebar; add or
reorder guides there. `npm run check:guide-groups` fails when a synced guide is
missing from the groups, or a group entry has no page.

## Content rules

- No `AD-##` IDs, `P0`/`D6` phase tags, `SEC-*` IDs, commit hashes, or links
  to `docs/decisions|plans|audits|reference` in published pages.
  `check:concepts` enforces this for Concepts.
- Do not link to `github.com/ndigo/ndigo` in generated Concepts content; the
  framework repo is private. Use on-site links instead.
- Internal links are root-relative with a trailing slash. The Starlight link
  validator checks pages and anchors at build time, so a heading rename can
  break the build.
- Hand-authored pages that use imports or Starlight components must be
  `.mdx`; plain `.md` renders the import as text.
- Keep Concepts headings Title Case with no parenthetical filler (see
  `docs/architecture/*.md` for the current style).

## Deployment

- GitHub Actions (`.github/workflows/deploy.yml`) checks out `ndigo-site`,
  `ndigo`, `create-ndigo-app`, and `ndigo-skills`, builds, runs
  `check:concepts`, and uploads `dist` with `wrangler pages deploy`.
- The Cloudflare Pages project is **`ndigo-site`**, Direct Upload. Do not
  enable Cloudflare's Git integration: its build only clones `ndigo-site`, so
  `sync-content` and `sync-external` fail on the missing sibling checkouts.
- The standalone repos are public and need no token; `NDIGO_REPO_TOKEN` is for
  the framework repo. Paths are passed through `NDIGO_REPO`,
  `CREATE_NDIGO_APP_REPO`, and `NDIGO_SKILLS_REPO`.
- Required repo secrets: `NDIGO_REPO_TOKEN`, `CLOUDFLARE_API_TOKEN`,
  `CLOUDFLARE_ACCOUNT_ID`.
- `wrangler.toml` is Pages-only (`pages_build_output_dir`). Switching to a
  Worker requires migrating `deploy.yml` too.
- Merge framework content before a site change that depends on new anchors or
  links.

## Local visual checks

`firefox-cli` is installed locally in `.agents/skills/firefox-cli` (gitignored)
and talks to the user's Firefox session:

```bash
firefox-cli doctor
firefox-cli open http://127.0.0.1:4321/
firefox-cli snapshot -i
firefox-cli screenshot /tmp/page.png
```

Astro 7 runs `preview` as a background daemon; `npm run preview` reuses it.

## Workflow

- Issue first: one issue = one branch = one worktree = one PR.
- Worktree: `../ndigo-site-<issue>-<slug>`; branch `type/N-slug`; run
  `npm ci` once in the new tree.
- Skills live in `.agents/` with `skills-lock.json`, both gitignored. Install
  with `npx skills add <owner/repo@skill>`; do not commit them unless the
  policy changes.
- Squash-merge; delete the branch and remove the worktree afterwards.

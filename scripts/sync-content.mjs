#!/usr/bin/env node
/**
 * Syncs publishable documentation from the ndigo monorepo into this site.
 *
 * Usage: npm run sync  (or: node scripts/sync-content.mjs)
 * Override source repo: NDIGO_REPO=/path/to/ndigo npm run sync
 *
 * Only content suitable for a public docs site is synced:
 *   - guides/              <- docs/guides/NN-*.md (numbered guides)
 *   - concepts/            <- ARCHITECTURE.md, STYLE_GUIDE.md, docs/architecture/*
 *   - migrations/          <- docs/migrations/*
 *   - reference/           <- CHANGELOG.md, CONTRIBUTING.md
 *
 * Internal docs (plans, audits, decisions, docs/reference) are intentionally
 * NOT synced — they stay in the framework repo. Synced files are gitignored;
 * hand-authored pages (index.mdx, get-started.md, *-index.mdx) are committed.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = process.env.NDIGO_REPO || join(ROOT, '..', 'ndigo');
const DOCS = join(ROOT, 'src', 'content', 'docs');

/**
 * The public Concepts pages. The four architecture topics are flattened into
 * concepts/ so the site has one shallow section; `title` overrides the source
 * H1 where the repo title is longer than a navigation label should be.
 */
const CONCEPT_PAGES = [
    {
        src: 'ARCHITECTURE.md',
        dest: 'architecture-overview.md',
        title: 'Architecture Overview',
        description: 'Layers, principles, package map, and design patterns.',
    },
    {
        src: 'docs/architecture/environment.md',
        dest: 'environment.md',
        title: 'Environment & Configuration',
        description: 'Configuration precedence, profiles, typed binding, and fail-loud validation.',
    },
    {
        src: 'docs/architecture/lifecycle-and-ownership.md',
        dest: 'lifecycle-and-ownership.md',
        title: 'Lifecycle & Ownership',
        description: 'Initialization, shutdown, and who owns each resource.',
    },
    {
        src: 'docs/architecture/micro-frontends.md',
        dest: 'micro-frontends.md',
        title: 'Micro Frontends',
        description: 'Hosted feature contexts, islands, and the boundaries between them.',
    },
    {
        src: 'docs/architecture/security.md',
        dest: 'security.md',
        title: 'Security',
        description: 'Trust boundaries and the defense layers that protect an application.',
    },
    {
        src: 'STYLE_GUIDE.md',
        dest: 'style-guide.md',
        title: 'Style Guide',
        description: 'Naming, formatting, and code organization conventions.',
    },
];

function ensureDir(p) { mkdirSync(p, { recursive: true }); }

function hasFrontmatter(text) { return /^---\s*\n/.test(text); }

function titleFrom(text, fallback) {
    const m = text.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : fallback;
}

function injectFrontmatter(text, fallbackTitle, extra = {}, titleOverride = '') {
    if (hasFrontmatter(text)) return text;
    const rawTitle = titleFrom(text, fallbackTitle);
    // Guides use "Guide NN — Title"; split so the number becomes a small label
    // and the title stays short enough to fit on one line.
    const guideMatch = rawTitle.match(/^Guide\s+(\d+)\s*[—–-]\s*(.+)$/);
    const title = titleOverride || (guideMatch ? guideMatch[2].trim() : rawTitle);
    const guideLabel = guideMatch ? `Guide ${guideMatch[1]}` : '';
    // Strip the first H1 from the body so the title is not rendered twice
    // (Starlight renders the frontmatter title as the page H1).
    let body = text.replace(/^#\s+[^\n]*\n+/, '');
    if (guideLabel) {
        body = `<p class="guide-label">${guideLabel}</p>\n\n` + body;
    }
    const lines = ['---', `title: ${JSON.stringify(title)}`];
    for (const [k, v] of Object.entries(extra)) {
        lines.push(`${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`);
    }
    lines.push('---', '');
    return lines.join('\n') + body;
}

function rewriteLinks(text) {
    const replacements = [
        // Repo-root documents.
        [/\.\.\/\.\.\/ARCHITECTURE\.md/g, '/concepts/architecture-overview/'],
        [/\.\.\/ARCHITECTURE\.md/g, '/concepts/architecture-overview/'],
        [/\.\.\/\.\.\/STYLE_GUIDE\.md/g, '/concepts/style-guide/'],
        [/\.\.\/STYLE_GUIDE\.md/g, '/concepts/style-guide/'],
        [/\.\.\/\.\.\/CONTRIBUTING\.md/g, '/reference/contributing/'],
        [/\.\.\/CONTRIBUTING\.md/g, '/reference/contributing/'],
        [/\.\.\/\.\.\/CHANGELOG\.md/g, '/reference/changelog/'],
        [/\.\.\/CHANGELOG\.md/g, '/reference/changelog/'],
        [/\.\.\/\.\.\/API\.md/g, 'https://github.com/ndigo/ndigo/blob/main/API.md'],
        [/\.\.\/API\.md/g, 'https://github.com/ndigo/ndigo/blob/main/API.md'],
        [/\.\.\/\.\.\/BENCHMARKS\.md/g, 'https://github.com/ndigo/ndigo/blob/main/BENCHMARKS.md'],
        [/\.\.\/BENCHMARKS\.md/g, 'https://github.com/ndigo/ndigo/blob/main/BENCHMARKS.md'],
        [/\]\(BENCHMARKS\.md(#[^)]*)?\)/g, '](https://github.com/ndigo/ndigo/blob/main/BENCHMARKS.md$1)'],
        [/\.\/ARCHITECTURE\.md/g, '/concepts/architecture-overview/'],
        [/\.\/STYLE_GUIDE\.md/g, '/concepts/style-guide/'],
        [/\.\/CONTRIBUTING\.md/g, '/reference/contributing/'],
        [/\.\/CHANGELOG\.md/g, '/reference/changelog/'],
        [/\.\/API\.md/g, 'https://github.com/ndigo/ndigo/blob/main/API.md'],
        [/\.\/README\.md/g, '/'],
        // Internal indexes: keep the path on GitHub for contributors reading
        // the repo, not for visitors (decision docs are not published).
        [/\.\/docs\/decisions\/README\.md/g, 'https://github.com/ndigo/ndigo/blob/main/docs/decisions/README.md'],
        [/docs\/decisions\/README\.md/g, 'https://github.com/ndigo/ndigo/blob/main/docs/decisions/README.md'],
        [/docs\/guides\/README\.md/g, '/guides/00-core-concepts/'],
        [/src\/oxlint\/README\.md/g, 'https://github.com/ndigo/ndigo/blob/main/src/oxlint/README.md'],
        [/tools\/generators\/README\.md/g, 'https://github.com/ndigo/ndigo/blob/main/tools/generators/README.md'],
    ];
    for (const [re, to] of replacements) {
        text = text.replace(re, to);
    }
    // Guide-to-guide links: ](NN-slug.md), ](./NN-slug.md), ../guides/NN-slug.md,
    // and ../../docs/guides/NN-slug.md all become /guides/NN-slug/.
    text = text.replace(/\]\((?:\.\.\/)*(?:\.\/)?(?:docs\/)?guides\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g, (m, slug, hash) => {
        return `](/guides/${slug}/${hash || ''})`;
    });
    text = text.replace(/\]\((\.\/)?(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g, (m, dot, slug, hash) => {
        return `](/guides/${slug}/${hash || ''})`;
    });
    // Architecture topics are flattened into concepts/.
    text = text.replace(/\]\((?:\.\.\/)*(?:\.\/)?(?:docs\/)?architecture\/([a-z0-9-]+)\.md(#[^)]*)?\)/g, (m, name, hash) => {
        return `](/concepts/${name}/${hash || ''})`;
    });
    // Rewrite ./docs/README.md
    text = text.replace(/\]\((\.\/)?docs\/README\.md\)/g, '](/reference/contributing/)');
    // Rewrite any remaining docs/...md links to GitHub
    text = text.replace(/\]\((docs\/[A-Za-z0-9_./-]+\.md)(#[^)]*)?\)/g, (m, path, hash) => {
        const h = hash || '';
        return `](https://github.com/ndigo/ndigo/blob/main/${path}${h})`;
    });
    // Generic fallback: rewrite any remaining relative .md links to GitHub
    text = text.replace(/\]\((\.\.\/)+([^)]+\.md)(#[^)]*)?\)/g, (m, dots, path, hash) => {
        const h = hash || '';
        return `](https://github.com/ndigo/ndigo/blob/main/${path}${h})`;
    });
    // Non-markdown repo assets (schemas, generated data) live on GitHub.
    text = text.replace(/\]\((?:\.\.\/)+(packages|scripts|apps|agent-local)\/([^)\s]+)\)/g, (m, dir, path) => {
        return `](https://github.com/ndigo/ndigo/blob/main/${dir}/${path})`;
    });
    return text;
}

function copyMd(srcFile, destFile, extra = {}, titleOverride = '') {
    ensureDir(join(destFile, '..'));
    const raw = readFileSync(srcFile, 'utf8');
    const fallback = basename(srcFile, extname(srcFile));
    const rewritten = rewriteLinks(raw);
    writeFileSync(destFile, injectFrontmatter(rewritten, fallback, extra, titleOverride), 'utf8');
}

function cleanDir(p) {
    try { rmSync(p, { recursive: true, force: true }); } catch {}
    ensureDir(p);
}

function syncGuides() {
    const srcDir = join(REPO, 'docs', 'guides');
    const destDir = join(DOCS, 'guides');
    // Remove previously synced numbered guides (keep hand-authored files).
    for (const f of readdirSync(destDir)) {
        if (/^\d{2,}-/.test(f)) rmSync(join(destDir, f), { force: true });
    }
    for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        if (!/^\d{2,}-.*\.md$/.test(entry.name)) continue; // skip README etc.
        const srcPath = join(srcDir, entry.name);
        const raw = readFileSync(srcPath, 'utf8');
        if (raw.includes('<!-- guide-redirect -->')) continue; // skip redirect stubs
        const m = entry.name.match(/^(\d+)-/);
        const order = m ? parseInt(m[1], 10) : undefined;
        copyMd(srcPath, join(destDir, entry.name), order ? { order } : {});
    }
    console.log('  synced guides');
}

function syncConcepts() {
    const destDir = join(DOCS, 'concepts');
    ensureDir(destDir);
    // Every .md in concepts/ is generated; index.mdx is hand-authored.
    for (const f of readdirSync(destDir)) {
        if (f.endsWith('.md')) rmSync(join(destDir, f), { force: true });
    }
    // Remove the old subfolder layout from earlier syncs.
    rmSync(join(destDir, 'architecture'), { recursive: true, force: true });

    for (const page of CONCEPT_PAGES) {
        const src = join(REPO, page.src);
        try {
            if (!statSync(src).isFile()) continue;
            copyMd(src, join(destDir, page.dest), { description: page.description }, page.title);
        } catch {
            console.warn(`  skipped missing concept: ${page.src}`);
        }
    }
    console.log('  synced concepts');
}

function syncReferenceTopLevel() {
    const pairs = [
        ['CHANGELOG.md', join(DOCS, 'reference', 'changelog.md')],
        ['CONTRIBUTING.md', join(DOCS, 'reference', 'contributing.md')],
    ];
    for (const [name, dest] of pairs) {
        try {
            if (statSync(join(REPO, name)).isFile()) copyMd(join(REPO, name), dest);
        } catch { /* skip missing */ }
    }
    console.log('  synced reference docs');
}

function syncTokens() {
    const pairs = [
        ['packages/ndigo-ui/tokens/ndigo-tokens.css', join(ROOT, 'src', 'styles', 'ndigo-tokens.css')],
        ['packages/ndigo-ui/theme/base.css', join(ROOT, 'src', 'styles', 'ndigo-base.css')],
    ];
    for (const [relSrc, dest] of pairs) {
        const src = join(REPO, relSrc);
        try {
            if (statSync(src).isFile()) {
                ensureDir(join(dest, '..'));
                writeFileSync(dest, readFileSync(src, 'utf8'), 'utf8');
            }
        } catch { /* skip missing */ }
    }
    console.log('  synced tokens');
}

function syncPackages() {
    const pkgsDir = join(REPO, 'packages');
    const dirs = readdirSync(pkgsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort();
    const cards = [];
    for (const dir of dirs) {
        let meta = {};
        try { meta = JSON.parse(readFileSync(join(pkgsDir, dir, 'package.json'), 'utf8')); }
        catch { continue; }
        if (!meta.name) continue;
        const desc = (meta.description || '').replace(/\s+/g, ' ').trim();
        const short = desc.length > 140 ? desc.slice(0, 137) + '...' : desc;
        cards.push(`\t<Card title="${meta.name}" icon="seti:typescript" href="https://github.com/ndigo/ndigo/tree/main/packages/${dir}">\n\t\t${short}\n\t</Card>`);
    }
    const body = [
        '---',
        'title: Packages',
        'description: Ndigo package index.',
        '---',
        '',
        "import { Card, CardGrid } from '@astrojs/starlight/components';",
        '',
        'Ndigo is a monorepo of focused packages. Add only what your app needs.',
        '',
        '<CardGrid>',
        cards.join('\n'),
        '</CardGrid>',
        '',
        '> Generated API reference (TypeDoc) is published per package under',
        '> `packages/<name>/api/` in the framework repo.',
        '',
    ].join('\n');
    ensureDir(join(DOCS, 'reference'));
    writeFileSync(join(DOCS, 'reference', 'packages.mdx'), body, 'utf8');
    console.log('  synced packages');
}

function syncExamples() {
    const appsDir = join(REPO, 'apps');
    const dirs = readdirSync(appsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
        .map((e) => e.name)
        .sort();
    const cards = [];
    for (const dir of dirs) {
        const readmePath = join(appsDir, dir, 'README.md');
        let title = dir;
        let desc = '';
        try {
            const raw = readFileSync(readmePath, 'utf8');
            const h1 = raw.match(/^#\s+(.+)$/m);
            if (h1) title = h1[1].trim();
            const bq = raw.match(/^>\s*(.+)$/m);
            if (bq) desc = bq[1].trim();
            else {
                const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
                const idx = lines.findIndex((l) => l.startsWith('#'));
                if (idx >= 0 && lines[idx + 1]) desc = lines[idx + 1];
            }
        } catch { /* skip */ }
        const short = desc.length > 140 ? desc.slice(0, 137) + '...' : desc;
        cards.push(`\t<Card title="${title}" icon="rocket" href="https://github.com/ndigo/ndigo/tree/main/apps/${dir}">\n\t\t${short}\n\t</Card>`);
    }
    const body = [
        '---',
        'title: Examples',
        'description: Demo applications built with Ndigo.',
        '---',
        '',
        "import { Card, CardGrid } from '@astrojs/starlight/components';",
        '',
        'The `apps/` directory in the framework repo contains runnable demos covering',
        'every major feature. Use them as starting templates.',
        '',
        '<CardGrid>',
        cards.join('\n'),
        '</CardGrid>',
        '',
    ].join('\n');
    writeFileSync(join(DOCS, 'examples.mdx'), body, 'utf8');
    console.log('  synced examples');
}

// Remove legacy synced/ dump from Phase 1
try { rmSync(join(DOCS, 'synced'), { recursive: true, force: true }); } catch {}

ensureDir(join(DOCS, 'guides'));
ensureDir(join(DOCS, 'concepts'));
ensureDir(join(DOCS, 'reference'));

syncGuides();
syncConcepts();
syncReferenceTopLevel();
syncTokens();
syncPackages();
syncExamples();

console.log(`Synced publishable content from ${REPO}`);

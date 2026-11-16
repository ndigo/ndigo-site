#!/usr/bin/env node
/**
 * Syncs generated Ndigo API reference (TypeDoc markdown) into the site.
 *
 * Usage: node scripts/sync-api.mjs
 * Override source repo: NDIGO_REPO=/path/to/ndigo
 *
 * Expects `pnpm doc:api` to have run in the framework repo so that
 * `packages/<pkg>/api/` exists. In CI this is a build step.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = process.env.NDIGO_REPO || join(ROOT, '..', 'ndigo');
const PACKAGES = join(REPO, 'packages');
const DEST = join(ROOT, 'src', 'content', 'docs', 'reference', 'api');

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(full));
        else out.push(full);
    }
    return out;
}

function titleFor(filePath, content) {
    const m = content.match(/^#\s+(.+)$/m);
    if (m) return m[1].trim().replace(/[*_`]/g, '');
    return filePath.split('/').pop().replace(/\.md$/, '');
}

function injectFrontmatter(content, title) {
    if (content.startsWith('---\n')) return content;
    return `---\ntitle: ${JSON.stringify(title)}\n---\n\n${content}`;
}

// Clean destination.
rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

// If no API docs have been generated yet, generate them (requires a framework build).
const hasApi = readdirSync(PACKAGES).some((dir) => existsSync(join(PACKAGES, dir, 'api')));
if (!hasApi) {
    console.log('  no API docs found — running pnpm doc:api in framework repo...');
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync('pnpm', ['doc:api'], { cwd: REPO, stdio: 'inherit', shell: true });
    if (r.status !== 0) {
        console.error('  doc:api failed; skipping API sync.');
        process.exit(0);
    }
}

const packages = readdirSync(PACKAGES)
    .filter((dir) => existsSync(join(PACKAGES, dir, 'api')))
    .sort();

for (const dir of packages) {
    const srcApi = join(PACKAGES, dir, 'api');
    const destApi = join(DEST, dir);
    mkdirSync(destApi, { recursive: true });
    for (const file of walk(srcApi)) {
        const rel = relative(srcApi, file);
        const destFile = join(destApi, rel);
        mkdirSync(dirname(destFile), { recursive: true });
        let raw = readFileSync(file, 'utf8');
        // TypeDoc links to README.md; Astro serves directory indexes as index.md.
        raw = raw.replace(/README\.md/g, 'index.md');
        const title = titleFor(file, raw);
        const finalDest = destFile.endsWith('README.md')
            ? destFile.replace(/README\.md$/, 'index.md')
            : destFile;
        mkdirSync(dirname(finalDest), { recursive: true });
        writeFileSync(finalDest, injectFrontmatter(raw, title), 'utf8');
    }
}

// Generate index.
const indexLines = [
    '---',
    'title: "API reference"',
    'description: "Generated API reference for every Ndigo package."',
    'sidebar:',
    '  label: API reference',
    '  order: 99',
    '---',
    '',
    'Generated API reference for every Ndigo package. Pick a package to browse its modules, classes, functions, and types.',
    '',
];
for (const dir of packages) {
    const manifest = JSON.parse(readFileSync(join(PACKAGES, dir, 'package.json'), 'utf8'));
    indexLines.push(`- [${manifest.name}](/reference/api/${dir}/) — ${manifest.description ?? ''}`);
}
indexLines.push('');
writeFileSync(join(DEST, 'index.md'), indexLines.join('\n'), 'utf8');

console.log(`  synced API reference: ${packages.length} packages -> src/content/docs/reference/api`);
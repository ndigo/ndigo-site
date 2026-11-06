#!/usr/bin/env node
/**
 * Syncs publishable documentation from the ndigo monorepo into this site.
 *
 * Usage: npm run sync  (or: node scripts/sync-content.mjs)
 * Override source repo: NDIGO_REPO=/path/to/ndigo npm run sync
 *
 * Only content suitable for a public docs site is synced:
 *   - guides/              <- docs/guides/NN-*.md  (30 numbered guides)
 *   - concepts/            <- ARCHITECTURE.md, STYLE_GUIDE.md, docs/architecture/*
 *   - migrations/          <- docs/migrations/*
 *   - reference/           <- CHANGELOG.md, CONTRIBUTING.md
 *
 * Internal docs (plans, audits, decisions, docs/reference) are intentionally
 * NOT synced — they stay in the framework repo. Synced files are gitignored;
 * hand-authored pages (index.mdx, get-started.md, *-index.mdx) are committed.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = process.env.NDIGO_REPO || join(ROOT, '..', 'ndigo');
const DOCS = join(ROOT, 'src', 'content', 'docs');

function ensureDir(p) { mkdirSync(p, { recursive: true }); }

function hasFrontmatter(text) { return /^---\s*\n/.test(text); }

function titleFrom(text, fallback) {
    const m = text.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : fallback;
}

function injectFrontmatter(text, fallbackTitle, extra = {}) {
    if (hasFrontmatter(text)) return text;
    const title = titleFrom(text, fallbackTitle);
    const lines = ['---', `title: ${JSON.stringify(title)}`];
    for (const [k, v] of Object.entries(extra)) {
        lines.push(`${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`);
    }
    lines.push('---', '');
    return lines.join('\n') + text;
}

function copyMd(srcFile, destFile, extra = {}) {
    ensureDir(join(destFile, '..'));
    const raw = readFileSync(srcFile, 'utf8');
    const fallback = basename(srcFile, extname(srcFile));
    writeFileSync(destFile, injectFrontmatter(raw, fallback, extra), 'utf8');
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
        const m = entry.name.match(/^(\d+)-/);
        const order = m ? parseInt(m[1], 10) : undefined;
        copyMd(join(srcDir, entry.name), join(destDir, entry.name), order ? { order } : {});
    }
    console.log('  synced guides');
}

function syncTopLevel() {
    const pairs = [
        ['ARCHITECTURE.md', join(DOCS, 'concepts', 'architecture-overview.md')],
        ['STYLE_GUIDE.md', join(DOCS, 'concepts', 'style-guide.md')],
        ['CHANGELOG.md', join(DOCS, 'reference', 'changelog.md')],
        ['CONTRIBUTING.md', join(DOCS, 'reference', 'contributing.md')],
    ];
    for (const [name, dest] of pairs) {
        try {
            if (statSync(join(REPO, name)).isFile()) copyMd(join(REPO, name), dest);
        } catch { /* skip missing */ }
    }
    console.log('  synced top-level docs');
}

function syncArchitectureTopics() {
    const srcDir = join(REPO, 'docs', 'architecture');
    const destDir = join(DOCS, 'concepts', 'architecture');
    cleanDir(destDir);
    try {
        if (statSync(srcDir).isDirectory()) {
            for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
                if (entry.isFile() && entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'readme.md') {
                    copyMd(join(srcDir, entry.name), join(destDir, entry.name));
                }
            }
        }
    } catch { /* skip missing */ }
    console.log('  synced architecture topics');
}

function syncMigrations() {
    const srcDir = join(REPO, 'docs', 'migrations');
    const destDir = join(DOCS, 'migrations');
    cleanDir(destDir);
    try {
        if (statSync(srcDir).isDirectory()) {
            for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
                if (entry.isFile() && entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'readme.md') {
                    copyMd(join(srcDir, entry.name), join(destDir, entry.name));
                }
            }
        }
    } catch { /* skip missing */ }
    console.log('  synced migrations');
}

// Remove legacy synced/ dump from Phase 1
try { rmSync(join(DOCS, 'synced'), { recursive: true, force: true }); } catch {}

ensureDir(join(DOCS, 'guides'));
ensureDir(join(DOCS, 'concepts'));
ensureDir(join(DOCS, 'concepts', 'architecture'));
ensureDir(join(DOCS, 'migrations'));
ensureDir(join(DOCS, 'reference'));

syncGuides();
syncTopLevel();
syncArchitectureTopics();
syncMigrations();

console.log(`Synced publishable content from ${REPO}`);

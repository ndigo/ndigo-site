#!/usr/bin/env node
/**
 * Syncs documentation content from the ndigo monorepo into this site.
 *
 * Usage: npm run sync  (or: node scripts/sync-content.mjs)
 *
 * Source: ../ndigo (sibling directory). Override with NDIGO_REPO env var.
 *
 * Phase 1: copies top-level docs (ARCHITECTURE, STYLE_GUIDE, CHANGELOG) and
 * the docs/ tree into src/content/docs/synced/, injecting minimal frontmatter
 * where missing so Starlight's schema validates. Package READMEs and generated
 * API reference are wired in later phases.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = process.env.NDIGO_REPO || join(ROOT, '..', 'ndigo');
const OUT = join(ROOT, 'src', 'content', 'docs', 'synced');

function ensureDir(p) { mkdirSync(p, { recursive: true }); }

function hasFrontmatter(text) {
    return /^---\s*\n/.test(text);
}

function titleFrom(text, fallback) {
    const m = text.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : fallback;
}

function injectFrontmatter(text, fallbackTitle) {
    if (hasFrontmatter(text)) return text;
    const title = titleFrom(text, fallbackTitle);
    return `---\ntitle: ${JSON.stringify(title)}\n---\n\n${text}`;
}

function copyMd(srcFile, destFile) {
    ensureDir(join(destFile, '..'));
    const raw = readFileSync(srcFile, 'utf8');
    const fallback = basename(srcFile, extname(srcFile));
    const out = injectFrontmatter(raw, fallback);
    writeFileSync(destFile, out, 'utf8');
}

function walk(srcDir, destDir) {
    for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
        const s = join(srcDir, entry.name);
        const d = join(destDir, entry.name);
        if (entry.isDirectory()) {
            walk(s, d);
        } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
            copyMd(s, d);
        }
    }
}

// Reset output dir
try { rmSync(OUT, { recursive: true, force: true }); } catch {}
ensureDir(OUT);

// 1. Top-level docs
const topDocs = ['ARCHITECTURE.md', 'STYLE_GUIDE.md', 'CHANGELOG.md', 'CONTRIBUTING.md'];
for (const f of topDocs) {
    const src = join(REPO, f);
    try {
        if (statSync(src).isFile()) {
            copyMd(src, join(OUT, f.toLowerCase()));
        }
    } catch { /* skip missing */ }
}

// 2. docs/ tree (migrations, plans, reference, audits) -> synced/docs/
const docsDir = join(REPO, 'docs');
try {
    if (statSync(docsDir).isDirectory()) {
        walk(docsDir, join(OUT, 'docs'));
    }
} catch { /* skip missing */ }

console.log(`Synced content from ${REPO} -> ${relative(ROOT, OUT)}`);

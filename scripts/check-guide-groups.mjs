#!/usr/bin/env node
/**
 * Guide navigation coverage check.
 *
 * Verifies that the synced guides match the framework's guides.json manifest
 * exactly once, so the sidebar and All Guides index cannot silently omit a page.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GUIDE_GROUPS, GUIDES } from './guide-groups.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIR = join(ROOT, 'src', 'content', 'docs', 'guides');

const files = readdirSync(DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));

const seen = new Set();
const failures = [];

for (const guide of GUIDES) {
    if (seen.has(guide.slug)) failures.push(`duplicate guide: ${guide.slug}`);
    seen.add(guide.slug);
    if (!files.includes(guide.slug)) failures.push(`missing synced guide: ${guide.slug}`);
    // title check against synced frontmatter
    try {
        const raw = readFileSync(join(DIR, `${guide.slug}.md`), 'utf8');
        const m = raw.match(/^title:\s*"(.*)"$/m);
        if (m && m[1] !== guide.title) {
            failures.push(`title mismatch for ${guide.slug}: ${m[1]} != ${guide.title}`);
        }
    } catch { /* skip */ }
}

for (const file of files) {
    if (!seen.has(file)) failures.push(`guide not in navigation: ${file}`);
}

if (failures.length) {
    console.error('Guide navigation check failed:');
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
}

console.log(`guide navigation check: ${GUIDES.length} guides in ${GUIDE_GROUPS.length} groups — OK`);

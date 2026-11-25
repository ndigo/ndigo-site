#!/usr/bin/env node
/**
 * Guide navigation coverage check.
 *
 * Verifies that `scripts/guide-groups.mjs` includes every synced guide exactly
 * once, with a number matching its slug, so the sidebar and All Guides index
 * cannot silently omit a page.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GUIDE_GROUPS, GUIDES } from './guide-groups.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIR = join(ROOT, 'src', 'content', 'docs', 'guides');

const files = readdirSync(DIR)
    .filter((file) => /^\d{2}-.*\.md$/.test(file))
    .map((file) => file.replace(/\.md$/, ''));

const seen = new Set();
const failures = [];

for (const guide of GUIDES) {
    if (seen.has(guide.slug)) failures.push(`duplicate guide: ${guide.slug}`);
    seen.add(guide.slug);
    if (!guide.slug.startsWith(`${guide.number}-`)) {
        failures.push(`number/slug mismatch: ${guide.number} ${guide.slug}`);
    }
    if (!files.includes(guide.slug)) failures.push(`missing synced guide: ${guide.slug}`);
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

#!/usr/bin/env node
/**
 * Guards the generated Concepts pages against internal-only references.
 *
 * The framework repo is private, so ADR IDs, plan/audit links, and
 * github.com/ndigo/ndigo links are unreadable to visitors. Content fixes land
 * in the framework repo; this check fails the build if one leaks back in.
 *
 * Run after sync: npm run check:concepts
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../src/content/docs/concepts/', import.meta.url));

const checks = [
    [/\bAD-\d+\b/g, 'ADR reference (AD-##)'],
    [/\bSEC(?:-AUD\d+)?-\d+\b/g, 'security finding reference (SEC-#)'],
    [/\]\([^)]*docs\/(?:decisions|plans|audits|reference)\//g, 'link to internal docs'],
    [/\]\([^)]*github\.com\/ndigo\/ndigo/g, 'link to the private framework repo'],
];

const errors = [];

let entries = [];
try {
    entries = readdirSync(dir);
} catch {
    console.error('Concepts directory not found — run npm run sync first.');
    process.exit(1);
}

if (entries.includes('architecture')) {
    errors.push('concepts/architecture/ still exists — the section is flat now.');
}

for (const file of entries.filter((f) => f.endsWith('.md')).sort()) {
    const text = readFileSync(join(dir, file), 'utf8');
    for (const [re, label] of checks) {
        for (const match of text.matchAll(re)) {
            const line = text.slice(0, match.index).split('\n').length;
            errors.push(`${file}:${line}: ${label} — ${match[0].slice(0, 80)}`);
        }
    }
}

if (errors.length > 0) {
    console.error(`Concepts content check failed (${errors.length}):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
}

const pages = entries.filter((f) => f.endsWith('.md')).length;
console.log(`concepts content check: ${pages} pages — OK`);

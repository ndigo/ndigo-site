#!/usr/bin/env node
/**
 * Syncs the standalone repositories into Reference pages.
 *
 * Usage: npm run sync:external  (or: node scripts/sync-external.mjs)
 * Override sources:
 *   CREATE_NDIGO_APP_REPO=/path/to/create-ndigo-app
 *   NDIGO_SKILLS_REPO=/path/to/ndigo-skills
 *
 * Writes (gitignored):
 *   src/content/docs/reference/scaffolding.md  <- create-ndigo-app/README.md
 *   src/content/docs/reference/skills.md       <- ndigo-skills/README.md + <id>/SKILL.md
 *
 * Both repositories are canonical. This script only normalizes their README
 * content for the site; it fails when a checkout is missing so the sidebar
 * never links to a page that was not generated.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CREATE_NDIGO_APP, NDIGO_SKILLS } from './external-repos.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEST = join(ROOT, 'src', 'content', 'docs', 'reference');

let failed = false;

function fail(message) {
    console.error(`  ERROR ${message}`);
    failed = true;
}

function readRepoFile(repo, rel) {
    const path = join(repo.dir, rel);
    if (!existsSync(path)) {
        fail(`${repo.id} is missing ${rel} (expected at ${repo.dir})`);
        return null;
    }
    return readFileSync(path, 'utf8');
}

/** Removes the centered logo block both READMEs open with. */
function stripLeadingLogo(text) {
    return text.replace(/^<p align="center">[\s\S]*?<\/p>\s*/i, '');
}

function stripFirstH1(text) {
    return text.replace(/^#\s+[^\n]*\n+/, '');
}

/**
 * Rewrites relative README links. Known site pages win; everything else points
 * at the standalone repository so the generated page never has dead links.
 */
function rewriteLinks(text, repo, siteLinks = {}) {
    return text.replace(/\]\(([^)\s]+)\)/g, (match, href) => {
        if (/^(?:https?:|mailto:|#|\/)/i.test(href)) return match;
        const [path, hash] = href.split('#');
        if (siteLinks[path]) return `](${siteLinks[path]}${hash ? `#${hash}` : ''})`;
        const base = href.endsWith('/') ? 'tree' : 'blob';
        return `](${repo.repo}/${base}/main/${href})`;
    });
}

/** Replaces one level-two section, keeping the surrounding document. */
function replaceSection(markdown, heading, replacement) {
    const start = markdown.indexOf(heading);
    if (start === -1) return markdown;
    const rest = markdown.slice(start + heading.length);
    const next = rest.search(/^##\s/m);
    const end = next === -1 ? markdown.length : start + heading.length + next;
    return `${markdown.slice(0, start)}${replacement.trimEnd()}\n\n${markdown.slice(end)}`;
}

function injectFrontmatter(body, title, description) {
    return [
        '---',
        `title: ${JSON.stringify(title)}`,
        `description: ${JSON.stringify(description)}`,
        '---',
        '',
        body.trim(),
        '',
    ].join('\n');
}

function parseFrontmatter(text) {
    const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
    if (!match) return {};
    const data = {};
    for (const line of match[1].split('\n')) {
        const field = /^([A-Za-z-]+):\s*(.*)$/.exec(line);
        if (!field) continue;
        data[field[1]] = field[2].replace(/^["']|["']$/g, '').trim();
    }
    return data;
}

function skillRows() {
    return readdirSync(NDIGO_SKILLS.dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(NDIGO_SKILLS.dir, entry.name, 'SKILL.md')))
        .map((entry) => entry.name)
        .sort()
        .map((id) => {
            const text = readFileSync(join(NDIGO_SKILLS.dir, id, 'SKILL.md'), 'utf8');
            const meta = parseFrontmatter(text);
            const description = (meta.description || '').replace(/\|/g, '\\|');
            const pkg = meta.package ? `\`${meta.package}\`` : '—';
            return `| [\`${id}\`](${NDIGO_SKILLS.repo}/blob/main/${id}/SKILL.md) | ${description} | ${pkg} |`;
        });
}

function syncScaffolding() {
    const readme = readRepoFile(CREATE_NDIGO_APP, 'README.md');
    if (readme === null) return;

    let body = stripFirstH1(stripLeadingLogo(readme));
    const start = body.indexOf('## Installation');
    if (start !== -1) body = body.slice(start);
    // Maintainer-facing sections and the stale generated-API note stay in the
    // repository; the site page covers installation, usage, and the
    // design-system pointer.
    const cut = body.search(/^## (?:API|Development|Maintaining|Contributing|License)\s/m);
    if (cut !== -1) body = body.slice(0, cut);
    body = rewriteLinks(body, CREATE_NDIGO_APP, {
        '../../docs/guides/91-application-conventions.md': '/reference/contributing/application-conventions/',
    });

    body = body.trimEnd();
    body += [
        '',
        '',
        '## Source',
        '',
        `This page is generated from the [\`create-ndigo-app\` README](${CREATE_NDIGO_APP.repo}#readme).`,
        `For development and release history, see the [repository](${CREATE_NDIGO_APP.repo}).`,
        '',
    ].join('\n');

    writeFileSync(join(DEST, 'scaffolding.md'), injectFrontmatter(body, 'Scaffolding', CREATE_NDIGO_APP.description), 'utf8');
    console.log('  synced scaffolding');
}

function syncSkills() {
    const readme = readRepoFile(NDIGO_SKILLS, 'README.md');
    if (readme === null) return;

    let body = stripFirstH1(stripLeadingLogo(readme));
    const table = [
        '## Skills',
        '',
        "The table is generated from each skill's frontmatter.",
        '',
        '| Skill | What it does | Ships with |',
        '| :--- | :--- | :--- |',
        ...skillRows(),
    ].join('\n');
    body = replaceSection(body, '## Skills', table);
    body = rewriteLinks(body, NDIGO_SKILLS);

    body = body.trimEnd();
    body += [
        '',
        '',
        '## Source',
        '',
        `This page is generated from the [\`ndigo-skills\` README](${NDIGO_SKILLS.repo}#readme) and each skill's frontmatter.`,
        `Browse every skill in the [repository](${NDIGO_SKILLS.repo}).`,
        '',
    ].join('\n');

    writeFileSync(join(DEST, 'skills.md'), injectFrontmatter(body, 'Agent Skills', NDIGO_SKILLS.description), 'utf8');
    console.log('  synced agent skills');
}

mkdirSync(DEST, { recursive: true });
syncScaffolding();
syncSkills();

if (failed) {
    console.error('External repository sync failed; check the paths above.');
    process.exit(1);
}

console.log('Synced standalone repositories into Reference pages');

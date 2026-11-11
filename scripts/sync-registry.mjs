#!/usr/bin/env node
/**
 * Syncs the ndigo-ui registry into the public shadcn channel and the /ui catalogue.
 *
 * Usage: npm run sync:registry  (or: node scripts/sync-registry.mjs)
 * Override source repo: NDIGO_REPO=/path/to/ndigo npm run sync:registry
 *
 * Writes:
 *   public/r/registry.json          canonical registry index
 *   public/r/<item>.json            registry items with embedded file contents
 *   src/content/docs/ui/index.md    catalogue index
 *   src/content/docs/ui/<item>.md   one page per item
 *
 * The item payload mirrors `shadcn build`: file contents are embedded so
 * `npx shadcn add https://ndigo.dev/r/<item>.json` works from a static host.
 * Registry dependencies are rewritten to absolute URLs, because bare names
 * resolve against shadcn's default registry instead of this one.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = process.env.NDIGO_REPO || join(ROOT, '..', 'ndigo');
const UI_ROOT = join(REPO, 'packages', 'ndigo-ui');
const REGISTRY_PATH = join(UI_ROOT, 'registry.json');
const PUBLIC_R = join(ROOT, 'public', 'r');
const DOCS_UI = join(ROOT, 'src', 'content', 'docs', 'ui');

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const NAMESPACE_URL = 'https://ndigo.dev/r/{name}.json';
// Absolute dependency URLs keep a direct-URL install self-contained: bare names
// resolve against shadcn's default registry, not this one.
const REGISTRY_BASE = (process.env.NDIGO_REGISTRY_BASE || 'https://ndigo.dev/r').replace(/\/$/, '');

const TYPE_LABELS = {
    'registry:theme': 'Theme',
    'registry:lib': 'Foundation library',
    'registry:ui': 'Primitive',
    'registry:block': 'Block',
};

const GROUPS = [
    { label: 'Foundation', types: ['registry:theme', 'registry:lib'] },
    { label: 'Primitives', types: ['registry:ui'] },
    { label: 'Blocks', types: ['registry:block'] },
];

if (!existsSync(REGISTRY_PATH)) {
    console.error(`Registry not found at ${REGISTRY_PATH}.`);
    console.error('Set NDIGO_REPO to the ndigo checkout and run the sync again.');
    process.exit(1);
}

const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
const items = registry.items ?? [];
if (items.length === 0) {
    console.error(`No items in ${REGISTRY_PATH}.`);
    process.exit(1);
}

const itemsByName = new Map(items.map((item) => [item.name, item]));
const grouped = GROUPS.map((group) => ({
    ...group,
    items: items
        .filter((item) => group.types.includes(item.type))
        .sort((a, b) => a.title.localeCompare(b.title)),
}));
const ordered = grouped.flatMap((group) => group.items);
const sidebarOrder = new Map(ordered.map((item, index) => [item.name, index + 1]));

rmSync(PUBLIC_R, { recursive: true, force: true });
mkdirSync(PUBLIC_R, { recursive: true });
writeFileSync(join(PUBLIC_R, 'registry.json'), readFileSync(REGISTRY_PATH, 'utf8'), 'utf8');
for (const item of items) {
    writeFileSync(join(PUBLIC_R, `${item.name}.json`), JSON.stringify(buildItem(item), null, 2), 'utf8');
}

mkdirSync(DOCS_UI, { recursive: true });
const generatedNames = new Set(['index.md', 'index.mdx', ...items.map((item) => `${item.name}.md`), ...items.map((item) => `${item.name}.mdx`)]);
for (const entry of readdirSync(DOCS_UI)) {
    if ((entry.endsWith('.md') || entry.endsWith('.mdx')) && generatedNames.has(entry)) {
        rmSync(join(DOCS_UI, entry), { force: true });
    }
}
writeFileSync(join(DOCS_UI, 'index.md'), renderIndex(), 'utf8');
for (const item of ordered) {
    writeFileSync(join(DOCS_UI, `${item.name}.md`), renderItem(item), 'utf8');
}

console.log(`  built ${items.length} registry items -> public/r`);
console.log(`  generated ${ordered.length + 1} catalogue pages -> src/content/docs/ui`);
console.log(`Synced the ndigo-ui registry from ${REPO}`);

/** Builds the `shadcn build` payload for one registry item. */
function buildItem(item) {
    return {
        $schema: ITEM_SCHEMA,
        name: item.name,
        title: item.title,
        author: item.author,
        description: item.description,
        ...(item.dependencies ? { dependencies: item.dependencies } : {}),
        ...(item.registryDependencies
            ? { registryDependencies: item.registryDependencies.map(qualifyDependency) }
            : {}),
        files: item.files.map((file) => {
            const source = join(UI_ROOT, file.path);
            if (!existsSync(source)) throw new Error(`${item.name}: missing file ${file.path}`);
            return {
                path: file.path,
                content: readFileSync(source, 'utf8'),
                type: file.type,
                ...(file.target ? { target: file.target } : {}),
            };
        }),
        ...(item.docs ? { docs: item.docs } : {}),
        ...(item.categories ? { categories: item.categories } : {}),
        type: item.type,
    };
}

/** Resolves a registry dependency name to an absolute item URL. */
function qualifyDependency(name) {
    return /^(https?:)?\/\//.test(name) ? name : `${REGISTRY_BASE}/${name}.json`;
}

/** Renders the `/ui` landing page with the full item catalogue. */
function renderIndex() {
    const total = items.length;
    const counts = grouped.map((group) => `${group.items.length} ${group.label.toLowerCase()}`).join(', ');
    const parts = [
        '---',
        'title: "UI catalogue"',
        `description: "Copy-in components, primitives, and blocks for Ndigo applications."`,
        'sidebar:',
        '  label: Overview',
        '  order: 0',
        '---',
        '',
        'Ndigo UI is a copy-in design system: install an item, own the source, and style it with the',
        '`--nd-*` tokens. There is no runtime dependency, no React, and no Tailwind.',
        '',
        `The registry has ${total} items: ${counts}. Most primitives depend on the theme; behaviour`,
        'primitives also depend on the element foundation. The CLI installs registry dependencies for you.',
        '',
        '## Install',
        '',
        'Configure the `@ndigo` namespace in `components.json`:',
        '',
        '```json',
        '{',
        '  "registries": {',
        `    "@ndigo": "${NAMESPACE_URL}"`,
        '  }',
        '}',
        '```',
        '',
        'Then add an item:',
        '',
        '```bash',
        'npx shadcn@latest add @ndigo/button',
        '```',
        '',
        'The direct URL works without configuration:',
        '',
        '```bash',
        'npx shadcn@latest add https://ndigo.dev/r/button.json',
        '```',
        '',
    ];

    for (const group of grouped) {
        if (group.items.length === 0) continue;
        parts.push(`## ${group.label}`, '');
        parts.push('| Item | Description | Depends on |');
        parts.push('| :--- | :--- | :--- |');
        for (const item of group.items) {
            parts.push(`| [${item.title}](/ui/${item.name}/) | ${item.description} | ${dependencySummary(item)} |`);
        }
        parts.push('');
    }

    return parts.join('\n').trimEnd() + '\n';
}

/** Renders one registry item page. */
function renderItem(item) {
    const type = TYPE_LABELS[item.type] ?? item.type;
    const categories = (item.categories ?? []).filter((category) => !['ui', 'block', 'theme', 'lib'].includes(category));
    const parts = [
        '---',
        `title: ${JSON.stringify(item.title)}`,
        `description: ${JSON.stringify(item.description)}`,
        'sidebar:',
        `  order: ${sidebarOrder.get(item.name) ?? 0}`,
        '---',
        '',
        item.description,
        '',
        `**${type}**${categories.length > 0 ? ` · ${categories.join(' · ')}` : ''}`,
        '',
        '## Install',
        '',
        '```bash',
        `npx shadcn@latest add https://ndigo.dev/r/${item.name}.json`,
        '```',
        '',
        `To use the shorter \`@ndigo/${item.name}\` form, [configure the namespace](/ui/#install) in \`components.json\`.`,
        '',
        '## Files',
        '',
        '| Source | Target | Type |',
        '| :--- | :--- | :--- |',
        ...item.files.map((file) => `| \`${file.path}\` | \`${file.target ?? ''}\` | \`${file.type}\` |`),
        '',
        '## Dependencies',
        '',
        ...dependencyLines(item),
        '',
    ];

    const readme = readmeBody(item);
    if (readme.length > 0) {
        parts.push('## Documentation', '', readme, '');
    } else if (item.docs) {
        parts.push('## Usage', '', item.docs, '');
    }

    return parts.join('\n').trimEnd() + '\n';
}

/** Returns the README body without its H1 and tagline blockquote. */
function readmeBody(item) {
    const source = join(UI_ROOT, dirname(item.files[0].path), 'README.md');
    if (!existsSync(source)) return '';

    const lines = readFileSync(source, 'utf8').replace(/\r\n/g, '\n').split('\n');
    while (lines.length > 0 && lines[0].trim() === '') lines.shift();
    if (lines[0]?.startsWith('# ')) {
        lines.shift();
        while (lines.length > 0 && lines[0].trim() === '') lines.shift();
        if (lines[0]?.startsWith('>')) {
            while (lines.length > 0 && lines[0].startsWith('>')) lines.shift();
            while (lines.length > 0 && lines[0].trim() === '') lines.shift();
        }
    }
    return demoteHeadings(lines.join('\n').trimEnd());
}

/** Demotes README headings one level so they nest under `## Documentation`. */
function demoteHeadings(markdown) {
    let fence = null;
    return markdown
        .split('\n')
        .map((line) => {
            const trimmed = line.trimStart();
            const marker = trimmed.match(/^(`{3,}|~{3,})/);
            if (marker) {
                if (fence === null) fence = marker[1][0];
                else if (marker[1][0] === fence) fence = null;
                return line;
            }
            if (fence !== null) return line;
            return /^#{1,5}\s/.test(line) ? `#${line}` : line;
        })
        .join('\n');
}

/** Renders the dependency section for one item. */
function dependencyLines(item) {
    const registryDependencies = item.registryDependencies ?? [];
    const dependencies = item.dependencies ?? [];
    if (registryDependencies.length === 0 && dependencies.length === 0) return ['None.'];

    const lines = [];
    if (registryDependencies.length > 0) {
        const links = registryDependencies.map((name) => {
            const dependency = itemsByName.get(name);
            return dependency ? `[${dependency.title}](/ui/${name}/)` : `\`${name}\``;
        });
        lines.push(`Registry: ${links.join(', ')}.`);
    }
    if (dependencies.length > 0) {
        lines.push(`Packages: ${dependencies.map((name) => `\`${name}\``).join(', ')} (installed automatically).`);
    }
    return lines;
}

/** Renders the dependency column for the catalogue index. */
function dependencySummary(item) {
    const names = item.registryDependencies ?? [];
    if (names.length === 0) return '—';
    return names
        .map((name) => {
            const dependency = itemsByName.get(name);
            return dependency ? `[${dependency.title}](/ui/${name}/)` : `\`${name}\``;
        })
        .join(', ');
}

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
import { dirname, join, relative, posix } from 'node:path';
import { slug as githubSlug } from 'github-slugger';
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

    const manifest = JSON.parse(readFileSync(join(PACKAGES, dir, 'package.json'), 'utf8'));

    let skippedRoot = 0;
    for (const file of walk(srcApi)) {
        // Skip the package root README; we generated a module index instead.
        if (file.split('/').pop() === 'README.md' && dirname(file) === srcApi) {
            skippedRoot++;
            continue;
        }
        const rel = relative(srcApi, file);
        const destFile = join(destApi, rel);
        mkdirSync(dirname(destFile), { recursive: true });
        let raw = readFileSync(file, 'utf8');
        const relFile = posix.relative(srcApi, file);
        const relDir = posix.dirname(relFile);
        // TypeDoc links to README.md; Astro serves directory indexes as index.md.
        raw = raw.replace(/README\.md/g, 'index.md');
        // Prefer "Exports" over TypeDoc's "Re-exports" in module indexes.
        raw = raw.replace(/Re-exports/g, 'Exports');
        // Add a back link to the package index on module root pages.
        if (file.split('/').pop() === 'README.md') {
            raw = `[← ${manifest.name}](/reference/api/${dir}/)\n\n${raw}`;
        }
        // Astro routes are case-sensitive and lower-case file names; rewrite
        // relative .md links to root-relative URLs so they resolve on the site.
        raw = raw.replace(/\]\(([^)]+\.md)(#[^)]*)?\)/g, (m, linkPath, hash) => {
            const h = hash || '';
            const resolved = posix.normalize(posix.join(relDir, linkPath));
            const slugPath = resolved
                .split('/')
                .filter(Boolean)
                .map((seg) => {
                    const isMd = seg.toLowerCase().endsWith('.md');
                    const name = isMd ? seg.slice(0, -3) : seg;
                    return githubSlug(name);
                })
                .join('/');
            let route = slugPath;
            if (route.endsWith('/index')) route = route.slice(0, -6);
            if (!route.endsWith('/')) route += '/';
            return `](/reference/api/${dir}/${route}${h})`;
        });
        const title = titleFor(file, raw);
        const base = destFile.split('/').pop();
        const lowerBase = base.toLowerCase().replace('readme.md', 'index.md');
        const finalDest = destFile.slice(0, -base.length) + lowerBase;
        mkdirSync(dirname(finalDest), { recursive: true });
        writeFileSync(finalDest, injectFrontmatter(raw, title), 'utf8');
    }

    // Remove any root README.md that was copied despite the skip condition.
    for (const f of walk(destApi)) {
        if (f.endsWith('/README.md') && dirname(f) === destApi) rmSync(f, { force: true });
    }
    if (skippedRoot === 0) console.log(`  WARNING: no root README skipped for ${dir}`);
    // Generate a module-level index instead of copying TypeDoc's flat root index.
    // Written after the loop so it overwrites any copied root README.md.
    const moduleDirs = readdirSync(srcApi, { withFileTypes: true })
        .filter((e) => e.isDirectory() && e.name !== 'index' && existsSync(join(srcApi, e.name, 'README.md')))
        .map((e) => e.name)
        .sort();
    const moduleLines = [
        '---',
        `title: ${JSON.stringify(manifest.name)}`,
        '---',
        '',
        `[← API reference](/reference/api/)`,
        '',
        `# ${manifest.name}`,
        '',
        manifest.description ? `${manifest.description}` : '',
        '',
        '## Modules (CUSTOM INDEX)',
        '',
    ];
    for (const mod of moduleDirs) {
        const modReadme = readFileSync(join(srcApi, mod, 'README.md'), 'utf8');
        const modTitle = titleFor(join(srcApi, mod, 'README.md'), modReadme);
        moduleLines.push(`- [${modTitle}](/reference/api/${dir}/${githubSlug(mod)}/)`);
    }
    moduleLines.push('');
    writeFileSync(join(destApi, 'index.md'), moduleLines.join('\n'), 'utf8');
    console.log(`  wrote custom index: ${join(destApi, 'index.md')}`);
}

// Package layers (mirrors the Core Concepts guide).
const LAYERS = [
    { name: 'Foundation', dirs: ['ndigo-core', 'ndigo-util', 'ndigo-factory', 'ndigo-context', 'ndigo-boot'] },
    { name: 'Web', dirs: ['ndigo-router', 'ndigo-dispatcher', 'ndigo-view', 'ndigo-view-ejs', 'ndigo-view-webcomponent', 'ndigo-view-toon', 'ndigo-http', 'ndigo-openapi'] },
    { name: 'Platforms', dirs: ['ndigo-platform-node', 'ndigo-platform-web'] },
    { name: 'Data', dirs: ['ndigo-orm', 'ndigo-orm-drizzle', 'ndigo-cache', 'ndigo-redis'] },
    { name: 'Security', dirs: ['ndigo-auth-core', 'ndigo-auth-server', 'ndigo-auth-client', 'ndigo-rate-limit'] },
    { name: 'Async', dirs: ['ndigo-scheduler', 'ndigo-jobs', 'ndigo-locks', 'ndigo-cluster', 'ndigo-socket'] },
    { name: 'Cross-cutting', dirs: ['ndigo-log', 'ndigo-telemetry', 'ndigo-telemetry-node', 'ndigo-telemetry-web', 'ndigo-management', 'ndigo-proxy', 'ndigo-resilience', 'ndigo-flags', 'ndigo-flags-openfeature', 'ndigo-content', 'ndigo-content-i18next', 'ndigo-mcp', 'ndigo-inspect'] },
    { name: 'Browser', dirs: ['ndigo-signals', 'ndigo-host', 'ndigo-dom'] },
    { name: 'UI', dirs: ['ndigo-ui', 'ndigo-ui-web'] },
    { name: 'Tooling', dirs: ['ndigo-cli', 'ndigo-oxlint-plugin', 'create-ndigo-app', 'ndigo-test', 'ndigo-ai', 'ndigo-ai-sdk'] },
];

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
const byDir = new Map(packages.map((dir) => [dir, dir]));
for (const layer of LAYERS) {
    const layerDirs = layer.dirs.filter((dir) => byDir.has(dir));
    if (layerDirs.length === 0) continue;
    indexLines.push(`## ${layer.name}`, '');
    for (const dir of layerDirs) {
        const manifest = JSON.parse(readFileSync(join(PACKAGES, dir, 'package.json'), 'utf8'));
        indexLines.push(`- [${manifest.name}](/reference/api/${dir}/) — ${manifest.description ?? ''}`);
    }
    indexLines.push('');
}
// Any package not listed in a layer.
const listed = new Set(LAYERS.flatMap((l) => l.dirs));
const unlisted = packages.filter((dir) => !listed.has(dir));
if (unlisted.length) {
    indexLines.push('## Other', '');
    for (const dir of unlisted) {
        const manifest = JSON.parse(readFileSync(join(PACKAGES, dir, 'package.json'), 'utf8'));
        indexLines.push(`- [${manifest.name}](/reference/api/${dir}/) — ${manifest.description ?? ''}`);
    }
    indexLines.push('');
}
writeFileSync(join(DEST, 'index.md'), indexLines.join('\n'), 'utf8');

console.log(`  synced API reference: ${packages.length} packages -> src/content/docs/reference/api`);
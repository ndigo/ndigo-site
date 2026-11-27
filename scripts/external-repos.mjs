/**
 * Standalone repositories that are published alongside the framework monorepo.
 *
 * `create-ndigo-app` and `ndigo-skills` were extracted from `ndigo`; the site
 * still owns their presentation. Paths default to sibling checkouts and can be
 * overridden for CI or worktree testing:
 *
 *   CREATE_NDIGO_APP_REPO=/path/to/create-ndigo-app
 *   NDIGO_SKILLS_REPO=/path/to/ndigo-skills
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

export const CREATE_NDIGO_APP = {
    id: 'create-ndigo-app',
    dir: process.env.CREATE_NDIGO_APP_REPO || join(ROOT, '..', 'create-ndigo-app'),
    repo: 'https://github.com/ndigo/create-ndigo-app',
    name: 'create-ndigo-app',
    description: 'Scaffold a standalone Ndigo application (node or browser kind).',
};

export const NDIGO_SKILLS = {
    id: 'ndigo-skills',
    dir: process.env.NDIGO_SKILLS_REPO || join(ROOT, '..', 'ndigo-skills'),
    repo: 'https://github.com/ndigo/ndigo-skills',
    name: 'ndigo-skills',
    description: 'AI agent skills for building Ndigo applications.',
};

export const EXTERNAL_REPOS = [CREATE_NDIGO_APP, NDIGO_SKILLS];

/**
 * Reads the package manifest for a standalone repo, falling back to the
 * metadata above when the checkout or manifest is absent. The display name is
 * the repository name; `ndigo-skills` is private and not an installable npm
 * package, so its manifest name would mislead on the package index.
 */
export function packageMeta(repo) {
    const manifest = join(repo.dir, 'package.json');
    if (!existsSync(manifest)) return { name: repo.name, description: repo.description };
    try {
        const meta = JSON.parse(readFileSync(manifest, 'utf8'));
        return {
            name: repo.name,
            description: meta.description || repo.description,
        };
    } catch {
        return { name: repo.name, description: repo.description };
    }
}

/**
 * The public guide groups: one source for the All Guides index and the Guides
 * sidebar. Membership, order, and titles come from the framework's
 * `docs/guides/guides.json` manifest, so the site cannot drift from the docs.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = process.env.NDIGO_REPO || join(ROOT, '..', 'ndigo');
const MANIFEST = join(REPO, 'docs', 'guides', 'guides.json');

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

export const GUIDE_GROUPS = manifest.groups;

/** Contributor standards published under Reference → Contributing. */
export const CONTRIBUTING_DOCS = manifest.contributing ?? [];

/** Every guide in navigation order, flattened across the groups. */
export const GUIDES = GUIDE_GROUPS.flatMap((group) => group.guides);

// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';
import { CONCEPT_PAGES } from './scripts/concept-pages.mjs';
import { GUIDE_GROUPS, CONTRIBUTING_DOCS } from './scripts/guide-groups.mjs';
import { UI_SIDEBAR } from './src/data/ui-sidebar.mjs';

// https://astro.build/config
export default defineConfig({
    site: 'https://ndigo.dev',
    // Old Concepts layout; the four architecture pages are flat now.
    redirects: {
        '/concepts/architecture/environment': '/concepts/environment',
        '/concepts/architecture/lifecycle-and-ownership': '/concepts/lifecycle-and-ownership',
        '/concepts/architecture/micro-frontends': '/concepts/micro-frontends',
        '/concepts/architecture/security': '/concepts/security',
        '/concepts/architecture/agent-first': '/concepts/agent-first',
        '/concepts/style-guide/': '/reference/contributing/style-guide/',
        '/guides/package-documentation/': '/reference/contributing/package-documentation/',
        '/guides/application-conventions/': '/reference/contributing/application-conventions/',
    },
    integrations: [
        mermaid({ autoTheme: true }),
        starlight({
            title: 'Ndigo',
            description: 'TypeScript framework for the web. One context, one dispatcher, one view model — shared by browser and Node.',
            favicon: '/favicon.svg',
            plugins: [starlightLinksValidator({
                exclude: ({ file }) => file.includes('/reference/api/'),
            })],
            logo: {
                src: './src/assets/ndigo.svg',
                alt: 'Ndigo',
                replacesTitle: true,
            },
            components: {
                Header: './src/components/Header.astro',
            },
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/ndigo/ndigo' },
            ],
            customCss: [
                './src/styles/tokens.css',
                './src/styles/ndigo-components.css',
                './src/styles/site.css',
            ],
            head: [
                {
                    tag: 'link',
                    attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'stylesheet',
                        href: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap',
                    },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'manifest', href: '/site.webmanifest' },
                },
                {
                    tag: 'meta',
                    attrs: { name: 'theme-color', content: '#0c0c1e' },
                },
            ],
            defaultLocale: 'root',
            sidebar: [
                {
                    label: 'Start Here',
                    items: [
                        { label: 'Overview', slug: 'index' },
                        { label: 'Get Started', slug: 'get-started' },
                        { label: 'Examples', slug: 'examples' },
                    ],
                },
                {
                    label: 'Guides',
                    collapsed: true,
                    items: [
                        { label: 'All Guides', link: '/guides/' },
                        ...GUIDE_GROUPS.map((group) => ({
                            label: group.label,
                            collapsed: true,
                            items: group.guides.map((guide) => ({
                                label: guide.title,
                                link: `/guides/${guide.slug}/`,
                            })),
                        })),
                    ],
                },
                {
                    label: 'Concepts',
                    items: [
                        { label: 'Concepts Map', link: '/concepts/' },
                        ...CONCEPT_PAGES.map((page) => ({
                            label: page.title,
                            slug: `concepts/${page.dest.replace(/\.md$/, '')}`,
                        })),
                    ],
                },
                {
                    label: 'UI',
                    collapsed: true,
                    items: UI_SIDEBAR,
                },
                {
                    label: 'Reference',
                    items: [
                        { label: 'API', link: '/reference/api/' },
                        { label: 'Packages', link: '/reference/packages/' },
                        { label: 'Changelog', link: '/reference/changelog/' },
                        {
                            label: 'Contributing',
                            collapsed: false,
                            items: [
                                { label: 'Contributing to Ndigo', link: '/reference/contributing/' },
                                { label: 'Style Guide', link: '/reference/contributing/style-guide/' },
                                ...CONTRIBUTING_DOCS.map((doc) => ({
                                    label: doc.title,
                                    link: `/reference/contributing/${doc.slug}/`,
                                })),
                            ],
                        },
                    ],
                },
            ],
        }),
    ],
});

// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
    site: 'https://ndigo.dev',
    // Old Concepts layout; the four architecture pages are flat now.
    redirects: {
        '/concepts/architecture/environment': '/concepts/environment',
        '/concepts/architecture/lifecycle-and-ownership': '/concepts/lifecycle-and-ownership',
        '/concepts/architecture/micro-frontends': '/concepts/micro-frontends',
        '/concepts/architecture/security': '/concepts/security',
    },
    integrations: [
        mermaid({ autoTheme: true }),
        starlight({
            title: 'Ndigo',
            description: 'TypeScript framework for the web. One context, one dispatcher, one view model — shared by browser and Node.',
            plugins: [starlightLinksValidator()],
            logo: {
                src: './src/assets/ndigo.svg',
                alt: 'Ndigo',
                replacesTitle: true,
            },
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/ndigo/ndigo' },
            ],
            customCss: ['./src/styles/tokens.css'],
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
                    label: 'UI',
                    items: [{ autogenerate: { directory: 'ui' } }],
                },
                {
                    label: 'Guides',
                    items: [{ autogenerate: { directory: 'guides' } }],
                },
                {
                    label: 'Concepts',
                    items: [
                        { label: 'Architecture Overview', slug: 'concepts/architecture-overview' },
                        { label: 'Environment & Configuration', slug: 'concepts/environment' },
                        { label: 'Lifecycle & Ownership', slug: 'concepts/lifecycle-and-ownership' },
                        { label: 'Micro Frontends', slug: 'concepts/micro-frontends' },
                        { label: 'Security', slug: 'concepts/security' },
                        { label: 'Style Guide', slug: 'concepts/style-guide' },
                    ],
                },
                {
                    label: 'Reference',
                    items: [{ autogenerate: { directory: 'reference' } }],
                },
            ],
        }),
    ],
});

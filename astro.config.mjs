// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
    site: 'https://ndigo.dev',
    integrations: [
        starlight({
            title: 'Ndigo',
            description: 'TypeScript framework for the web. One context, one dispatcher, one view model — shared by browser and Node.',
            logo: {
                src: './src/assets/ndigo.svg',
                alt: 'Ndigo',
                replacesTitle: true,
            },
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/ndigo/ndigo' },
            ],
            customCss: ['./src/styles/tokens.css'],
            defaultLocale: 'root',
            sidebar: [
                {
                    label: 'Start Here',
                    items: [
                        { label: 'Overview', slug: 'index' },
                        { label: 'Get Started', slug: 'guides/get-started' },
                    ],
                },
                {
                    label: 'Guides',
                    items: [{ autogenerate: { directory: 'guides' } }],
                },
                {
                    label: 'Reference',
                    items: [{ autogenerate: { directory: 'reference' } }],
                },
            ],
        }),
    ],
});

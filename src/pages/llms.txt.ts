import { getCollection } from 'astro:content';

export async function GET() {
    const docs = await getCollection('docs');
    const lines: string[] = [];
    lines.push('# Ndigo');
    lines.push('');
    lines.push('> TypeScript framework for the web. One context, one dispatcher, one view model — shared by browser and Node.');
    lines.push('');
    lines.push('## Docs');
    lines.push('');

    const sorted = docs
        .filter((d) => !d.id.endsWith('index') || d.id === 'index')
        .sort((a, b) => a.id.localeCompare(b.id));

    for (const doc of sorted) {
        const title = doc.data.title ?? doc.id;
        const desc = doc.data.description ? `: ${doc.data.description}` : '';
        // Starlight slug: id without extension, leading slash
        let slug = '/' + doc.id.replace(/\.mdx?$/, '');
        if (!slug.endsWith('/')) slug += '/';
        slug = slug.replace(/\/index\/$/, '/');
        lines.push(`- [${title}](https://ndigo.dev${slug})${desc}`);
    }

    return new Response(lines.join('\n') + '\n', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
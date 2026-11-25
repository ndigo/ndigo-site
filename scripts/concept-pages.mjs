/**
 * The public Concepts pages. The four architecture topics are flattened into
 * concepts/ so the site has one shallow section; `title` overrides the source
 * H1 where the repo title is longer than a navigation label should be.
 *
 * Shared by the content sync (which writes the pages) and the sidebar config
 * (which derives the Concepts group), so the two lists cannot drift.
 */
export const CONCEPT_PAGES = [
    {
        src: 'ARCHITECTURE.md',
        dest: 'architecture-overview.md',
        title: 'Architecture Overview',
        description: 'Layers, principles, package map, and design patterns.',
    },
    {
        src: 'docs/architecture/environment.md',
        dest: 'environment.md',
        title: 'Environment & Configuration',
        description: 'Configuration precedence, profiles, typed binding, and fail-loud validation.',
    },
    {
        src: 'docs/architecture/lifecycle-and-ownership.md',
        dest: 'lifecycle-and-ownership.md',
        title: 'Lifecycle & Ownership',
        description: 'Initialization, shutdown, and who owns each resource.',
    },
    {
        src: 'docs/architecture/micro-frontends.md',
        dest: 'micro-frontends.md',
        title: 'Micro Frontends',
        description: 'Hosted feature contexts, islands, and the boundaries between them.',
    },
    {
        src: 'docs/architecture/security.md',
        dest: 'security.md',
        title: 'Security',
        description: 'Trust boundaries and the defense layers that protect an application.',
    },
    {
        src: 'docs/architecture/annotation-and-transformer-model.md',
        dest: 'annotation-and-transformer-model.md',
        title: 'Annotation, Advice & Transformer',
        description: 'Declarations that describe a member, advice that runs around a call, and definition-time replacement.',
    },
    {
        src: 'docs/architecture/agent-first.md',
        dest: 'agent-first.md',
        title: 'Agent-First',
        description: 'Authoring and runtime agents, capabilities as the installable unit, and verification as the executable contract.',
    },
    {
        src: 'STYLE_GUIDE.md',
        dest: 'style-guide.md',
        title: 'Style Guide',
        description: 'Naming, formatting, and code organization conventions.',
    },
];

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
        description: 'Philosophy, the eight layers, core building blocks, and the application lifecycle.',
    },
    {
        src: 'docs/architecture/design-principles.md',
        dest: 'design-principles.md',
        title: 'Design Principles',
        description: 'SOLID, DRY/AHA, design patterns, and the shared contract vocabulary.',
    },
    {
        src: 'docs/architecture/decorators.md',
        dest: 'decorators.md',
        title: 'Decorators',
        description: 'The decorator catalog, metadata, performance, and custom decorators.',
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
        src: 'docs/architecture/conventions-and-idioms.md',
        dest: 'conventions-and-idioms.md',
        title: 'Conventions & Idioms',
        description: 'The durable idioms: the five nouns, naming that carries meaning, module boundaries, errors, and documentation habits.',
    },
];

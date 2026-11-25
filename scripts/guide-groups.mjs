/**
 * The public guide groups: one source for the All Guides index and the Guides
 * sidebar. Numbers stay in the labels as stable identifiers; the groups are the
 * reading order. Add or reorder guides here, then run `check:guide-groups`.
 */
export const GUIDE_GROUPS = [
    {
        label: 'Foundations',
        description: 'The mental model, the two runtimes, and how configuration fits together.',
        guides: [
            { number: '00', slug: '00-core-concepts', title: 'Core Concepts & Mental Model' },
            { number: '01', slug: '01-building-a-node-api', title: 'Building a Node API' },
            { number: '02', slug: '02-building-a-browser-app', title: 'Building a Browser App' },
            { number: '03', slug: '03-environment-configuration', title: 'Environment & Configuration' },
            { number: '43', slug: '43-live-configuration-and-secrets', title: 'Live Configuration & Secrets' },
            {
                number: '49',
                slug: '49-configuration-layering-and-context-composition',
                title: 'Config Layering & Contexts',
            },
        ],
    },
    {
        label: 'Core application model',
        description: 'Dependency injection, routing, request handling, views, and targeting.',
        guides: [
            { number: '04', slug: '04-dependency-injection-and-lifecycle', title: 'Injection & Lifecycle' },
            { number: '05', slug: '05-routing-and-route-conditions', title: 'Routing & Route Conditions' },
            { number: '06', slug: '06-argument-binding', title: 'Argument Binding' },
            { number: '07', slug: '07-request-validation', title: 'Request Validation' },
            { number: '08', slug: '08-errors-and-problem-details', title: 'Errors & Problem Details' },
            { number: '09', slug: '09-views-and-content-negotiation', title: 'Views & Content Negotiation' },
            { number: '50', slug: '50-view-targeting', title: 'View Targeting' },
            { number: '41', slug: '41-custom-view-engines', title: 'Custom View Engines' },
        ],
    },
    {
        label: 'HTTP & integration',
        description: 'Files, clients, API docs, DTOs, uploads, real-time, i18n, and forms.',
        guides: [
            { number: '10', slug: '10-static-files', title: 'Static Files' },
            { number: '11', slug: '11-http-client', title: 'The HTTP Client' },
            { number: '12', slug: '12-openapi-and-api-docs', title: 'OpenAPI & API Docs' },
            { number: '13', slug: '13-dto-conversion', title: 'DTO & Conversion' },
            { number: '14', slug: '14-multipart-and-file-upload', title: 'Multipart & File Upload' },
            { number: '15', slug: '15-websockets', title: 'WebSockets' },
            { number: '42', slug: '42-stomp', title: 'STOMP & Cross-Node Fan-Out' },
            { number: '16', slug: '16-typed-service-clients-and-sse', title: 'Typed Service Clients & SSE' },
            { number: '17', slug: '17-i18n-and-content', title: 'Internationalization & Content' },
            { number: '18', slug: '18-forms-end-to-end', title: 'Forms End-to-End' },
        ],
    },
    {
        label: 'Data, jobs & runtime',
        description: 'Caching, persistence, background work, scheduling, locks, and clustering.',
        guides: [
            { number: '19', slug: '19-caching', title: 'Caching' },
            { number: '20', slug: '20-orm-and-migrations', title: 'ORM & Migrations' },
            { number: '21', slug: '21-persistence-and-shared-stores', title: 'Persistence & Shared Stores' },
            { number: '22', slug: '22-jobs-and-outbox', title: 'Background Jobs' },
            { number: '23', slug: '23-scheduling', title: 'Scheduling' },
            { number: '24', slug: '24-distributed-locks', title: 'Distributed Locks' },
            { number: '25', slug: '25-clustering', title: 'Clustering' },
        ],
    },
    {
        label: 'Security',
        description: 'Sessions, browser authentication, and hardening.',
        guides: [
            { number: '26', slug: '26-authentication-and-sessions', title: 'Authentication & Sessions' },
            { number: '27', slug: '27-browser-authentication-and-oidc', title: 'Browser Authentication & OIDC' },
            { number: '28', slug: '28-security-hardening', title: 'Security Hardening' },
        ],
    },
    {
        label: 'Browser & UI',
        description: 'Signals, islands, component libraries, micro frontends, and accessibility.',
        guides: [
            { number: '29', slug: '29-signals-and-islands', title: 'Signals & Islands' },
            { number: '30', slug: '30-component-integration', title: 'UI Components & Integration' },
            { number: '31', slug: '31-micro-frontends', title: 'Micro Frontends' },
            { number: '44', slug: '44-accessibility', title: 'Accessibility' },
        ],
    },
    {
        label: 'Operate & ship',
        description: 'Telemetry, endpoints, flags, resilience, testing, CLI, deployment, and upgrades.',
        guides: [
            { number: '32', slug: '32-telemetry', title: 'Telemetry' },
            { number: '33', slug: '33-management-endpoints', title: 'Management Endpoints' },
            { number: '34', slug: '34-feature-flags', title: 'Feature Flags' },
            { number: '35', slug: '35-method-interception-and-resilience', title: 'Resilience & Retries' },
            { number: '36', slug: '36-testing', title: 'Integration Testing' },
            { number: '37', slug: '37-ndigo-cli', title: 'The Ndigo CLI' },
            { number: '38', slug: '38-deployment-and-production-readiness', title: 'Deployment & Production' },
            { number: '39', slug: '39-quality-guardrails', title: 'Quality Guardrails' },
            { number: '40', slug: '40-troubleshooting-and-faq', title: 'Troubleshooting & FAQ' },
            { number: '45', slug: '45-performance-and-scaling', title: 'Performance & Scaling' },
            { number: '46', slug: '46-upgrading', title: 'Upgrading Ndigo' },
        ],
    },
    {
        label: 'Agents & capabilities',
        description: 'Model loops, agent-facing surfaces, capabilities, and the operate contract.',
        guides: [
            { number: '47', slug: '47-ai-agents', title: 'AI Agents & Streaming' },
            { number: '48', slug: '48-agent-facing-surfaces', title: 'Agent-Facing Surfaces' },
            { number: '51', slug: '51-capabilities-for-authoring-agents', title: 'Capabilities for Authoring Agents' },
            { number: '52', slug: '52-agent-operate-contract', title: 'The Agent Operate Contract' },
            { number: '53', slug: '53-capability-authoring', title: 'Capability Authoring' },
        ],
    },
    {
        label: 'Appendices',
        description: 'Framework contributor guides: package documentation and application conventions.',
        guides: [
            { number: '90', slug: '90-package-documentation', title: 'Package Documentation' },
            { number: '91', slug: '91-application-conventions', title: 'Application Conventions' },
        ],
    },
];

/** Every guide in navigation order, flattened across the groups. */
export const GUIDES = GUIDE_GROUPS.flatMap((group) => group.guides);

/** The sidebar/index label: the stable number plus the short title. */
export function guideLabel(guide) {
    return `${guide.number} — ${guide.title}`;
}

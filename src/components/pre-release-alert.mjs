/**
 * Canonical pre-release notice for the public site.
 *
 * Shared by the homepage component and the content sync, which replaces the
 * plain Status blockquote in ARCHITECTURE.md with the same alert.
 */
const TITLE = 'Pre-release';
const DESCRIPTION =
    'Ndigo is in pre-release and still subject to changes. The packages are not yet published to npm; build from this repository. APIs may change between commits; Semantic Versioning guarantees arrive at <code>1.0.0</code>.';

export function renderPreReleaseAlert() {
    return `<div class="nd-alert" data-variant="warning" role="status">
    <span class="nd-alert__icon" aria-hidden="true">!</span>
    <div class="nd-alert__content">
        <p class="nd-alert__title">${TITLE}</p>
        <p class="nd-alert__description">${DESCRIPTION}</p>
    </div>
</div>`;
}

import { LitElement, html, css, nothing } from 'lit';
import { icons } from './icons.js';

export { icons, iconNames } from './icons.js';

/**
 * An icon from the Pastis set (`icons.js`, copied from Lucide), drawn in `currentColor` so it
 * follows the text colour and the theme.
 *
 * Decorative by default: the host gets `aria-hidden="true"`. With `label` it is an image
 * (`role="img"`) named by the label, for an icon that carries meaning on its own. An icon inside a
 * named control (a button with text, a link) stays decorative.
 *
 * An unknown `name` renders nothing and logs one `console.warn` naming it.
 *
 * @csspart svg - The SVG element
 * @cssprop --pastis-icon-size - Overrides the size (width and height) set by `size`
 */
export class PastisIcon extends LitElement {
  static properties = {
    /** Icon name from the Pastis set (required), e.g. `calendar`. See `iconNames`. */
    name: { type: String, reflect: true },
    /** Size: `sm` (16 px), `md` (20 px, default) or `lg` (24 px). */
    size: { type: String, reflect: true },
    /** Accessible name. When set the icon is `role="img"`; without it the icon is decorative. */
    label: { type: String },
  };

  static styles = css`
    :host {
      --_size: calc(var(--space-md, 16px) + var(--space-xs, 4px));
      display: inline-flex;
      flex-shrink: 0;
      width: var(--pastis-icon-size, var(--_size));
      height: var(--pastis-icon-size, var(--_size));
      vertical-align: middle;
    }
    :host([size="sm"]) { --_size: var(--space-md, 16px); }
    :host([size="lg"]) { --_size: var(--space-lg, 24px); }
    :host([hidden]) { display: none; }

    svg { display: block; width: 100%; height: 100%; }
  `;

  constructor() {
    super();
    this.size = 'md';
  }

  willUpdate(changed) {
    if (changed.has('name') && !Object.hasOwn(icons, this.name ?? '')) {
      console.warn(`pastis-icon: unknown icon name "${this.name ?? ''}"`);
    }
    if (this.label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', this.label);
      this.removeAttribute('aria-hidden');
    } else {
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
      this.setAttribute('aria-hidden', 'true');
    }
  }

  render() {
    const content = Object.hasOwn(icons, this.name ?? '') ? icons[this.name] : null;
    if (!content) return nothing;
    return html`<svg
      part="svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >${content}</svg>`;
  }
}

customElements.define('pastis-icon', PastisIcon);

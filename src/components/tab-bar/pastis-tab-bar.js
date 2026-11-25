import { LitElement, html, css, nothing } from 'lit';
import '../icon/pastis-icon.js';

/**
 * Bottom navigation for an installed app: a `nav` landmark named by `label`, fixed to the bottom
 * of the viewport, with `<pastis-tab-bar-item>` children sharing its width evenly.
 *
 * Its full height, the iPhone home-indicator safe area included, is the token
 * `--pastis-tab-bar-height`; pad the page content with it so nothing ends up under the bar:
 * `main { padding-bottom: var(--pastis-tab-bar-height); }`. Overriding the token changes the bar's
 * height too (include `env(safe-area-inset-bottom)` in the new value). The page needs
 * `<meta name="viewport" content="…, viewport-fit=cover">` for the safe area to be non-zero.
 *
 * @slot - `<pastis-tab-bar-item>` elements
 * @csspart nav - The `nav` element (background, border, safe-area padding)
 * @cssprop --pastis-tab-bar-height - Full height of the bar, safe area included (a token)
 */
export class PastisTabBar extends LitElement {
  static properties = {
    /** Accessible name of the navigation landmark (e.g. “Main”). */
    label: { type: String },
  };

  static styles = css`
    :host {
      position: fixed;
      inset-inline: 0;
      bottom: 0;
      z-index: 100;
      display: block;
    }
    :host([hidden]) { display: none; }

    nav {
      display: flex;
      align-items: stretch;
      box-sizing: border-box;
      height: var(--pastis-tab-bar-height, calc(56px + env(safe-area-inset-bottom, 0px)));
      padding-bottom: env(safe-area-inset-bottom, 0px);
      padding-left: max(var(--space-xs, 4px), env(safe-area-inset-left, 0px));
      padding-right: max(var(--space-xs, 4px), env(safe-area-inset-right, 0px));
      background: var(--bg-secondary, #16110d);
      border-top: var(--border-width, 1px) solid var(--border-default, #3a322b);
    }

    ::slotted(*) { flex: 1 1 0; min-width: 0; }
  `;

  render() {
    return html`<nav part="nav" aria-label=${this.label || nothing}><slot></slot></nav>`;
  }
}

/**
 * One destination in a `<pastis-tab-bar>`: a link with an icon above its label, and an optional
 * badge. `current` marks it as the current page (`aria-current="page"`, accent colour).
 *
 * A plain click fires a cancelable `pastis-navigate` first: a client-side router cancels it
 * (`preventDefault()`) and navigates itself; when nobody cancels it, the link is followed.
 * Clicks with a modifier key (new tab or window) skip the event and are left to the browser.
 *
 * The `hidden` attribute hides the item completely (not rendered, not focusable).
 *
 * Give every item an `href`. Without one it logs a `console.warn` and stays reachable as
 * `role="link"` with `tabindex="0"` (Enter activates it); `pastis-navigate` then has no href.
 *
 * @fires pastis-navigate - A plain click on the link, detail { href }. Cancelable.
 * @csspart link - The `<a>` element
 * @csspart icon - The icon
 * @csspart label - The visible label
 * @csspart badge - The badge
 */
export class PastisTabBarItem extends LitElement {
  static properties = {
    /** Destination URL. */
    href: { type: String },
    /** Icon name from the Pastis set (see `pastis-icon`). */
    icon: { type: String },
    /** Visible label, and the link's accessible name. */
    label: { type: String },
    /** The current page: `aria-current="page"` and the accent colour. */
    current: { type: Boolean, reflect: true },
    /** Badge content, e.g. a count (`3`). Empty, null or undefined shows no badge; `0` shows one. */
    badge: { type: String },
    /** What the badge means, added to the link's name (“3 items” makes “Today, 3 items”). Defaults to the badge itself. */
    badgeLabel: { type: String, attribute: 'badge-label' },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }

    a {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      box-sizing: border-box;
      height: 100%;
      min-height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      padding: var(--space-xs, 4px);
      border-radius: var(--radius-md, 6px);
      color: var(--text-tertiary, #a39b90);
      font-family: var(--font-family-body, sans-serif);
      font-size: var(--font-size-micro, 11px);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-caption, 1.4);
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
    }

    a:not([href]) { cursor: pointer; }

    a:hover { color: var(--text-primary, #f4eee3); }

    :host([current]) a { color: var(--text-accent, #fcba28); }

    a:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -2px;
    }

    .icon-wrap { position: relative; display: inline-flex; }

    .label {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .badge {
      position: absolute;
      top: calc(var(--space-xs, 4px) * -1);
      left: calc(100% - var(--space-sm, 8px));
      min-width: var(--space-md, 16px);
      height: var(--space-md, 16px);
      padding-inline: var(--space-xs, 4px);
      box-sizing: border-box;
      border-radius: var(--radius-full, 9999px);
      background: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
      font-size: var(--font-size-micro, 11px);
      font-weight: var(--font-weight-bold, 700);
      line-height: var(--space-md, 16px);
      text-align: center;
      white-space: nowrap;
    }
  `;

  constructor() {
    super();
    this.current = false;
  }

  willUpdate(changed) {
    if (!this.href && (!this.hasUpdated || changed.has('href'))) {
      console.warn(`pastis-tab-bar-item: "${this.label ?? ''}" has no href; it is rendered as role="link" with tabindex="0"`);
    }
  }

  get _hasBadge() {
    return this.badge !== undefined && this.badge !== null && String(this.badge) !== '';
  }

  render() {
    const badge = this._hasBadge;
    return html`
      <a
        part="link"
        href=${this.href || nothing}
        role=${this.href ? nothing : 'link'}
        tabindex=${this.href ? nothing : '0'}
        aria-current=${this.current ? 'page' : nothing}
        aria-label=${badge ? `${this.label ?? ''}, ${this.badgeLabel || this.badge}` : nothing}
        @click=${this._onClick}
        @keydown=${this._onKeydown}
      >
        <span class="icon-wrap">
          ${this.icon ? html`<pastis-icon part="icon" name=${this.icon} size="lg"></pastis-icon>` : nothing}
          ${badge ? html`<span class="badge" part="badge" aria-hidden="true">${this.badge}</span>` : nothing}
        </span>
        <span class="label" part="label">${this.label}</span>
      </a>
    `;
  }

  // Without href the <a> is not a native link: Enter activates it as one would
  _onKeydown(e) {
    if (e.key !== 'Enter' || this.href) return;
    e.preventDefault();
    e.currentTarget.click();
  }

  _onClick(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const event = new CustomEvent('pastis-navigate', {
      detail: { href: this.href },
      bubbles: true, composed: true, cancelable: true,
    });
    if (!this.dispatchEvent(event)) e.preventDefault();
  }
}

customElements.define('pastis-tab-bar', PastisTabBar);
customElements.define('pastis-tab-bar-item', PastisTabBarItem);

import { LitElement, html, css, nothing } from 'lit';
import '../icon/pastis-icon.js';

/**
 * Sidebar: the column of a desktop app's navigation, filling its parent's height. Put it in the
 * `sidebar` slot of `<pastis-app-layout>` (which supplies the `nav` landmark) or in your own
 * `nav`.
 *
 * Three areas: a `header` (a search field, an "Add item" button), the scrolling list of
 * `<pastis-sidebar-item>`s and `<pastis-sidebar-section>`s (the default slot, in a `role="list"`
 * named by `label`), and a `footer` pinned to the bottom (a sync status).
 *
 * @slot header - Above the list: search, a primary action
 * @slot - `<pastis-sidebar-item>` and `<pastis-sidebar-section>` elements
 * @slot footer - Pinned below the list
 * @csspart header - The header wrapper
 * @csspart list - The scrolling `role="list"`
 * @csspart footer - The footer wrapper
 */
export class PastisSidebar extends LitElement {
  static properties = {
    /** Accessible name of the list of items (e.g. “Views and lists”). */
    label: { type: String },
    _filled: { state: true },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      height: 100%;
      min-height: 0;
      background: var(--bg-secondary, #16110d);
      color: var(--text-primary, #f4eee3);
      font-family: var(--font-family-body, sans-serif);
    }
    :host([hidden]) { display: none; }

    .header, .footer {
      flex: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 8px);
      padding: var(--space-sm, 8px);
    }
    .header:not(.filled), .footer:not(.filled) { display: none; }
    .footer { border-top: var(--border-width, 1px) solid var(--border-subtle, #221c17); }

    .list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      display: flex;
      flex-direction: column;
      padding: var(--space-xs, 4px) var(--space-sm, 8px) var(--space-sm, 8px);
    }
  `;

  constructor() {
    super();
    this._filled = { header: false, footer: false };
  }

  render() {
    return html`
      <div class="header ${this._filled.header ? 'filled' : ''}" part="header">
        <slot name="header" @slotchange=${this._onSlotChange}></slot>
      </div>
      <div class="list" part="list" role="list" aria-label=${this.label || nothing}><slot></slot></div>
      <div class="footer ${this._filled.footer ? 'filled' : ''}" part="footer">
        <slot name="footer" @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }

  _onSlotChange(e) {
    const slot = e.target;
    this._filled = { ...this._filled, [slot.name]: slot.assignedNodes({ flatten: true }).length > 0 };
  }
}

/**
 * A collapsible group in a `<pastis-sidebar>`: a heading button (“Personal”, “Tags”) with
 * `aria-expanded`, and its items as a nested list named by the label.
 *
 * Clicking the heading fires a cancelable `pastis-toggle { collapsed }` with the new value;
 * `collapsed` only changes when it is not cancelled, so an app can keep the section controlled
 * (cancel it, store the choice, set `collapsed` itself).
 *
 * @slot - `<pastis-sidebar-item>` elements
 * @slot trailing - An action beside the heading (an “Add list” button)
 * @fires pastis-toggle - The user folded or unfolded the section, detail { collapsed }. Cancelable.
 * @csspart heading - The heading button
 * @csspart items - The nested list
 */
export class PastisSidebarSection extends LitElement {
  static properties = {
    /** The heading's text, and the name of the nested list. */
    label: { type: String },
    /** Folded: only the heading shows. */
    collapsed: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; margin-block-start: var(--space-sm, 8px); }
    :host([hidden]) { display: none; }

    .head { display: flex; align-items: center; gap: var(--space-xs, 4px); }

    .heading {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--space-xs, 4px);
      box-sizing: border-box;
      min-height: calc(var(--space-lg, 24px) + var(--space-xs, 4px));
      margin: 0;
      padding: 0 var(--space-sm, 8px);
      border: 0;
      border-radius: var(--radius-md, 6px);
      background: none;
      color: var(--text-tertiary, #a39b90);
      font-family: inherit;
      font-size: var(--font-size-caption, 12px);
      font-weight: var(--font-weight-semibold, 600);
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      line-height: var(--line-height-caption, 1.4);
      text-align: start;
      text-transform: uppercase;
      cursor: pointer;
    }
    .heading:hover { color: var(--text-primary, #f4eee3); }
    .heading:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -2px;
    }

    .label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .chevron { flex: none; display: inline-flex; transition: transform var(--transition-fast, 120ms ease); }
    :host([collapsed]) .chevron { transform: rotate(-90deg); }

    .items { display: flex; flex-direction: column; }
    .items[hidden] { display: none; }

    ::slotted([slot="trailing"]) { flex: none; }

    @media (prefers-reduced-motion: reduce) {
      .chevron { transition: none; }
    }
  `;

  constructor() {
    super();
    this.collapsed = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  render() {
    return html`
      <div class="head">
        <button
          class="heading"
          part="heading"
          type="button"
          aria-expanded=${this.collapsed ? 'false' : 'true'}
          aria-controls="items"
          @click=${this._onToggle}
        >
          <span class="chevron" aria-hidden="true"><pastis-icon name="chevron-down" size="sm"></pastis-icon></span>
          <span class="label">${this.label}</span>
        </button>
        <slot name="trailing"></slot>
      </div>
      <div id="items" class="items" part="items" role="list" aria-label=${this.label || nothing} ?hidden=${this.collapsed}>
        <slot></slot>
      </div>
    `;
  }

  _onToggle() {
    const collapsed = !this.collapsed;
    const event = new CustomEvent('pastis-toggle', {
      detail: { collapsed },
      bubbles: true, composed: true, cancelable: true,
    });
    if (this.dispatchEvent(event)) this.collapsed = collapsed;
  }
}

/**
 * One destination in a `<pastis-sidebar>`: a compact link row (32 px) with an icon, a label
 * (one line, ellipsis) and a count. `current` marks the current page (`aria-current="page"`,
 * highlighted). The whole row is the link; the `trailing` slot holds an action beside it.
 *
 * A plain click fires a cancelable `pastis-navigate { href }` first (as `pastis-tab-bar` and
 * `pastis-list-row`): a client-side router cancels it and navigates itself; otherwise the link
 * is followed. Clicks with a modifier key are left to the browser.
 *
 * The count is hidden when empty, null or 0. When shown it is part of the link's name: the
 * label, a comma and `count-label` (“Today, 3 items due”), or the count itself (“Today, 3”).
 *
 * @slot trailing - An action at the end of the row (a “More” button)
 * @fires pastis-navigate - A plain click on the link, detail { href }. Cancelable.
 * @csspart link - The `<a>` element
 * @csspart icon - The icon
 * @csspart label - The label
 * @csspart count - The count
 */
export class PastisSidebarItem extends LitElement {
  static properties = {
    /** Destination URL. */
    href: { type: String },
    /** Icon name from the Pastis set (see `pastis-icon`). */
    icon: { type: String },
    /** A short glyph instead of an icon (such as `#` for a tag). */
    marker: { type: String },
    /** The row's text, and the link's name. */
    label: { type: String },
    /** A number at the end (open items). Hidden when empty, null or 0. */
    count: { type: Number },
    /** What the count means, for the link's name (“3 items due”). Defaults to the count. */
    countLabel: { type: String, attribute: 'count-label' },
    /** The current page: `aria-current="page"` and the highlighted background. */
    current: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }

    .wrap {
      display: flex;
      align-items: center;
      border-radius: var(--radius-md, 6px);
    }
    .wrap:hover { background: var(--bg-elevated, #2a231d); }
    :host([current]) .wrap { background: var(--bg-elevated, #2a231d); }

    a {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--space-sm, 8px);
      box-sizing: border-box;
      min-height: var(--space-xl, 32px);
      padding: 0 var(--space-sm, 8px);
      border-radius: var(--radius-md, 6px);
      color: var(--text-secondary, #d8d0c4);
      font-family: inherit;
      font-size: var(--font-size-body-sm, 14px);
      line-height: var(--line-height-body-sm, 1.5);
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
    }
    a:not([href]) { cursor: pointer; }
    a:hover { color: var(--text-primary, #f4eee3); }
    :host([current]) a {
      color: var(--text-primary, #f4eee3);
      font-weight: var(--font-weight-semibold, 600);
    }
    a:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -2px;
    }

    .lead { flex: none; display: inline-flex; width: var(--space-md, 16px); justify-content: center; }
    :host([current]) .lead { color: var(--text-accent, #fcba28); }
    .marker { font-family: var(--font-family-mono, monospace); }

    .label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .count {
      flex: none;
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-caption, 12px);
      color: var(--text-tertiary, #a39b90);
    }

    ::slotted([slot="trailing"]) { flex: none; margin-inline-end: var(--space-xs, 4px); }
  `;

  constructor() {
    super();
    this.current = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  willUpdate(changed) {
    if (!this.href && (!this.hasUpdated || changed.has('href'))) {
      console.warn(`pastis-sidebar-item: "${this.label ?? ''}" has no href; it is rendered as role="link" with tabindex="0"`);
    }
  }

  get _hasCount() {
    return this.count !== undefined && this.count !== null && String(this.count) !== '' && Number(this.count) !== 0;
  }

  render() {
    const count = this._hasCount;
    const lead = this.icon
      ? html`<span class="lead" aria-hidden="true"><pastis-icon part="icon" name=${this.icon} size="sm"></pastis-icon></span>`
      : this.marker
        ? html`<span class="lead marker" aria-hidden="true">${this.marker}</span>`
        : nothing;
    return html`
      <div class="wrap">
        <a
          part="link"
          href=${this.href || nothing}
          role=${this.href ? nothing : 'link'}
          tabindex=${this.href ? nothing : '0'}
          aria-current=${this.current ? 'page' : nothing}
          aria-label=${count ? `${this.label ?? ''}, ${this.countLabel || this.count}` : nothing}
          @click=${this._onClick}
          @keydown=${this._onKeydown}
        >
          ${lead}
          <span class="label" part="label">${this.label}</span>
          ${count ? html`<span class="count" part="count" aria-hidden="true">${this.count}</span>` : nothing}
        </a>
        <slot name="trailing"></slot>
      </div>
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

customElements.define('pastis-sidebar', PastisSidebar);
customElements.define('pastis-sidebar-section', PastisSidebarSection);
customElements.define('pastis-sidebar-item', PastisSidebarItem);

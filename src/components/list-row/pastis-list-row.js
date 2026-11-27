import { LitElement, html, css, nothing } from 'lit';
import '../icon/pastis-icon.js';

/**
 * List group: the grouped card rows sit in (rounded, on the card surface). Presentational: give
 * the element that holds the rows `role="list"` and a name, the group itself or a
 * `<pastis-sortable role="list">` inside it.
 *
 * @slot - The rows (`<pastis-list-row>`), or a sortable holding them
 */
export class PastisListGroup extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      overflow: hidden;
    }
    :host([hidden]) { display: none; }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

/**
 * List row: one row of a grouped list, at least 44 px high. A link when it has an `href`
 * (navigation rows: an icon or marker, a label, a trailing count), else static (entries with a
 * trailing action, such as Restore). The host is a `listitem`.
 *
 * A plain click on the link fires a cancelable `pastis-navigate` first (as `pastis-tab-bar`): a
 * client-side router cancels it and navigates itself; otherwise the link is followed. Clicks with
 * a modifier key are left to the browser.
 *
 * @slot trailing - An action at the end of the row (a button, a reorder handle)
 * @fires pastis-navigate - A plain click on the link, detail { href }. Cancelable.
 * @csspart row - The link or the static row
 */
export class PastisListRow extends LitElement {
  static properties = {
    /** The row's text, as written. */
    label: { type: String },
    /** Makes the row a link to this URL. */
    href: { type: String },
    /** An icon from the Pastis set before the label. */
    icon: { type: String },
    /** A short glyph before the label instead of an icon (such as `#` for a tag). */
    marker: { type: String },
    /** A number at the end (such as open items); shown, left out of the name. */
    count: { type: Number },
    /** A second line under the label (such as "in Groceries"). */
    meta: { type: String },
    /** The link's accessible name when the label alone is not enough ("Inbox, 3 open items"). */
    linkLabel: { type: String, attribute: 'link-label' },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
    :host(:not(:last-child)) .row { border-bottom: var(--border-width, 1px) solid var(--border-subtle, #383c44); }

    .row {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 8px);
      min-height: 44px;
      padding: var(--space-xs, 4px) var(--space-md, 16px);
      box-sizing: border-box;
      color: var(--text-primary, #f9f4da);
      text-decoration: none;
      font-family: var(--font-family-sans, system-ui, sans-serif);
      font-size: var(--font-size-body, 16px);
    }

    a.row:hover { background: var(--bg-elevated, #383c44); }
    a.row:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -2px;
    }

    .lead { flex: none; display: inline-flex; width: 20px; justify-content: center; }
    pastis-icon { color: var(--text-accent, #fcba28); }
    .marker { font-family: var(--font-family-mono, 'Fira Code', monospace); color: var(--text-secondary, #fff); }

    .text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .label { overflow-wrap: anywhere; }
    .meta {
      font-size: var(--font-size-caption, 12px);
      color: var(--text-tertiary, #909498);
      overflow-wrap: anywhere;
    }

    .count {
      flex: none;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      color: var(--text-tertiary, #909498);
    }

    .wrap { display: flex; align-items: center; }
    .wrap > .row { flex: 1; min-width: 0; }
    ::slotted([slot="trailing"]) { flex: none; margin-inline-end: var(--space-sm, 8px); }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  render() {
    const lead = this.icon
      ? html`<span class="lead" aria-hidden="true"><pastis-icon name=${this.icon}></pastis-icon></span>`
      : this.marker
        ? html`<span class="lead marker" aria-hidden="true">${this.marker}</span>`
        : '';
    const content = html`
      ${lead}
      <span class="text">
        <span class="label">${this.label}</span>
        ${this.meta ? html`<span class="meta">${this.meta}</span>` : ''}
      </span>
      ${this.count != null ? html`<span class="count" aria-hidden=${this.linkLabel ? 'true' : nothing}>${this.count}</span>` : ''}
    `;
    const row = this.href
      ? html`<a class="row" part="row" href=${this.href} aria-label=${this.linkLabel || nothing} @click=${this._onClick}>${content}</a>`
      : html`<div class="row" part="row">${content}</div>`;
    return html`<div class="wrap">${row}<slot name="trailing"></slot></div>`;
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

customElements.define('pastis-list-group', PastisListGroup);
customElements.define('pastis-list-row', PastisListRow);

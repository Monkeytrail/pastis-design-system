import { LitElement, html, css } from "lit";

export class PastisCard extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    padding: { type: String, reflect: true },
    hoverable: { type: Boolean, reflect: true },
    clickable: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
      overflow: hidden;
      transition:
        box-shadow 120ms ease,
        transform 120ms ease;
      font-family: var(--font-family-mono, "Fira Code", monospace);
      padding: 16px;
    }

    :host([variant="elevated"]) .card {
      border-color: var(--text-primary, #f9f4da);
    }

    :host([variant="outlined"]) .card {
      box-shadow: none;
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
    }

    :host([variant="ghost"]) .card {
      background: var(--bg-primary, #0d0d0d);
      border-color: var(--text-tertiary, #909498);
    }

    :host([hoverable]) .card:hover,
    :host([clickable]) .card:hover {
      box-shadow: var(--shadow-md, 5px 5px 0 #231f20);
      transform: translate(-2px, -2px);
    }

    :host([clickable]) .card {
      cursor: pointer;
      width: 100%;
      text-align: left;
    }

    :host([clickable]) .card:active {
      transform: translate(2px, 2px);
      box-shadow: 4px 4px 0 var(--action-secondary, #fc7428);
    }

    button.card {
      appearance: none;
      -webkit-appearance: none;
    }

    button.card:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    :host([selected]) .card {
      border-color: var(--action-primary, #fcba28);
    }

    .card-header {
      padding: 16px;
    }

    .card-body {
      color: var(--text-secondary, #fff);
      font-size: 14px;
    }

    :host([padding="sm"]) .card-header {
      padding: 12px 12px 0;
    }
    :host([padding="sm"]) .card-body {
      padding: 12px;
    }
    :host([padding="lg"]) .card-header {
      padding: 28px 28px 0;
    }
    :host([padding="lg"]) .card-body {
      padding: 28px;
    }
    :host([padding="none"]) .card-header {
      padding: 0;
    }
    :host([padding="none"]) .card-body {
      padding: 0;
    }

    .card-footer {
      padding: 16px 24px;
      border-top: var(--border-width, 1px) solid var(--border-default, #383c44);
      background: var(--bg-primary, #0d0d0d);
    }

    :host([padding="sm"]) .card-footer {
      padding: 8px 16px;
    }
    :host([padding="lg"]) .card-footer {
      padding: 16px 24px;
    }

    slot[name="header"]::slotted(*) {
      margin: 0;
      font-family: var(--font-family-mono, "Fira Code", monospace);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
    }

    slot[name="media"]::slotted(*) {
      display: block;
      width: 100%;
    }

    /* ── Cover variant ─────────────────────────────────────────── */

    :host([variant="cover"]) .card {
      position: relative;
      min-height: var(--card-cover-min-height, 320px);
      padding: 0;
      border-color: var(--border-default, #383c44);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .cover-bg {
      display: none;
    }

    :host([variant="cover"]) .cover-bg {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      border-radius: inherit;
    }

    :host([variant="cover"]) .cover-bg::slotted(*),
    :host([variant="cover"]) slot[name="media"]::slotted(*) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    :host([variant="cover"]) .cover-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      border-radius: inherit;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.88) 0%,
        rgba(0, 0, 0, 0.5) 45%,
        rgba(0, 0, 0, 0.08) 100%
      );
    }

    .cover-overlay {
      display: none;
    }

    :host([variant="cover"]) .cover-content {
      position: relative;
      z-index: 2;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cover-content {
      display: none;
    }

    :host([variant="cover"]) .cover-content .card-header {
      padding: 0;
    }

    :host([variant="cover"]) .cover-content .card-body {
      color: rgba(255, 255, 255, 0.75);
      font-size: 13px;
    }

    :host([variant="cover"]) .cover-content .card-footer {
      padding: 16px 0 0;
      background: none;
      border-top-color: rgba(255, 255, 255, 0.15);
    }

    :host([variant="cover"]) slot[name="header"]::slotted(*) {
      color: var(--text-primary, #f9f4da);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
    }

    :host([variant="cover"][hoverable]) .card:hover,
    :host([variant="cover"][clickable]) .card:hover {
      transform: translate(-2px, -2px);
      box-shadow: var(--shadow-md, 5px 5px 0 #231f20);
    }
  `;

  constructor() {
    super();
    this.variant = "default";
    this.padding = "md";
    this.hoverable = false;
    this.clickable = false;
    this.selected = false;
  }

  render() {
    if (this.variant === 'cover') {
      const coverInner = html`
        <div class="cover-bg"><slot name="media"></slot></div>
        <div class="cover-overlay"></div>
        <div class="cover-content">
          <slot name="header" class="card-header"></slot>
          <div class="card-body"><slot></slot></div>
          <slot name="footer" class="card-footer"></slot>
        </div>
      `;
      if (this.clickable) {
        return html`
          <button class="card" part="card" aria-pressed="${this.selected}" @click="${this._handleClick}">
            ${coverInner}
          </button>
        `;
      }
      return html`
        <div class="card" part="card" aria-selected="${this.selected || undefined}">
          ${coverInner}
        </div>
      `;
    }
    if (this.clickable) {
      return html`
        <button
          class="card"
          part="card"
          aria-pressed="${this.selected}"
          @click="${this._handleClick}"
        >
          <slot name="media"></slot>
          <slot name="header" class="card-header"></slot>
          <div class="card-body">
            <slot></slot>
          </div>
          <slot name="footer" class="card-footer"></slot>
        </button>
      `;
    }
    return html`
      <div
        class="card"
        part="card"
        aria-selected="${this.selected || undefined}"
      >
        <slot name="media"></slot>
        <slot name="header" class="card-header"></slot>
        <div class="card-body">
          <slot></slot>
        </div>
        <slot name="footer" class="card-footer"></slot>
      </div>
    `;
  }

  _handleClick() {
    if (!this.clickable) return;
    this.dispatchEvent(
      new CustomEvent("pastis-click", { bubbles: true, composed: true }),
    );
  }
}

customElements.define("pastis-card", PastisCard);

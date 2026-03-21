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
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
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
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
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
      border-top: var(--border-width, 1px) solid var(--border-default, #fcba28);
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

  _handleKeydown(e) {
    if (!this.clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleClick();
    }
  }
}

customElements.define("pastis-card", PastisCard);

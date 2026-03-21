import { LitElement, html, css } from 'lit';

export class PastisCard extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    padding: { type: String, reflect: true },
    hoverable: { type: Boolean, reflect: true },
    clickable: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; }

    .card {
      background: var(--bg-card, #0A0A0F);
      border: 4px solid var(--border-default, #00FF41);
      border-radius: 0;
      overflow: hidden;
      transition: box-shadow 50ms, transform 50ms;
      font-family: var(--font-family, 'Courier New', monospace);
    }

    :host([variant="elevated"]) .card {
      border-color: var(--text-primary, #00FF41);
    }

    :host([variant="outlined"]) .card {
      box-shadow: none;
      border: 4px solid var(--border-default, #00FF41);
    }

    :host([variant="ghost"]) .card {
      background: var(--bg-primary, #000);
      border-color: var(--text-tertiary, #808080);
    }

    /* card border is green → hover shadow is cyan */
    :host([hoverable]) .card:hover,
    :host([clickable]) .card:hover {
      box-shadow: 8px 8px 0 var(--action-secondary, #00FFFF);
      transform: translate(-2px, -2px);
    }

    :host([clickable]) .card {
      cursor: pointer;
    }

    :host([clickable]) .card:active {
      transform: translate(2px, 2px);
      box-shadow: 4px 4px 0 var(--action-secondary, #00FFFF);
    }

    :host([selected]) .card {
      border-color: var(--action-primary, #00FF41);
    }

    .card-header {
      padding: 20px 20px 0;
    }

    .card-body {
      padding: 20px;
      color: var(--text-secondary, #fff);
      font-size: 14px;
    }

    :host([padding="sm"]) .card-header { padding: 12px 12px 0; }
    :host([padding="sm"]) .card-body { padding: 12px; }
    :host([padding="lg"]) .card-header { padding: 28px 28px 0; }
    :host([padding="lg"]) .card-body { padding: 28px; }
    :host([padding="none"]) .card-header { padding: 0; }
    :host([padding="none"]) .card-body { padding: 0; }

    .card-footer {
      padding: 12px 20px;
      border-top: 4px solid var(--border-default, #00FF41);
      background: var(--bg-primary, #000);
    }

    :host([padding="sm"]) .card-footer { padding: 8px 12px; }
    :host([padding="lg"]) .card-footer { padding: 16px 28px; }

    slot[name="header"]::slotted(*) {
      margin: 0;
      font-family: var(--font-family, 'Courier New', monospace);
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--text-primary, #00FF41);
    }

    slot[name="media"]::slotted(*) {
      display: block;
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.variant = 'default';
    this.padding = 'md';
    this.hoverable = false;
    this.clickable = false;
    this.selected = false;
  }

  render() {
    return html`
      <div
        class="card"
        part="card"
        role="${this.clickable ? 'button' : undefined}"
        tabindex="${this.clickable ? '0' : undefined}"
        @click="${this._handleClick}"
        @keydown="${this._handleKeydown}"
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
    this.dispatchEvent(new CustomEvent('pastis-click', { bubbles: true, composed: true }));
  }

  _handleKeydown(e) {
    if (!this.clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick();
    }
  }
}

customElements.define('pastis-card', PastisCard);

import { LitElement, html, css } from 'lit';

export class PastisAlert extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    title: { type: String },
    dismissible: { type: Boolean, reflect: true },
    visible: { type: Boolean, reflect: true },
    icon: { type: String },
  };

  static styles = css`
    :host { display: block; }
    :host([visible="false"]) { display: none; }

    .alert {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-md, 6px);
      border: var(--border-width, 1px) solid currentColor;
      border-left: 4px solid currentColor;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      background: var(--bg-primary, #0d0d0d);
    }

    :host([variant="success"]) .alert {
      color: var(--status-success, #fcba28);
    }

    :host([variant="warning"]) .alert {
      color: var(--status-warning, #fcba28);
    }

    :host([variant="error"]) .alert {
      color: var(--status-error, #ed203d);
    }

    :host([variant="info"]) .alert,
    :host(:not([variant])) .alert {
      color: var(--status-info, #fc7428);
    }

    .alert-icon {
      font-size: 18px;
      flex-shrink: 0;
      line-height: 1.4;
    }

    .alert-content {
      flex: 1;
      min-width: 0;
    }

    .alert-title {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      margin: 0 0 4px;
      color: inherit;
    }

    .alert-body {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      color: var(--text-secondary, #fff);
      margin: 0;
    }

    .dismiss-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      font-size: 16px;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      align-self: flex-start;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }
    .dismiss-btn:focus-visible { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.variant = 'info';
    this.dismissible = false;
    this.visible = true;
  }

  _getIcon() {
    if (this.icon) return this.icon;
    const icons = { success: '✓', warning: '⚠', error: '✕', info: 'ℹ' };
    return icons[this.variant] || 'ℹ';
  }

  render() {
    if (!this.visible) return html``;

    return html`
      <div class="alert" role="alert" part="alert">
        <span class="alert-icon" aria-hidden="true">${this._getIcon()}</span>
        <div class="alert-content">
          ${this.title ? html`<p class="alert-title">${this.title}</p>` : ''}
          <div class="alert-body"><slot></slot></div>
        </div>
        ${this.dismissible ? html`
          <button class="dismiss-btn" @click="${this._dismiss}" aria-label="Dismiss">✕</button>
        ` : ''}
      </div>
    `;
  }

  _dismiss() {
    this.visible = false;
    this.dispatchEvent(new CustomEvent('pastis-dismiss', { bubbles: true, composed: true }));
  }
}

customElements.define('pastis-alert', PastisAlert);

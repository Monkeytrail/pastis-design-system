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
      border-radius: 0;
      border: 4px solid currentColor;
      border-left: 8px solid currentColor;
      font-family: var(--font-family, 'Courier New', monospace);
      background: var(--bg-primary, #000);
    }

    :host([variant="success"]) .alert {
      color: var(--status-success, #00FF41);
    }

    :host([variant="warning"]) .alert {
      color: var(--status-warning, #FFE600);
    }

    :host([variant="error"]) .alert {
      color: var(--status-error, #FF006E);
    }

    :host([variant="info"]) .alert,
    :host(:not([variant])) .alert {
      color: var(--status-info, #00FFFF);
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
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 4px;
      color: inherit;
    }

    .alert-body {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      color: var(--text-secondary, #fff);
      margin: 0;
    }

    .dismiss-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      font-size: 16px;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      align-self: flex-start;
      transition: opacity 50ms;
      font-family: var(--font-family, 'Courier New', monospace);
    }

    .dismiss-btn:hover { opacity: 1; }
    .dismiss-btn:focus-visible { outline: 4px solid var(--border-focus, #00FF41); outline-offset: 2px; }
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

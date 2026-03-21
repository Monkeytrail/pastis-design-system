import { LitElement, html, css } from 'lit';

export class PastisButton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    href: { type: String },
  };

  static styles = css`
    :host { display: inline-block; }

    button, a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: 4px solid var(--action-primary, #00FF41);
      border-radius: 0;
      cursor: pointer;
      text-decoration: none;
      transition: box-shadow 50ms, transform 50ms;
      white-space: nowrap;
      background: var(--bg-primary, #000);
      color: var(--action-primary, #00FF41);
    }

    button:hover, a:hover { box-shadow: 6px 6px 0 var(--action-secondary, #00FFFF); }
    button:active, a:active { transform: translate(2px, 2px); box-shadow: 4px 4px 0 var(--action-secondary, #00FFFF); }

    :host([size="sm"]) button, :host([size="sm"]) a { font-size: 12px; padding: 0 12px; height: 32px; }
    :host([size="lg"]) button, :host([size="lg"]) a { font-size: 18px; padding: 0 24px; height: 56px; }
    button, a { font-size: 14px; padding: 0 16px; height: 48px; }

    :host([variant="primary"]) button,
    :host(:not([variant])) button {
      background: var(--action-primary, #00FF41);
      color: var(--action-primary-text, #000);
      border-color: var(--action-primary, #00FF41);
    }
    /* primary (green) → cyan shadow */
    :host([variant="primary"]) button:hover,
    :host(:not([variant])) button:hover {
      box-shadow: 6px 6px 0 var(--action-secondary, #00FFFF);
    }
    :host([variant="primary"]) button:active,
    :host(:not([variant])) button:active {
      transform: translate(2px, 2px);
      box-shadow: 4px 4px 0 var(--action-secondary, #00FFFF);
    }

    :host([variant="secondary"]) button {
      background: var(--bg-primary, #000);
      color: var(--action-secondary, #00FFFF);
      border-color: var(--action-secondary, #00FFFF);
    }
    /* secondary (cyan) → green shadow */
    :host([variant="secondary"]) button:hover { box-shadow: 6px 6px 0 var(--action-primary, #00FF41); }

    :host([variant="ghost"]) button {
      background: transparent;
      color: var(--text-tertiary, #808080);
      border-color: var(--action-ghost-border, #808080);
    }
    /* ghost (gray) → primary green shadow */
    :host([variant="ghost"]) button:hover { box-shadow: 6px 6px 0 var(--action-primary, #00FF41); }

    :host([variant="destructive"]) button {
      background: var(--action-destructive, #FF006E);
      color: var(--action-destructive-text, #FFFFFF);
      border-color: var(--action-destructive, #FF006E);
    }
    /* destructive (pink) → yellow shadow */
    :host([variant="destructive"]) button:hover { box-shadow: 6px 6px 0 var(--action-warning, #FFE600); }

    :host([disabled]) button {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
      box-shadow: none;
    }

    .spinner {
      width: 14px; height: 14px;
      border: 3px solid currentColor;
      border-top-color: transparent;
      border-radius: 0;
      animation: spin 0.4s steps(8) infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    button:focus-visible, a:focus-visible {
      outline: 4px solid var(--border-focus, #00FF41);
      outline-offset: 2px;
    }
  `;

  constructor() {
    super();
    this.variant = 'primary';
    this.size = 'md';
    this.disabled = false;
    this.loading = false;
  }

  render() {
    return html`
      <button
        ?disabled=${this.disabled || this.loading}
        @click=${this._handleClick}
        aria-busy=${this.loading}
        part="button"
      >
        ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : ''}
        <slot></slot>
      </button>
    `;
  }

  _handleClick(e) {
    if (this.disabled || this.loading) { e.preventDefault(); e.stopPropagation(); return; }
    this.dispatchEvent(new CustomEvent('pastis-click', { bubbles: true, composed: true }));
  }
}

customElements.define('pastis-button', PastisButton);

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
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      border-radius: var(--radius-2xl, 24px);
      cursor: pointer;
      text-decoration: none;
      transition: box-shadow 120ms ease, transform 80ms ease;
      white-space: nowrap;
      background: var(--bg-primary, #0d0d0d);
      color: var(--action-primary, #fcba28);
    }

    button:hover, a:hover { box-shadow: var(--shadow-md, 5px 5px 0 #231f20); }
    button:active, a:active { transform: translate(2px, 2px); box-shadow: var(--shadow-sm, 3px 3px 0 #262522); }

    :host([size="sm"]) button, :host([size="sm"]) a { font-size: 12px; padding: 0 12px; height: 32px; }
    :host([size="lg"]) button, :host([size="lg"]) a { font-size: 18px; padding: 0 24px; height: 56px; }
    button, a { font-size: 14px; padding: 0 16px; height: 40px; }

    :host([variant="primary"]) button,
    :host(:not([variant])) button {
      background: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
      border-color: var(--action-primary, #fcba28);
    }
    :host([variant="primary"]) button:hover,
    :host(:not([variant])) button:hover {
      box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428);
    }
    :host([variant="primary"]) button:active,
    :host(:not([variant])) button:active {
      transform: translate(2px, 2px);
      box-shadow: var(--shadow-lg, 5px 5px 0 #fcba28);
    }

    :host([variant="secondary"]) button {
      background: var(--bg-primary, #0d0d0d);
      color: var(--action-secondary, #fc7428);
      border-color: var(--action-secondary, #fc7428);
    }
    :host([variant="secondary"]) button:hover { box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428); }

    :host([variant="ghost"]) button {
      background: transparent;
      color: var(--text-primary, #f9f4da);
      border-color: var(--action-ghost-border, #383c44);
    }
    :host([variant="ghost"]) button:hover { box-shadow: var(--shadow-md, 5px 5px 0 #231f20); }

    :host([variant="destructive"]) button {
      background: var(--action-destructive, #ed203d);
      color: var(--action-destructive-text, #000000);
      border-color: var(--action-destructive, #ed203d);
    }
    :host([variant="destructive"]) button:hover { box-shadow: var(--shadow-lg, 5px 5px 0 #fcba28); }

    :host([disabled]) button {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
      box-shadow: none;
    }

    .spinner {
      width: 14px; height: 14px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    button:focus-visible, a:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 3px;
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

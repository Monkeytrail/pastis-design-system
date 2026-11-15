import { LitElement, html, css } from 'lit';

export class PastisButtonSplit extends LitElement {
  static properties = {
    href:    { type: String },
    copy:    { type: String },
    variant: { type: String, reflect: true },
    size:    { type: String, reflect: true },
    _copied: { type: Boolean, state: true },
  };

  static styles = css`
    :host { display: inline-flex; }

    .split {
      display: inline-flex;
      align-items: stretch;
      border: var(--border-width, 1px) solid var(--action-ghost-border, #383c44);
      border-radius: var(--radius-2xl, 24px);
      overflow: hidden;
      font-family: var(--font-family-mono, monospace);
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
      transition: box-shadow 120ms ease;
    }

    .split:focus-within {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 3px;
    }

    .split:hover { box-shadow: var(--shadow-md, 5px 5px 0 #231f20); }

    .main, .action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      height: 40px;
      cursor: pointer;
      background: transparent;
      color: var(--text-primary, #f9f4da);
      border: none;
      text-decoration: none;
      transition: background 120ms ease, color 120ms ease;
    }

    :host([size="sm"]) .main,
    :host([size="sm"]) .action { font-size: 12px; padding: 0 12px; height: 32px; }

    :host([size="lg"]) .main,
    :host([size="lg"]) .action { font-size: 18px; padding: 0 24px; height: 56px; }

    .main:hover, .action:hover {
      background: var(--text-primary, #f9f4da);
      color: var(--bg-primary, #0d0d0d);
    }

    .action:active { transform: translate(1px, 1px); }

    .divider {
      width: 1px;
      background: var(--action-ghost-border, #383c44);
      flex-shrink: 0;
    }

    .main:focus-visible, .action:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -2px;
    }
  `;

  constructor() {
    super();
    this.variant = 'ghost';
    this._copied = false;
  }

  async _handleCopy() {
    if (this.copy) {
      try { await navigator.clipboard.writeText(this.copy); } catch { /* ignore */ }
      this._copied = true;
      setTimeout(() => { this._copied = false; }, 2000);
    }
    this.dispatchEvent(new CustomEvent('pastis-copy', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="split" role="group">
        ${this.href ? html`
          <a class="main" href=${this.href} part="main">
            <slot></slot>
          </a>
        ` : html`
          <span class="main" part="main"><slot></slot></span>
        `}
        <div class="divider" aria-hidden="true"></div>
        <button class="action" part="action" @click=${this._handleCopy}
          aria-label=${this._copied ? 'Copied' : 'Copy to clipboard'}>
          ${this._copied ? '✓' : html`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="4" y="1" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.25"/><path d="M1 5v8h8" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
        </button>
      </div>
    `;
  }
}

customElements.define('pastis-button-split', PastisButtonSplit);

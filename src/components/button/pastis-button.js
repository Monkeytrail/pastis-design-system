import { LitElement, html, css, nothing } from 'lit';

export class PastisButton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    href: { type: String },       // renders a link instead of a button
    target: { type: String },
    copy: { type: String },       // value to copy to clipboard on click
    _copied: { type: Boolean, state: true },
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
      transition: box-shadow 120ms ease, transform 80ms ease,
                  background var(--duration-fast, 120ms) var(--ease-standard, ease),
                  color      var(--duration-fast, 120ms) var(--ease-standard, ease),
                  border-color var(--duration-fast, 120ms) var(--ease-standard, ease);
      white-space: nowrap;
      background: var(--bg-primary, #0d0d0d);
      color: var(--action-primary, #fcba28);
    }

    button:hover, a:hover { box-shadow: var(--shadow-md, 5px 5px 0 #231f20); }
    button:active, a:active { transform: translate(2px, 2px); box-shadow: var(--shadow-sm, 3px 3px 0 #262522); }

    :host([size="sm"]) button, :host([size="sm"]) a { font-size: 12px; padding: 0 12px; height: 32px; }
    :host([size="lg"]) button, :host([size="lg"]) a { font-size: 18px; padding: 0 24px; height: 56px; }
    button, a { font-size: 14px; padding: 0 16px; height: 40px; }

    :host([variant="primary"]) :is(button, a),
    :host(:not([variant])) :is(button, a) {
      background: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
      border-color: var(--action-primary, #fcba28);
    }
    :host([variant="primary"]) :is(button, a):hover,
    :host(:not([variant])) :is(button, a):hover {
      box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428);
    }
    :host([variant="primary"]) :is(button, a):active,
    :host(:not([variant])) :is(button, a):active {
      transform: translate(2px, 2px);
      box-shadow: var(--shadow-lg, 5px 5px 0 #fcba28);
    }

    :host([variant="secondary"]) :is(button, a) {
      background: var(--bg-primary, #0d0d0d);
      color: var(--action-secondary, #fc7428);
      border-color: var(--action-secondary, #fc7428);
    }
    :host([variant="secondary"]) :is(button, a):hover { box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428); }

    :host([variant="ghost"]) :is(button, a) {
      background: transparent;
      color: var(--text-primary, #f9f4da);
      border-color: var(--action-ghost-border, #383c44);
    }
    :host([variant="ghost"]) :is(button, a):hover {
      background: var(--text-primary, #f9f4da);
      color: var(--bg-primary, #0d0d0d);
      border-color: var(--text-primary, #f9f4da);
      box-shadow: none;
    }

    :host([variant="destructive"]) :is(button, a) {
      background: var(--action-destructive, #ed203d);
      color: var(--action-destructive-text, #000000);
      border-color: var(--action-destructive, #ed203d);
    }
    :host([variant="destructive"]) :is(button, a):hover { box-shadow: var(--shadow-lg, 5px 5px 0 #fcba28); }

    :host([disabled]) :is(button, a) {
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
    this._copied = false;
  }

  render() {
    const content = html`
      ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : ''}
      ${this.copy ? (this._copied ? '✓ Copied' : html`<slot></slot>`) : html`<slot></slot>`}
    `;

    // A link when href is set (and it isn't a copy button), so it never has to be nested in an <a>
    if (this.href && !this.copy) {
      const unavailable = this.disabled || this.loading;
      return html`
        <a
          href=${unavailable ? nothing : this.href}
          target=${this.target || nothing}
          rel=${this.target === '_blank' ? 'noopener noreferrer' : nothing}
          aria-disabled=${unavailable ? 'true' : nothing}
          aria-busy=${this.loading ? 'true' : nothing}
          @click=${this._handleClick}
          part="button"
        >${content}</a>
      `;
    }

    return html`
      <button
        ?disabled=${this.disabled || this.loading}
        @click=${this._handleClick}
        aria-busy=${this.loading}
        part="button"
      >${content}</button>
    `;
  }

  async _handleClick(e) {
    if (this.disabled || this.loading) { e.preventDefault(); e.stopPropagation(); return; }
    if (this.copy) {
      try { await navigator.clipboard.writeText(this.copy); } catch { /* ignore */ }
      this._copied = true;
      setTimeout(() => { this._copied = false; }, 2000);
    }
    this.dispatchEvent(new CustomEvent('pastis-click', { bubbles: true, composed: true }));
  }
}

customElements.define('pastis-button', PastisButton);

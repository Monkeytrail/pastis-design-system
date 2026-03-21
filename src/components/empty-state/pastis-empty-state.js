import { LitElement, html, css } from 'lit';

export class PastisEmptyState extends LitElement {
  static properties = {
    icon:      { type: String },
    heading:   { type: String },
    body:      { type: String },
    cta:       { type: String },
    ctaSecondary: { type: String },
    variant:   { type: String, reflect: true }, // 'default' | 'search' | 'error' | 'loading'
  };

  static styles = css`
    :host { display: block; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 32px;
      font-family: var(--font-family, 'Courier New', monospace);
      border: 4px solid var(--border-subtle, #1A1A1A);
      background: var(--bg-card, #0A0A0F);
      gap: 16px;
    }

    .icon-wrap {
      font-size: 48px;
      line-height: 1;
      opacity: 0.6;
    }

    .heading {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-primary, #00FF41);
      margin: 0;
    }

    .body {
      font-size: 13px;
      color: var(--text-tertiary, #808080);
      max-width: 320px;
      line-height: 1.6;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 4px;
    }

    .cta-primary {
      background: var(--action-primary, #00FF41);
      color: var(--action-primary-text, #000);
      border: 4px solid var(--action-primary, #00FF41);
      padding: 0 20px;
      height: 44px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: box-shadow 50ms;
    }
    /* primary CTA is green → hover shadow is cyan */
  .cta-primary:hover { box-shadow: 4px 4px 0 var(--action-secondary, #00FFFF); filter: brightness(0.9); }

    .cta-secondary {
      background: transparent;
      color: var(--text-tertiary, #808080);
      border: 4px solid var(--action-ghost-border, #808080);
      padding: 0 20px;
      height: 44px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: box-shadow 50ms;
    }
    /* secondary CTA is gray → hover shadow is green */
  .cta-secondary:hover { box-shadow: 4px 4px 0 var(--action-primary, #00FF41); }

    :host([variant="error"]) .heading { color: var(--status-error, #FF006E); }
    :host([variant="error"]) .empty-state { border-color: var(--status-error, #FF006E); }

    .pixel-deco {
      width: 80px;
      height: 4px;
      background: var(--border-default, #00FF41);
      opacity: 0.3;
    }
  `;

  constructor() {
    super();
    this.variant = 'default';
  }

  _getDefaultIcon() {
    const icons = { search: '🔍', error: '✕', loading: '⟳', default: '□' };
    return icons[this.variant] || icons.default;
  }

  render() {
    return html`
      <div class="empty-state" part="empty-state">
        <span class="icon-wrap" aria-hidden="true">${this.icon || this._getDefaultIcon()}</span>
        <div class="pixel-deco"></div>
        ${this.heading ? html`<h3 class="heading">${this.heading}</h3>` : ''}
        ${this.body ? html`<p class="body">${this.body}</p>` : ''}
        ${(this.cta || this.ctaSecondary) ? html`
          <div class="actions">
            ${this.cta ? html`<button class="cta-primary" @click=${() => this.dispatchEvent(new CustomEvent('pastis-cta', { bubbles: true, composed: true }))}>${this.cta}</button>` : ''}
            ${this.ctaSecondary ? html`<button class="cta-secondary" @click=${() => this.dispatchEvent(new CustomEvent('pastis-cta-secondary', { bubbles: true, composed: true }))}>${this.ctaSecondary}</button>` : ''}
          </div>
        ` : ''}
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('pastis-empty-state', PastisEmptyState);

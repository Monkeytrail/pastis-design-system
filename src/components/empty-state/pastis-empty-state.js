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
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      background: var(--bg-card, #1e1e1e);
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
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      margin: 0;
    }

    .body {
      font-size: 13px;
      color: var(--text-tertiary, #909498);
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
      background: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #000);
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      border-radius: var(--radius-md, 6px);
      padding: 0 20px;
      height: 44px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      cursor: pointer;
      transition: box-shadow 120ms ease;
    }
    /* primary CTA hover shadow */
    .cta-primary:hover { box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428); filter: brightness(0.9); }

    .cta-secondary {
      background: transparent;
      color: var(--text-tertiary, #909498);
      border: var(--border-width, 1px) solid var(--action-ghost-border, #909498);
      border-radius: var(--radius-md, 6px);
      padding: 0 20px;
      height: 44px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      cursor: pointer;
      transition: box-shadow 120ms ease;
    }
    /* secondary CTA hover shadow */
    .cta-secondary:hover { box-shadow: 4px 4px 0 var(--action-primary, #fcba28); }

    :host([variant="error"]) .heading { color: var(--status-error, #f0505e); }
    :host([variant="error"]) .empty-state { border-color: var(--status-error, #f0505e); }

    .pixel-deco {
      width: 80px;
      height: var(--border-width, 1px);
      background: var(--border-default, #383c44);
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
            ${this.cta ? html`<button class="cta-primary" aria-label="${this.cta || 'Action'}" @click=${() => this.dispatchEvent(new CustomEvent('pastis-cta', { bubbles: true, composed: true }))}>${this.cta}</button>` : ''}
            ${this.ctaSecondary ? html`<button class="cta-secondary" aria-label="${this.ctaSecondary || 'Action'}" @click=${() => this.dispatchEvent(new CustomEvent('pastis-cta-secondary', { bubbles: true, composed: true }))}>${this.ctaSecondary}</button>` : ''}
          </div>
        ` : ''}
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('pastis-empty-state', PastisEmptyState);

import { LitElement, html, css } from 'lit';

export class PastisCookieBanner extends LitElement {
  static properties = {
    visible: { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
    title: { type: String },
    message: { type: String },
    acceptText: { type: String, attribute: 'accept-text' },
    rejectText: { type: String, attribute: 'reject-text' },
    settingsText: { type: String, attribute: 'settings-text' },
    privacyUrl: { type: String, attribute: 'privacy-url' },
    showSettings: { type: Boolean, attribute: 'show-settings', reflect: true },
    categories: { type: Array },
    _showDetails: { type: Boolean, attribute: false },
  };

  static styles = css`
    :host { display: block; }
    :host(:not([visible])) { display: none; }

    .banner {
      position: fixed;
      z-index: 9999;
      max-width: 480px;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
      border-radius: var(--radius-lg, 8px);
      padding: 24px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }

    :host([position="bottom-left"]) .banner,
    :host(:not([position])) .banner { bottom: 24px; left: 24px; }
    :host([position="bottom-right"]) .banner { bottom: 24px; right: 24px; }
    :host([position="bottom-center"]) .banner {
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      max-width: 600px;
    }
    :host([position="top-left"]) .banner { top: 24px; left: 24px; }
    :host([position="top-right"]) .banner { top: 24px; right: 24px; }

    .cookie-icon { font-size: 24px; margin-bottom: 12px; display: block; }

    .banner-title {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      margin: 0 0 8px;
    }

    .banner-message {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      color: var(--text-secondary, #fff);
      line-height: 1.6;
      margin: 0 0 16px;
    }

    .privacy-link {
      color: var(--text-primary, #f9f4da);
      text-decoration: underline;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }

    .categories {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;
      padding: 12px;
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
    }

    .category {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .category-info {}

    .category-name {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-secondary, #fff);
      margin: 0;
    }

    .category-desc {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 10px;
      color: var(--text-tertiary, #909498);
      margin: 2px 0 0;
    }

    .required-badge {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      background: var(--bg-elevated, #383c44);
      color: var(--text-tertiary, #909498);
      border: var(--border-width, 1px) solid var(--text-tertiary, #909498);
      border-radius: var(--radius-full, 9999px);
      padding: 2px 6px;
      white-space: nowrap;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .btn-row {
      display: flex;
      gap: 8px;
    }

    .btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: var(--radius-md, 6px);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      cursor: pointer;
      border: var(--border-width, 1px) solid currentColor;
      transition: box-shadow 120ms ease, transform 120ms ease;
      text-align: center;
    }

    .btn-primary:hover  { box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428); }
    .btn-primary:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--action-secondary, #fc7428); }
    .btn-secondary:hover  { box-shadow: 4px 4px 0 var(--action-primary, #fcba28); }
    .btn-secondary:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--action-primary, #fcba28); }

    .btn-primary {
      background: var(--action-primary, #fcba28);
      color: #000;
      border-color: var(--action-primary, #fcba28);
    }

    .btn-secondary {
      background: var(--bg-primary, #0d0d0d);
      color: var(--text-secondary, #fff);
      border-color: var(--text-secondary, #fff);
    }

    .btn-ghost {
      background: none;
      color: var(--text-tertiary, #909498);
      border-color: var(--text-tertiary, #909498);
      font-weight: 700;
      font-size: 11px;
      padding: 6px;
    }

    .btn-ghost:hover { color: var(--text-secondary, #fff); border-color: var(--text-secondary, #fff); box-shadow: 4px 4px 0 var(--action-primary, #fcba28); }

    .details-toggle {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      margin-bottom: 8px;
      display: block;
    }
  `;

  constructor() {
    super();
    this.visible = true;
    this.position = 'bottom-left';
    this.title = 'We use cookies 🍪';
    this.message = 'We use cookies to improve your experience and analyze site traffic. By clicking "Accept All", you consent to our use of cookies.';
    this.acceptText = 'Accept All';
    this.rejectText = 'Reject All';
    this.settingsText = 'Manage Preferences';
    this.showSettings = false;
    this._showDetails = false;
    this.categories = [
      { id: 'necessary', name: 'Necessary', description: 'Required for the site to function.', required: true, enabled: true },
      { id: 'analytics', name: 'Analytics', description: 'Help us understand how visitors use the site.', required: false, enabled: false },
      { id: 'marketing', name: 'Marketing', description: 'Used for personalized advertisements.', required: false, enabled: false },
    ];
  }

  _accept() {
    this.visible = false;
    this.dispatchEvent(new CustomEvent('pastis-cookie-accept', {
      detail: { categories: this.categories.map(c => ({ ...c, enabled: true })) },
      bubbles: true, composed: true
    }));
  }

  _reject() {
    this.visible = false;
    this.dispatchEvent(new CustomEvent('pastis-cookie-reject', {
      detail: { categories: this.categories.map(c => ({ ...c, enabled: c.required })) },
      bubbles: true, composed: true
    }));
  }

  _savePreferences() {
    this.visible = false;
    this.dispatchEvent(new CustomEvent('pastis-cookie-save', {
      detail: { categories: this.categories },
      bubbles: true, composed: true
    }));
  }

  _toggleCategory(id) {
    this.categories = this.categories.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c);
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="banner" role="dialog" aria-label="Cookie consent" part="banner">
        <span class="cookie-icon" aria-hidden="true">🍪</span>
        <h2 class="banner-title">${this.title}</h2>
        <p class="banner-message">
          ${this.message}
          ${this.privacyUrl ? html` <a class="privacy-link" href="${this.privacyUrl}" target="_blank">Privacy Policy</a>` : ''}
        </p>

        ${this._showDetails ? html`
          <div class="categories">
            ${this.categories.map(cat => html`
              <div class="category">
                <div class="category-info">
                  <p class="category-name">${cat.name}</p>
                  <p class="category-desc">${cat.description}</p>
                </div>
                ${cat.required
                  ? html`<span class="required-badge">Required</span>`
                  : html`
                    <pastis-toggle
                      size="sm"
                      ?checked="${cat.enabled}"
                      @pastis-change="${() => this._toggleCategory(cat.id)}"
                    ></pastis-toggle>
                  `
                }
              </div>
            `)}
          </div>
          <div class="actions">
            <div class="btn-row">
              <button class="btn btn-primary" @click="${this._savePreferences}">Save Preferences</button>
            </div>
          </div>
        ` : html`
          <div class="actions">
            <div class="btn-row">
              <button class="btn btn-secondary" @click="${this._reject}">${this.rejectText}</button>
              <button class="btn btn-primary" @click="${this._accept}">${this.acceptText}</button>
            </div>
            ${this.showSettings ? html`
              <button class="btn btn-ghost" @click="${() => { this._showDetails = true; this.requestUpdate(); }}">${this.settingsText}</button>
            ` : ''}
          </div>
        `}
      </div>
    `;
  }
}

customElements.define('pastis-cookie-banner', PastisCookieBanner);

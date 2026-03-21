import { LitElement, html, css } from 'lit';

export class PastisDrawer extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
    title: { type: String },
    size: { type: String, reflect: true },
    closable: { type: Boolean, reflect: true },
    persistent: { type: Boolean, reflect: true },
    overlay: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: contents; }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
    }

    .drawer {
      position: absolute;
      background: var(--bg-card, #0A0A0F);
      border: 4px solid var(--border-default, #00FF41);
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 1;
    }

    /* Right */
    :host(:not([position])) .drawer,
    :host([position="right"]) .drawer {
      top: 0; right: 0; bottom: 0;
      width: 400px;
      border-right: none;
    }

    /* Left */
    :host([position="left"]) .drawer {
      top: 0; left: 0; bottom: 0;
      width: 400px;
      border-left: none;
      box-shadow: 6px 0 0 var(--text-primary, #00FF41);
    }

    /* Bottom */
    :host([position="bottom"]) .drawer {
      bottom: 0; left: 0; right: 0;
      height: auto;
      max-height: 90vh;
      border-bottom: none;
      box-shadow: 0 -6px 0 var(--text-primary, #00FF41);
    }

    /* Top */
    :host([position="top"]) .drawer {
      top: 0; left: 0; right: 0;
      height: auto;
      max-height: 70vh;
      border-top: none;
      box-shadow: 0 6px 0 var(--text-primary, #00FF41);
    }

    /* Sizes */
    :host([size="sm"]:not([position="bottom"]):not([position="top"])) .drawer { width: 280px; }
    :host([size="lg"]:not([position="bottom"]):not([position="top"])) .drawer { width: 560px; }
    :host([size="xl"]:not([position="bottom"]):not([position="top"])) .drawer { width: 720px; }
    :host([size="full"]:not([position="bottom"]):not([position="top"])) .drawer { width: 100vw; border-radius: 0; }

    :host([size="sm"][position="bottom"]) .drawer { max-height: 40vh; }
    :host([size="lg"][position="bottom"]) .drawer { max-height: 80vh; }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 4px solid var(--border-default, #00FF41);
      flex-shrink: 0;
    }

    :host([position="bottom"]) .drawer-header { padding-top: 8px; }

    .handle {
      width: 36px;
      height: 4px;
      background: var(--text-tertiary, #808080);
      border-radius: 0;
      margin: 0 auto 8px;
      flex-shrink: 0;
    }

    .drawer-title {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--text-primary, #00FF41);
      margin: 0;
    }

    .close-btn {
      background: var(--bg-primary, #000);
      border: 3px solid var(--text-primary, #00FF41);
      border-radius: 0;
      width: 32px; height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary, #00FF41);
      font-size: 13px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      transition: box-shadow 50ms;
    }

    .close-btn:hover { box-shadow: 4px 4px 0 var(--text-primary, #00FF41); }
    .close-btn:focus-visible { outline: 4px solid var(--border-focus, #00FF41); outline-offset: 2px; }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      font-family: var(--font-family, 'Courier New', monospace);
      color: var(--text-secondary, #fff);
      font-size: 14px;
    }

    .drawer-footer {
      padding: 16px 24px;
      border-top: 4px solid var(--border-default, #00FF41);
      flex-shrink: 0;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.position = 'right';
    this.closable = true;
    this.persistent = false;
    this.overlay = true;
    this.size = 'md';
    this._boundKeydown = this._handleKeydown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._boundKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundKeydown);
  }

  updated(changed) {
    if (changed.has('open')) {
      document.body.style.overflow = this.open ? 'hidden' : '';
    }
  }

  close() {
    this.open = false;
    document.body.style.overflow = '';
    this.dispatchEvent(new CustomEvent('pastis-close', { bubbles: true, composed: true }));
  }

  _handleKeydown(e) {
    if (e.key === 'Escape' && this.open && !this.persistent) this.close();
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="backdrop" part="backdrop">
        ${this.overlay ? html`
          <div class="overlay" @click="${() => !this.persistent && this.close()}"></div>
        ` : ''}
        <div class="drawer" role="dialog" aria-modal="true" aria-label="${this.title || 'Drawer'}" part="drawer">
          ${this.position === 'bottom' || this.position === 'top' ? html`<div class="handle"></div>` : ''}
          <div class="drawer-header">
            <h2 class="drawer-title">${this.title || ''}</h2>
            ${this.closable ? html`
              <button class="close-btn" @click="${this.close}" aria-label="Close">✕</button>
            ` : ''}
          </div>
          <div class="drawer-body">
            <slot></slot>
          </div>
          <slot name="footer" class="drawer-footer"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('pastis-drawer', PastisDrawer);

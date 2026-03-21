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
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
      border-radius: var(--radius-lg, 8px);
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
      box-shadow: 6px 0 0 var(--text-primary, #f9f4da);
    }

    /* Bottom */
    :host([position="bottom"]) .drawer {
      bottom: 0; left: 0; right: 0;
      height: auto;
      max-height: 90vh;
      border-bottom: none;
      box-shadow: 0 -6px 0 var(--text-primary, #f9f4da);
    }

    /* Top */
    :host([position="top"]) .drawer {
      top: 0; left: 0; right: 0;
      height: auto;
      max-height: 70vh;
      border-top: none;
      box-shadow: 0 6px 0 var(--text-primary, #f9f4da);
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
      border-bottom: var(--border-width, 1px) solid var(--border-default, #fcba28);
      flex-shrink: 0;
    }

    :host([position="bottom"]) .drawer-header { padding-top: 8px; }

    .handle {
      width: 36px;
      height: 4px;
      background: var(--text-tertiary, #909498);
      border-radius: var(--radius-sm, 4px);
      margin: 0 auto 8px;
      flex-shrink: 0;
    }

    .drawer-title {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      margin: 0;
    }

    .close-btn {
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--text-primary, #f9f4da);
      border-radius: var(--radius-sm, 4px);
      width: 32px; height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary, #f9f4da);
      font-size: 13px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      transition: box-shadow 120ms ease;
    }

    .close-btn:hover { box-shadow: 4px 4px 0 var(--text-primary, #f9f4da); }
    .close-btn:focus-visible { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      color: var(--text-secondary, #fff);
      font-size: 14px;
    }

    .drawer-footer {
      padding: 16px 24px;
      border-top: var(--border-width, 1px) solid var(--border-default, #fcba28);
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
    this._previousFocus = null;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._boundKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundKeydown);
  }

  _getFocusableElements() {
    const drawer = this.shadowRoot?.querySelector('.drawer');
    if (!drawer) return [];
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    return Array.from(drawer.querySelectorAll(selector)).filter(
      el => !el.closest('[hidden]') && el.offsetParent !== null
    );
  }

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        this._previousFocus = document.activeElement;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
          const focusable = this._getFocusableElements();
          const target = focusable[0] || this.shadowRoot?.querySelector('.close-btn');
          target?.focus();
        });
      } else {
        document.body.style.overflow = '';
        this._previousFocus?.focus();
        this._previousFocus = null;
      }
    }
  }

  close() {
    this.open = false;
    document.body.style.overflow = '';
    this.dispatchEvent(new CustomEvent('pastis-close', { bubbles: true, composed: true }));
  }

  _handleKeydown(e) {
    if (!this.open) return;
    if (e.key === 'Escape' && !this.persistent) {
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = this._getFocusableElements();
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || this.shadowRoot.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || this.shadowRoot.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
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
          <div class="drawer-body" tabindex="0">
            <slot></slot>
          </div>
          <slot name="footer" class="drawer-footer"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('pastis-drawer', PastisDrawer);

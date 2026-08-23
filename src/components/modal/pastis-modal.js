import { LitElement, html, css } from 'lit';

export class PastisModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String },
    size: { type: String, reflect: true },
    closable: { type: Boolean, reflect: true },
    persistent: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: contents; }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .dialog {
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-lg, 8px);
      width: 100%;
      max-height: calc(100vh - 32px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    :host(:not([size])) .dialog,
    :host([size="md"]) .dialog { max-width: 540px; }
    :host([size="sm"]) .dialog { max-width: 380px; }
    :host([size="lg"]) .dialog { max-width: 720px; }
    :host([size="xl"]) .dialog { max-width: 960px; }
    :host([size="full"]) .dialog { max-width: calc(100vw - 32px); height: calc(100vh - 32px); }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: var(--border-width, 1px) solid var(--border-default, #383c44);
      flex-shrink: 0;
    }

    .modal-title {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 18px;
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
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary, #f9f4da);
      font-size: 14px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      transition: box-shadow 120ms ease;
      flex-shrink: 0;
    }

    .close-btn:hover {
      box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428);
    }

    .close-btn:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      color: var(--text-secondary, #fff);
      font-size: 14px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: var(--border-width, 1px) solid var(--border-default, #383c44);
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      flex-shrink: 0;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.closable = true;
    this.persistent = false;
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
    const dialog = this.shadowRoot?.querySelector('.dialog');
    if (!dialog) return [];
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    return Array.from(dialog.querySelectorAll(selector)).filter(
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

  render() {
    if (!this.open) return html``;

    return html`
      <div
        class="backdrop"
        @click="${this._handleBackdropClick}"
        role="dialog"
        aria-modal="true"
        aria-label="${this.title || 'Dialog'}"
        part="backdrop"
      >
        <div class="dialog" part="dialog" @click="${e => e.stopPropagation()}">
          <div class="modal-header">
            <h2 class="modal-title">${this.title || ''}</h2>
            ${this.closable ? html`
              <button class="close-btn" @click="${this.close}" aria-label="Close dialog">✕</button>
            ` : ''}
          </div>
          <div class="modal-body" tabindex="0">
            <slot></slot>
          </div>
          <slot name="footer" class="modal-footer"></slot>
        </div>
      </div>
    `;
  }

  _handleBackdropClick() {
    if (!this.persistent) this.close();
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

  open_() {
    this.open = true;
    this.dispatchEvent(new CustomEvent('pastis-open', { bubbles: true, composed: true }));
  }

  close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('pastis-close', { bubbles: true, composed: true }));
  }
}

customElements.define('pastis-modal', PastisModal);

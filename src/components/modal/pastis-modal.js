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
      background: var(--bg-card, #0A0A0F);
      border: 4px solid var(--border-default, #00FF41);
      border-radius: 0;
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
      border-bottom: 4px solid var(--border-default, #00FF41);
      flex-shrink: 0;
    }

    .modal-title {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 18px;
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
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary, #00FF41);
      font-size: 14px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      transition: box-shadow 50ms;
      flex-shrink: 0;
    }

    /* close button is green → hover shadow is cyan */
    .close-btn:hover {
      box-shadow: 4px 4px 0 var(--action-secondary, #00FFFF);
    }

    .close-btn:focus-visible {
      outline: 4px solid var(--border-focus, #00FF41);
      outline-offset: 2px;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      font-family: var(--font-family, 'Courier New', monospace);
      color: var(--text-secondary, #fff);
      font-size: 14px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 4px solid var(--border-default, #00FF41);
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
      if (this.open) {
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
          const closeBtn = this.shadowRoot?.querySelector('.close-btn');
          closeBtn?.focus();
        });
      } else {
        document.body.style.overflow = '';
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
          <div class="modal-body">
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
    if (e.key === 'Escape' && this.open && !this.persistent) this.close();
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

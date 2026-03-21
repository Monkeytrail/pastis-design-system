import { LitElement, html, css } from 'lit';

export class PastisToast extends LitElement {
  static properties = {
    message: { type: String },
    variant: { type: String, reflect: true },
    duration: { type: Number },
    position: { type: String, reflect: true },
    visible: { type: Boolean, reflect: true },
    title: { type: String },
    dismissible: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; }

    .toast-container {
      position: fixed;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    :host([position="top-right"]) .toast-container,
    :host(:not([position])) .toast-container {
      top: 20px; right: 20px; align-items: flex-end;
    }
    :host([position="top-left"]) .toast-container { top: 20px; left: 20px; align-items: flex-start; }
    :host([position="bottom-right"]) .toast-container { bottom: 20px; right: 20px; align-items: flex-end; }
    :host([position="bottom-left"]) .toast-container { bottom: 20px; left: 20px; align-items: flex-start; }
    :host([position="top-center"]) .toast-container { top: 20px; left: 50%; transform: translateX(-50%); align-items: center; }
    :host([position="bottom-center"]) .toast-container { bottom: 20px; left: 50%; transform: translateX(-50%); align-items: center; }

    .toast {
      pointer-events: all;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 0;
      border: 4px solid currentColor;
      max-width: 360px;
      min-width: 280px;
      font-family: var(--font-family, 'Courier New', monospace);
      background: var(--bg-primary, #000);
      position: relative;
      overflow: hidden;
    }

    .toast.hiding {
      opacity: 0;
    }

    :host([variant="success"]) .toast { color: var(--status-success, #00FF41); }
    :host([variant="error"]) .toast { color: var(--status-error, #FF006E); }
    :host([variant="warning"]) .toast { color: var(--status-warning, #FFE600); }
    :host([variant="info"]) .toast,
    :host(:not([variant])) .toast { color: var(--status-info, #00FFFF); }
    :host([variant="default"]) .toast {
      color: var(--text-primary, #00FF41);
    }

    .toast-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

    .toast-content { flex: 1; min-width: 0; }

    .toast-title {
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 4px;
      color: inherit;
    }

    .toast-message {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 12px;
      color: var(--text-secondary, #fff);
      margin: 0;
      line-height: 1.4;
    }

    .dismiss-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      font-size: 14px;
      padding: 0;
      flex-shrink: 0;
      transition: opacity 50ms;
      line-height: 1;
      font-family: var(--font-family, 'Courier New', monospace);
    }

    .dismiss-btn:hover { opacity: 1; }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: currentColor;
      opacity: 0.6;
      border-radius: 0;
      animation: progress linear forwards;
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
  `;

  constructor() {
    super();
    this.variant = 'default';
    this.duration = 4000;
    this.position = 'top-right';
    this.visible = false;
    this.dismissible = true;
    this._timer = null;
  }

  _getIcon() {
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ', default: '🔔' };
    return icons[this.variant] || '🔔';
  }

  show() {
    this.visible = true;
    if (this.duration > 0) {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this.hide(), this.duration);
    }
    this.dispatchEvent(new CustomEvent('pastis-show', { bubbles: true, composed: true }));
  }

  hide() {
    const toast = this.shadowRoot?.querySelector('.toast');
    if (toast) {
      toast.classList.add('hiding');
      setTimeout(() => {
        this.visible = false;
        this.dispatchEvent(new CustomEvent('pastis-hide', { bubbles: true, composed: true }));
      }, 200);
    } else {
      this.visible = false;
    }
  }

  render() {
    if (!this.visible) return html``;

    return html`
      <div class="toast-container" part="container">
        <div class="toast" role="alert" aria-live="polite" part="toast">
          <span class="toast-icon" aria-hidden="true">${this._getIcon()}</span>
          <div class="toast-content">
            ${this.title ? html`<p class="toast-title">${this.title}</p>` : ''}
            <p class="toast-message">${this.message || ''}<slot></slot></p>
          </div>
          ${this.dismissible ? html`
            <button class="dismiss-btn" @click="${this.hide}" aria-label="Dismiss">✕</button>
          ` : ''}
          ${this.duration > 0 ? html`
            <div class="progress-bar" style="animation-duration:${this.duration}ms"></div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('pastis-toast', PastisToast);

import { LitElement, html, css } from 'lit';

export class PastisSpinner extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    color: { type: String },
    variant: { type: String, reflect: true },
    label: { type: String },
  };

  static styles = css`
    :host { display: inline-flex; align-items: center; justify-content: center; }

    .spinner-wrap {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-direction: column;
    }

    .spinner-wrap.inline { flex-direction: row; }

    .ring {
      border-radius: 0;
      border: 4px solid var(--text-primary, #00FF41);
      border-top-color: transparent;
      animation: pixel-spin 0.5s steps(8) infinite;
      flex-shrink: 0;
    }

    :host([variant="dots"]) .ring { display: none; }

    .dots {
      display: none;
      gap: 4px;
      align-items: center;
    }

    :host([variant="dots"]) .dots { display: flex; }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 0;
      background: var(--text-primary, #00FF41);
      animation: pixel-blink 0.8s steps(2) infinite;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    :host([size="xs"]) .ring { width: 16px; height: 16px; border-width: 3px; }
    :host([size="sm"]) .ring { width: 20px; height: 20px; border-width: 3px; }
    :host(:not([size])) .ring,
    :host([size="md"]) .ring { width: 32px; height: 32px; }
    :host([size="lg"]) .ring { width: 44px; height: 44px; border-width: 5px; }
    :host([size="xl"]) .ring { width: 60px; height: 60px; border-width: 6px; }

    :host([size="xs"]) .dot { width: 5px; height: 5px; }
    :host([size="sm"]) .dot { width: 6px; height: 6px; }
    :host([size="lg"]) .dot { width: 10px; height: 10px; }
    :host([size="xl"]) .dot { width: 14px; height: 14px; }

    @keyframes pixel-spin { to { transform: rotate(360deg); } }

    @keyframes pixel-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }

    .label {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-tertiary, #808080);
    }
  `;

  constructor() {
    super();
    this.size = 'md';
    this.variant = 'ring';
  }

  render() {
    return html`
      <div class="spinner-wrap" role="status" aria-label="${this.label || 'Loading'}">
        <span class="ring" style="${this.color ? `border-top-color:${this.color}` : ''}"></span>
        <span class="dots">
          <span class="dot" style="${this.color ? `background:${this.color}` : ''}"></span>
          <span class="dot" style="${this.color ? `background:${this.color}` : ''}"></span>
          <span class="dot" style="${this.color ? `background:${this.color}` : ''}"></span>
        </span>
        ${this.label ? html`<span class="label">${this.label}</span>` : ''}
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('pastis-spinner', PastisSpinner);

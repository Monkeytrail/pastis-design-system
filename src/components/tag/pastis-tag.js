import { LitElement, html, css } from 'lit';

export class PastisTag extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    removable: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    icon: { type: String },
    color: { type: String },
  };

  static styles = css`
    :host { display: inline-flex; align-items: center; }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      border-radius: var(--radius-full, 9999px);
      border: var(--border-width, 1px) solid currentColor;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      cursor: default;
      user-select: none;
      transition: box-shadow 120ms ease;
    }

    /* Sizes */
    .tag { font-size: 11px; padding: 3px 10px; }
    :host([size="sm"]) .tag { font-size: 10px; padding: 2px 7px; }
    :host([size="lg"]) .tag { font-size: 13px; padding: 5px 14px; }

    /* Default variant */
    :host(:not([variant])) .tag,
    :host([variant="default"]) .tag {
      background: var(--bg-primary, #0d0d0d);
      color: var(--text-primary, #f9f4da);
    }

    :host([variant="primary"]) .tag {
      background: var(--bg-primary, #0d0d0d);
      color: var(--text-primary, #f9f4da);
    }

    :host([variant="success"]) .tag {
      background: var(--bg-primary, #0d0d0d);
      color: var(--status-success, #fcba28);
    }

    :host([variant="warning"]) .tag {
      background: var(--bg-primary, #0d0d0d);
      color: var(--status-warning, #fcba28);
    }

    :host([variant="error"]) .tag {
      background: var(--bg-primary, #0d0d0d);
      color: var(--status-error, #ed203d);
    }

    :host([variant="info"]) .tag {
      background: var(--bg-primary, #0d0d0d);
      color: var(--status-info, #fc7428);
    }

    :host([variant="solid"]) .tag {
      background: var(--action-primary, #fcba28);
      color: #000;
      border-color: var(--action-primary, #fcba28);
    }

    :host([variant="outline"]) .tag {
      background: transparent;
      color: var(--text-tertiary, #909498);
      border-color: var(--text-tertiary, #909498);
    }

    :host([disabled]) .tag { opacity: 0.3; pointer-events: none; }

    .remove-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      padding: 0;
      font-size: 12px;
      line-height: 1;
      margin-left: 1px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }

    .remove-btn:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .tag-icon { font-size: 11px; }
  `;

  constructor() {
    super();
    this.variant = 'default';
    this.size = 'md';
    this.removable = false;
    this.disabled = false;
  }

  render() {
    return html`
      <span
        class="tag"
        part="tag"
        style="${this.color ? `background:${this.color}20;color:${this.color};border:1.5px solid ${this.color}40` : ''}"
      >
        ${this.icon ? html`<span class="tag-icon" aria-hidden="true">${this.icon}</span>` : ''}
        <slot></slot>
        ${this.removable ? html`
          <button
            class="remove-btn"
            @click="${this._remove}"
            aria-label="Remove tag"
            ?disabled="${this.disabled}"
          >✕</button>
        ` : ''}
      </span>
    `;
  }

  _remove(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('pastis-remove', {
      bubbles: true, composed: true,
      detail: { value: this.textContent.trim() }
    }));
    this.remove();
  }
}

customElements.define('pastis-tag', PastisTag);

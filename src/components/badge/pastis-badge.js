import { LitElement, html, css } from 'lit';

export class PastisBadge extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    dot: { type: Boolean, reflect: true },
    count: { type: Number },
    max: { type: Number },
    label: { type: String },
  };

  static styles = css`
    :host { display: inline-flex; align-items: center; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: var(--border-width, 1px) solid currentColor;
      border-radius: var(--radius-full, 9999px);
      white-space: nowrap;
      line-height: 1;
    }

    /* Sizes */
    .badge { font-size: 11px; padding: 3px 10px; }
    :host([size="sm"]) .badge { font-size: 10px; padding: 2px 8px; }
    :host([size="lg"]) .badge { font-size: 13px; padding: 4px 12px; }

    /* Dot variant */
    :host([dot]) .badge { padding: 0; width: 10px; height: 10px; border-radius: 50%; }
    :host([dot][size="sm"]) .badge { width: 8px; height: 8px; }
    :host([dot][size="lg"]) .badge { width: 14px; height: 14px; }

    /* Variants */
    :host(:not([variant])) .badge,
    :host([variant="default"]) .badge {
      color: var(--text-primary, #f9f4da);
      background: transparent;
    }

    :host([variant="primary"]) .badge {
      color: var(--action-primary, #fcba28);
      background: transparent;
    }

    :host([variant="success"]) .badge {
      color: var(--status-success, #0ba95b);
      background: transparent;
    }

    :host([variant="warning"]) .badge {
      color: var(--status-warning, #fcba28);
      background: transparent;
    }

    :host([variant="error"]) .badge {
      color: var(--status-error, #f0505e);
      background: transparent;
    }

    :host([variant="info"]) .badge {
      color: var(--status-info, #12b5e5);
      background: transparent;
    }

    :host([variant="solid-primary"]) .badge {
      background: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
      border-color: var(--action-primary, #fcba28);
    }

    :host([variant="solid-success"]) .badge {
      background: var(--status-success, #0ba95b);
      color: #000000;
      border-color: var(--status-success, #0ba95b);
    }

    :host([variant="solid-error"]) .badge {
      background: var(--status-error, #f0505e);
      color: #000000;
      border-color: var(--status-error, #f0505e);
    }

    :host([variant="solid-warning"]) .badge {
      background: var(--status-warning, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
      border-color: var(--status-warning, #fcba28);
    }

    .dot-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
  `;

  constructor() {
    super();
    this.variant = 'default';
    this.size = 'md';
    this.dot = false;
    this.max = 99;
  }

  render() {
    if (this.dot) {
      return html`<span class="badge" role="status" part="badge" aria-label="${this.label || 'indicator'}"></span>`;
    }

    let content;
    if (this.count !== undefined) {
      content = this.count > this.max ? `${this.max}+` : `${this.count}`;
    }

    return html`
      <span class="badge" part="badge">
        ${content !== undefined ? content : html`<slot></slot>`}
      </span>
    `;
  }
}

customElements.define('pastis-badge', PastisBadge);

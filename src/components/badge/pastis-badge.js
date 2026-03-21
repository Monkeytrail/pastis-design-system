import { LitElement, html, css } from 'lit';

export class PastisBadge extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    dot: { type: Boolean, reflect: true },
    count: { type: Number },
    max: { type: Number },
  };

  static styles = css`
    :host { display: inline-flex; align-items: center; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: 3px solid currentColor;
      border-radius: 0;
      white-space: nowrap;
      line-height: 1;
    }

    /* Sizes */
    .badge { font-size: 11px; padding: 4px 10px; }
    :host([size="sm"]) .badge { font-size: 10px; padding: 2px 6px; }
    :host([size="lg"]) .badge { font-size: 13px; padding: 5px 12px; }

    /* Dot variant */
    :host([dot]) .badge { padding: 0; width: 10px; height: 10px; border-radius: 0; }
    :host([dot][size="sm"]) .badge { width: 8px; height: 8px; }
    :host([dot][size="lg"]) .badge { width: 14px; height: 14px; }

    /* Variants */
    :host(:not([variant])) .badge,
    :host([variant="default"]) .badge {
      color: var(--text-primary, #00FF41);
      background: #000;
    }

    :host([variant="primary"]) .badge {
      color: var(--text-primary, #00FF41);
      background: #000;
    }

    :host([variant="success"]) .badge {
      color: var(--status-success, #00FF41);
      background: #000;
    }

    :host([variant="warning"]) .badge {
      color: var(--status-warning, #FFE600);
      background: #000;
    }

    :host([variant="error"]) .badge {
      color: var(--status-error, #FF006E);
      background: #000;
    }

    :host([variant="info"]) .badge {
      color: var(--status-info, #00FFFF);
      background: #000;
    }

    :host([variant="solid-primary"]) .badge {
      background: var(--action-primary, #00FF41);
      color: #000;
      border-color: var(--action-primary, #00FF41);
    }

    :host([variant="solid-success"]) .badge {
      background: var(--status-success, #00FF41);
      color: #000;
      border-color: var(--status-success, #00FF41);
    }

    :host([variant="solid-error"]) .badge {
      background: var(--status-error, #FF006E);
      color: #fff;
      border-color: var(--status-error, #FF006E);
    }

    :host([variant="solid-warning"]) .badge {
      background: var(--status-warning, #FFE600);
      color: #000;
      border-color: var(--status-warning, #FFE600);
    }

    .dot-indicator {
      width: 6px;
      height: 6px;
      border-radius: 0;
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
      return html`<span class="badge" role="status" part="badge"></span>`;
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

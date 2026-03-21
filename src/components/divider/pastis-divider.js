import { LitElement, html, css } from 'lit';

export class PastisDivider extends LitElement {
  static properties = {
    orientation: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    label: { type: String },
    spacing: { type: String, reflect: true },
    color: { type: String },
    thickness: { type: String },
  };

  static styles = css`
    :host { display: block; }

    :host([orientation="vertical"]) {
      display: inline-block;
      height: 100%;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      border: none;
      margin: 0;
    }

    /* Horizontal */
    :host(:not([orientation])) .divider,
    :host([orientation="horizontal"]) .divider {
      width: 100%;
      flex-direction: row;
    }

    /* Vertical */
    :host([orientation="vertical"]) .divider {
      width: auto;
      height: 100%;
      flex-direction: column;
      display: inline-flex;
    }

    .line {
      flex: 1;
      background: var(--border-default, #00FF41);
    }

    :host(:not([orientation])) .line,
    :host([orientation="horizontal"]) .line {
      height: 4px;
    }

    :host([orientation="vertical"]) .line {
      width: 4px;
      min-height: 16px;
    }

    :host([variant="subtle"]) .line {
      background: var(--border-subtle, #1A1A1A);
      height: 2px;
    }

    :host([variant="dashed"]) .line {
      background: none;
      border-top: 4px dashed var(--text-tertiary, #808080);
      height: 0;
    }

    :host([orientation="vertical"][variant="dashed"]) .line {
      border-top: none;
      border-left: 4px dashed var(--text-tertiary, #808080);
      width: 0;
      height: auto;
    }

    :host([variant="dotted"]) .line {
      background: none;
      border-top: 4px dotted var(--border-default, #00FF41);
      height: 0;
    }

    :host([variant="thick"]) .line { height: 8px; }

    /* Spacing */
    :host([spacing="sm"]) { margin: 8px 0; }
    :host([spacing="md"]) { margin: 16px 0; }
    :host([spacing="lg"]) { margin: 24px 0; }
    :host([spacing="xl"]) { margin: 32px 0; }

    :host([orientation="vertical"][spacing="sm"]) { margin: 0 8px; }
    :host([orientation="vertical"][spacing="md"]) { margin: 0 16px; }
    :host([orientation="vertical"][spacing="lg"]) { margin: 0 24px; }

    .label {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-tertiary, #808080);
      white-space: nowrap;
    }
  `;

  constructor() {
    super();
    this.orientation = 'horizontal';
    this.variant = 'solid';
  }

  render() {
    const lineStyle = [
      this.color ? `background:${this.color};border-color:${this.color}` : '',
      this.thickness ? `height:${this.thickness};width:${this.thickness}` : '',
    ].filter(Boolean).join(';');

    return html`
      <div class="divider" role="separator" aria-orientation="${this.orientation || 'horizontal'}" part="divider">
        <span class="line" style="${lineStyle}"></span>
        ${this.label ? html`<span class="label">${this.label}</span>` : html`<slot></slot>`}
        ${this.label || this.querySelector('*') ? html`<span class="line" style="${lineStyle}"></span>` : ''}
      </div>
    `;
  }
}

customElements.define('pastis-divider', PastisDivider);

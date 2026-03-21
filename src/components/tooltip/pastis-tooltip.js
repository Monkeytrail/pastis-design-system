import { LitElement, html, css } from 'lit';

export class PastisTooltip extends LitElement {
  static properties = {
    content: { type: String },
    position: { type: String, reflect: true },
    visible: { type: Boolean, reflect: true },
    delay: { type: Number },
    maxWidth: { type: String, attribute: 'max-width' },
    variant: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: inline-flex; position: relative; }

    .trigger { display: contents; }

    .tooltip {
      position: absolute;
      z-index: 9000;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--bg-primary, #0d0d0d);
      background: var(--text-primary, #f9f4da);
      border: var(--border-width, 1px) solid var(--text-primary, #f9f4da);
      border-radius: var(--radius-md, 6px);
      padding: 6px 10px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 120ms ease;
      max-width: 240px;
      line-height: 1.4;
    }

    :host([variant="light"]) .tooltip {
      background: var(--bg-card, #1e1e1e);
      color: var(--text-primary, #f9f4da);
      border: var(--border-width, 1px) solid var(--text-primary, #f9f4da);
    }

    /* Top */
    :host(:not([position])) .tooltip,
    :host([position="top"]) .tooltip {
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }

    /* Bottom */
    :host([position="bottom"]) .tooltip {
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }

    /* Left */
    :host([position="left"]) .tooltip {
      right: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }

    /* Right */
    :host([position="right"]) .tooltip {
      left: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }

    :host([visible]) .tooltip {
      opacity: 1;
    }
  `;

  constructor() {
    super();
    this.position = 'top';
    this.visible = false;
    this.delay = 300;
    this._showTimer = null;
    this._hideTimer = null;
  }

  render() {
    return html`
      <span
        class="trigger"
        @mouseenter="${this._show}"
        @mouseleave="${this._hide}"
        @focusin="${this._show}"
        @focusout="${this._hide}"
      >
        <slot></slot>
      </span>
      <div
        class="tooltip"
        role="tooltip"
        aria-hidden="${!this.visible}"
        style="${this.maxWidth ? `max-width:${this.maxWidth}` : ''}"
        part="tooltip"
      >
        ${this.content || ''}
        <slot name="content"></slot>
      </div>
    `;
  }

  _show() {
    clearTimeout(this._hideTimer);
    this._showTimer = setTimeout(() => { this.visible = true; }, this.delay);
  }

  _hide() {
    clearTimeout(this._showTimer);
    this._hideTimer = setTimeout(() => { this.visible = false; }, 100);
  }
}

customElements.define('pastis-tooltip', PastisTooltip);

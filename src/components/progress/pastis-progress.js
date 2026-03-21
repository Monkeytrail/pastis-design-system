import { LitElement, html, css } from 'lit';

export class PastisProgress extends LitElement {
  static properties = {
    value: { type: Number, reflect: true },
    max: { type: Number },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String },
    label: { type: String },
    showValue: { type: Boolean, attribute: 'show-value', reflect: true },
    animated: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    radius: { type: Number },
    strokeWidth: { type: Number, attribute: 'stroke-width' },
  };

  static styles = css`
    :host { display: block; }

    .progress-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .progress-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-tertiary, #808080);
    }

    .label {
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-primary, #00FF41);
    }

    .track {
      width: 100%;
      background: var(--bg-elevated, #1A1A1A);
      border: 4px solid var(--border-default, #00FF41);
      border-radius: 0;
      overflow: hidden;
    }

    /* Sizes */
    :host(:not([size])) .track,
    :host([size="md"]) .track { height: 24px; }
    :host([size="xs"]) .track { height: 12px; border-width: 2px; }
    :host([size="sm"]) .track { height: 16px; border-width: 2px; }
    :host([size="lg"]) .track { height: 32px; }
    :host([size="xl"]) .track { height: 40px; }

    .bar {
      height: 100%;
      border-radius: 0;
      transition: width 100ms steps(10);
      background: var(--action-primary, #00FF41);
    }

    :host([animated]) .bar {
      background: repeating-linear-gradient(
        90deg,
        var(--action-primary, #00FF41) 0px,
        var(--action-primary, #00FF41) 8px,
        rgba(0,255,65,0.4) 8px,
        rgba(0,255,65,0.4) 12px
      );
      animation: pixel-march 0.5s steps(4) infinite;
    }

    :host([indeterminate]) .bar {
      width: 40% !important;
      animation: pixel-indeterminate 1s steps(8) infinite;
    }

    @keyframes pixel-march {
      0% { background-position: 0 0; }
      100% { background-position: 12px 0; }
    }

    @keyframes pixel-indeterminate {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(350%); }
    }

    /* Ring variant */
    .ring-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-direction: column;
    }

    .ring-svg { transform: rotate(-90deg); }

    .ring-track {
      fill: none;
      stroke: var(--bg-elevated, #1A1A1A);
    }

    .ring-fill {
      fill: none;
      stroke: var(--action-primary, #00FF41);
      stroke-linecap: square;
      transition: stroke-dashoffset 100ms steps(10);
    }

    .ring-value {
      position: absolute;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      color: var(--text-primary, #00FF41);
    }

    :host([size="sm"]) .ring-value { font-size: 14px; }
    :host(:not([size])) .ring-value, :host([size="md"]) .ring-value { font-size: 18px; }
    :host([size="lg"]) .ring-value { font-size: 24px; }
    :host([size="xl"]) .ring-value { font-size: 32px; }
  `;

  constructor() {
    super();
    this.value = 0;
    this.max = 100;
    this.variant = 'bar';
    this.size = 'md';
    this.animated = false;
    this.indeterminate = false;
    this.showValue = false;
    this.radius = 36;
    this.strokeWidth = 6;
  }

  _getPercentage() {
    return Math.min(100, Math.max(0, (this.value / this.max) * 100));
  }

  _renderRing() {
    const r = this.radius;
    const sw = this.strokeWidth;
    const size = (r + sw) * 2;
    const circumference = 2 * Math.PI * r;
    const pct = this._getPercentage();
    const offset = circumference - (pct / 100) * circumference;

    return html`
      <div class="ring-wrap" part="ring">
        <svg class="ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle class="ring-track" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${sw}" />
          <circle
            class="ring-fill"
            cx="${size/2}" cy="${size/2}" r="${r}"
            stroke-width="${sw}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${this.indeterminate ? circumference * 0.6 : offset}"
            style="${this.color ? `stroke:${this.color}` : ''}"
          />
        </svg>
        ${this.showValue && !this.indeterminate
          ? html`<span class="ring-value">${Math.round(pct)}%</span>`
          : ''}
      </div>
      ${this.label ? html`<div class="progress-header"><span class="label">${this.label}</span></div>` : ''}
    `;
  }

  render() {
    if (this.variant === 'ring') return this._renderRing();

    const pct = this._getPercentage();

    return html`
      <div class="progress-wrap" part="progress">
        ${this.label || this.showValue ? html`
          <div class="progress-header">
            ${this.label ? html`<span class="label">${this.label}</span>` : ''}
            ${this.showValue && !this.indeterminate ? html`<span>${Math.round(pct)}%</span>` : ''}
          </div>
        ` : ''}
        <div class="track" role="progressbar" aria-valuenow="${this.value}" aria-valuemin="0" aria-valuemax="${this.max}" part="track">
          <div
            class="bar"
            style="width:${this.indeterminate ? '40%' : pct + '%'};${this.color ? `background:${this.color}` : ''}"
            part="bar"
          ></div>
        </div>
      </div>
    `;
  }
}

customElements.define('pastis-progress', PastisProgress);

import { LitElement, html, css } from 'lit';

export class PastisStatCard extends LitElement {
  static properties = {
    label:   { type: String },
    value:   { type: String },
    delta:   { type: String },
    trend:   { type: String }, // 'up' | 'down' | 'neutral'
    icon:    { type: String },
    variant: { type: String, reflect: true }, // 'default' | 'primary' | 'success' | 'warning' | 'error'
  };

  static styles = css`
    :host { display: block; }

    .stat-card {
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
      padding: 20px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: box-shadow 120ms ease;
    }

    .stat-card:hover {
      box-shadow: var(--shadow-md, 5px 5px 0 #231f20);
    }

    :host([variant="primary"]) .stat-card { border-color: var(--action-primary, #fcba28); }
    :host([variant="success"]) .stat-card { border-color: var(--status-success, #fcba28); }
    :host([variant="warning"]) .stat-card { border-color: var(--status-warning, #fcba28); }
    :host([variant="error"]) .stat-card   { border-color: var(--status-error, #f0505e); }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-secondary, #f9f4da);
    }

    .icon {
      font-size: 18px;
      opacity: 0.8;
    }

    .value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary, #f9f4da);
      line-height: 1;
    }

    .footer {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .delta {
      font-weight: 700;
      text-transform: uppercase;
    }

    .trend-up   { color: var(--status-success, #fcba28); }
    .trend-down { color: var(--status-error, #f0505e); }
    .trend-neutral { color: var(--text-tertiary, #909498); }

    .delta-label { color: var(--text-tertiary, #909498); }
  `;

  constructor() {
    super();
    this.variant = 'default';
    this.trend = 'neutral';
  }

  render() {
    const trendIcon = this.trend === 'up' ? '▲' : this.trend === 'down' ? '▼' : '─';
    const trendClass = `delta trend-${this.trend}`;
    const trendDescription = this.delta
      ? `${this.trend === 'up' ? 'up' : this.trend === 'down' ? 'down' : 'no change'} ${this.delta} vs last period`
      : '';
    const regionLabel = [this.label || 'Metric', this.value || '0', trendDescription].filter(Boolean).join(', ');

    return html`
      <div class="stat-card" part="stat-card" role="region" aria-label="${regionLabel}">
        <div class="header">
          <span class="label" aria-hidden="true">${this.label || 'Metric'}</span>
          ${this.icon ? html`<span class="icon" aria-hidden="true">${this.icon}</span>` : ''}
        </div>
        <div class="value" aria-hidden="true">${this.value || '0'}</div>
        ${this.delta ? html`
          <div class="footer">
            <span class=${trendClass} aria-hidden="true">${trendIcon} ${this.delta}</span>
            <span class="delta-label" aria-hidden="true">vs last period</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('pastis-stat-card', PastisStatCard);

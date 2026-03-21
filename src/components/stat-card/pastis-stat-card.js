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
      background: var(--bg-card, #0A0A0F);
      border: 4px solid var(--border-default, #00FF41);
      padding: 20px;
      font-family: var(--font-family, 'Courier New', monospace);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    :host([variant="primary"]) .stat-card { border-color: var(--action-primary, #00FF41); }
    :host([variant="success"]) .stat-card { border-color: var(--status-success, #00FF41); }
    :host([variant="warning"]) .stat-card { border-color: var(--status-warning, #FFE600); }
    :host([variant="error"]) .stat-card   { border-color: var(--status-error, #FF006E); }

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
      color: var(--text-tertiary, #808080);
    }

    .icon {
      font-size: 18px;
      opacity: 0.8;
    }

    .value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary, #00FF41);
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

    .trend-up   { color: var(--status-success, #00FF41); }
    .trend-down { color: var(--status-error, #FF006E); }
    .trend-neutral { color: var(--text-tertiary, #808080); }

    .delta-label { color: var(--text-tertiary, #808080); }
  `;

  constructor() {
    super();
    this.variant = 'default';
    this.trend = 'neutral';
  }

  render() {
    const trendIcon = this.trend === 'up' ? '▲' : this.trend === 'down' ? '▼' : '─';
    const trendClass = `delta trend-${this.trend}`;

    return html`
      <div class="stat-card" part="stat-card">
        <div class="header">
          <span class="label">${this.label || 'Metric'}</span>
          ${this.icon ? html`<span class="icon" aria-hidden="true">${this.icon}</span>` : ''}
        </div>
        <div class="value">${this.value || '0'}</div>
        ${this.delta ? html`
          <div class="footer">
            <span class=${trendClass}>${trendIcon} ${this.delta}</span>
            <span class="delta-label">vs last period</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('pastis-stat-card', PastisStatCard);

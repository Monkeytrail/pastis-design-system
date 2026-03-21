import { LitElement, html, css } from 'lit';

export class PastisAvatar extends LitElement {
  static properties = {
    src: { type: String },
    alt: { type: String },
    name: { type: String },
    size: { type: String, reflect: true },
    shape: { type: String, reflect: true },
    status: { type: String, reflect: true },
    color: { type: String },
  };

  static styles = css`
    :host { display: inline-flex; position: relative; }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      background: var(--bg-primary, #0d0d0d);
      color: var(--text-primary, #f9f4da);
      border: var(--border-width, 1px) solid var(--text-primary, #f9f4da);
      user-select: none;
    }

    /* Shape variants */
    :host([shape="circle"]) .avatar,
    :host(:not([shape])) .avatar { border-radius: 50%; }

    :host([shape="rounded"]) .avatar { border-radius: var(--radius-lg, 8px); }

    :host([shape="square"]) .avatar { border-radius: 0; }

    /* Sizes */
    .avatar { width: 40px; height: 40px; font-size: 14px; }
    :host([size="xs"]) .avatar { width: 24px; height: 24px; font-size: 9px; }
    :host([size="sm"]) .avatar { width: 32px; height: 32px; font-size: 11px; }
    :host([size="lg"]) .avatar { width: 56px; height: 56px; font-size: 18px; }
    :host([size="xl"]) .avatar { width: 72px; height: 72px; font-size: 22px; }
    :host([size="2xl"]) .avatar { width: 96px; height: 96px; font-size: 28px; }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: var(--border-width, 1px) solid var(--bg-primary, #0d0d0d);
    }

    :host([size="xs"]) .status-dot { width: 6px; height: 6px; }
    :host([size="sm"]) .status-dot { width: 8px; height: 8px; }
    :host([size="lg"]) .status-dot { width: 12px; height: 12px; }
    :host([size="xl"]) .status-dot { width: 14px; height: 14px; }
    :host([size="2xl"]) .status-dot { width: 18px; height: 18px; }

    :host([status="online"]) .status-dot { background: var(--status-success, #fcba28); }
    :host([status="away"]) .status-dot { background: var(--status-warning, #fcba28); }
    :host([status="busy"]) .status-dot { background: var(--status-error, #ed203d); }
    :host([status="offline"]) .status-dot { background: var(--text-tertiary, #909498); }

    .icon { font-size: 1.2em; }
  `;

  constructor() {
    super();
    this.size = 'md';
    this.shape = 'circle';
    this.alt = '';
  }

  _getInitials() {
    if (!this.name) return '?';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  _getColorFromName() {
    if (this.color) return this.color;
    if (!this.name) return '#0071E3';
    const colors = ['#0071E3','#34C759','#FF9500','#FF3B30','#AF52DE','#5856D6','#5AC8FA','#FF2D55'];
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  render() {
    const bgColor = this._getColorFromName();
    return html`
      <div class="avatar" part="avatar" style="background:${this.src ? 'transparent' : bgColor}" role="img" aria-label="${this.alt || this.name || 'Avatar'}${this.status ? ', status: ' + this.status : ''}">
        ${this.src
          ? html`<img src="${this.src}" alt="${this.alt || this.name || ''}" />`
          : this.name
            ? html`<span>${this._getInitials()}</span>`
            : html`<span class="icon">👤</span>`
        }
      </div>
      ${this.status ? html`<span class="status-dot" aria-hidden="true"></span>` : ''}
    `;
  }
}

customElements.define('pastis-avatar', PastisAvatar);

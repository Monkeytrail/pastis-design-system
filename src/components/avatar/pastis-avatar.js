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
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: var(--bg-primary, #000);
      color: var(--text-primary, #00FF41);
      border: 4px solid var(--text-primary, #00FF41);
      user-select: none;
    }

    /* All shapes are square — no border-radius */
    :host([shape="circle"]) .avatar,
    :host([shape="rounded"]) .avatar,
    :host([shape="square"]) .avatar,
    :host(:not([shape])) .avatar { border-radius: 0; }

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
      image-rendering: pixelated;
    }

    .status-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border-radius: 0;
      border: 2px solid var(--bg-primary, #000);
    }

    :host([size="xs"]) .status-dot { width: 6px; height: 6px; }
    :host([size="sm"]) .status-dot { width: 8px; height: 8px; }
    :host([size="lg"]) .status-dot { width: 12px; height: 12px; }
    :host([size="xl"]) .status-dot { width: 14px; height: 14px; }
    :host([size="2xl"]) .status-dot { width: 18px; height: 18px; }

    :host([status="online"]) .status-dot { background: var(--status-success, #00FF41); }
    :host([status="away"]) .status-dot { background: var(--status-warning, #FFE600); }
    :host([status="busy"]) .status-dot { background: var(--status-error, #FF006E); }
    :host([status="offline"]) .status-dot { background: var(--text-tertiary, #808080); }

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
      <div class="avatar" part="avatar" style="background:${this.src ? 'transparent' : bgColor}" role="img" aria-label="${this.alt || this.name || 'avatar'}">
        ${this.src
          ? html`<img src="${this.src}" alt="${this.alt || this.name || ''}" />`
          : this.name
            ? html`<span>${this._getInitials()}</span>`
            : html`<span class="icon">👤</span>`
        }
      </div>
      ${this.status ? html`<span class="status-dot" aria-label="Status: ${this.status}"></span>` : ''}
    `;
  }
}

customElements.define('pastis-avatar', PastisAvatar);

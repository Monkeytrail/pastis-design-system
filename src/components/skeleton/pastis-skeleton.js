import { LitElement, html, css } from 'lit';

export class PastisSkeleton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    width: { type: String },
    height: { type: String },
    lines: { type: Number },
    animated: { type: Boolean, reflect: true },
    borderRadius: { type: String, attribute: 'border-radius' },
  };

  static styles = css`
    :host { display: block; }

    .skeleton {
      background: var(--bg-elevated, #1A1A1A);
      border: 2px solid var(--border-subtle, #1A1A1A);
      border-radius: 0;
    }

    :host([animated]) .skeleton {
      animation: pixel-pulse 1s steps(2) infinite;
    }

    @keyframes pixel-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* No circular shapes — all square */
    :host([variant="circle"]) .skeleton {
      border-radius: 0;
    }

    :host([variant="text"]) .skeleton {
      height: 14px;
      border-radius: 0;
    }

    .lines-wrap {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .line { height: 14px; border-radius: 0; border: 2px solid var(--border-subtle, #1A1A1A); background: var(--bg-elevated, #1A1A1A); }
    .line:last-child { width: 70% !important; }
  `;

  constructor() {
    super();
    this.variant = 'rect';
    this.animated = true;
    this.lines = 3;
  }

  render() {
    if (this.variant === 'lines') {
      return html`
        <div class="lines-wrap" part="skeleton">
          ${Array.from({ length: this.lines }, (_, i) => html`
            <div
              class="skeleton line"
              style="width:${i === this.lines - 1 ? '70%' : '100%'}"
            ></div>
          `)}
        </div>
      `;
    }

    const styles = [
      this.width ? `width:${this.width}` : '',
      this.height ? `height:${this.height}` : '',
      this.borderRadius ? `border-radius:${this.borderRadius}` : '',
    ].filter(Boolean).join(';');

    if (this.variant === 'circle') {
      const size = this.width || this.height || '40px';
      return html`<div class="skeleton" style="width:${size};height:${size};border-radius:50%${this.borderRadius ? ';border-radius:'+this.borderRadius : ''}" part="skeleton"></div>`;
    }

    return html`<div class="skeleton" style="${styles || 'width:100%;height:16px'}" part="skeleton"></div>`;
  }
}

customElements.define('pastis-skeleton', PastisSkeleton);

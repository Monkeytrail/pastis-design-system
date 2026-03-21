import { LitElement, html, css } from 'lit';

export class PastisHero extends LitElement {
  static properties = {
    heading: { type: String },
    subheading: { type: String },
    cta: { type: String },
    ctaSecondary: { type: String, attribute: 'cta-secondary' },
    image: { type: String },
    imageAlt: { type: String, attribute: 'image-alt' },
    align: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    badge: { type: String },
    fullHeight: { type: Boolean, attribute: 'full-height', reflect: true },
    bgColor: { type: String, attribute: 'bg-color' },
    gradient: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; }

    .hero {
      padding: 80px 40px;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
      background: var(--bg-primary, #000);
    }

    :host([full-height]) .hero { min-height: 100vh; }
    :host([variant="dark"]) .hero { background: var(--bg-primary, #000); }
    :host([variant="light"]) .hero { background: var(--bg-card, #0A0A0F); }

    :host([gradient]) .hero {
      background: var(--bg-primary, #000);
    }

    .content {
      max-width: 1100px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 60px;
    }

    :host([align="center"]) .content {
      flex-direction: column;
      text-align: center;
      align-items: center;
    }

    :host([align="right"]) .content { flex-direction: row-reverse; }

    .text-col { flex: 1; min-width: 0; }
    .image-col { flex: 1; display: flex; justify-content: center; }

    .badge-wrap {
      display: inline-flex;
      margin-bottom: 20px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-primary, #000);
      color: var(--text-primary, #00FF41);
      border: 3px solid var(--text-primary, #00FF41);
      border-radius: 0;
      padding: 4px 12px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    h1 {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: clamp(28px, 5vw, 56px);
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--text-primary, #00FF41);
      margin: 0 0 20px;
      text-shadow: 4px 4px 0 rgba(0, 255, 65, 0.2);
    }

    p {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-secondary, #fff);
      margin: 0 0 36px;
      max-width: 540px;
    }

    :host([align="center"]) p { margin-left: auto; margin-right: auto; }

    .cta-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    :host([align="center"]) .cta-group { justify-content: center; }

    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 0;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      text-decoration: none;
      border: 4px solid currentColor;
      transition: box-shadow 50ms, transform 50ms;
    }

    .cta-btn.primary {
      background: var(--action-primary, #00FF41);
      color: #000;
      border-color: var(--action-primary, #00FF41);
    }

    .cta-btn.primary:hover {
      box-shadow: 6px 6px 0 var(--action-primary, #00FF41);
    }

    .cta-btn.primary:active {
      transform: translate(2px, 2px);
      box-shadow: 4px 4px 0 var(--action-primary, #00FF41);
    }

    .cta-btn.secondary {
      background: var(--bg-primary, #000);
      color: var(--text-secondary, #fff);
      border-color: var(--text-secondary, #fff);
    }

    .cta-btn.secondary:hover {
      box-shadow: 6px 6px 0 var(--text-secondary, #fff);
    }

    .cta-btn.secondary:active {
      transform: translate(2px, 2px);
      box-shadow: 4px 4px 0 var(--text-secondary, #fff);
    }

    .hero-image {
      width: 100%;
      max-width: 500px;
      border-radius: 0;
      border: 4px solid var(--border-default, #00FF41);
      box-shadow: 8px 8px 0 var(--text-primary, #00FF41);
      image-rendering: pixelated;
    }

    @media (max-width: 768px) {
      .hero { padding: 60px 20px; }
      .content { flex-direction: column !important; }
      .image-col { display: none; }
    }
  `;

  constructor() {
    super();
    this.align = 'left';
    this.variant = 'light';
    this.gradient = false;
    this.fullHeight = false;
  }

  render() {
    return html`
      <section class="hero" part="hero" style="${this.bgColor ? `background:${this.bgColor}` : ''}">
        <div class="content">
          <div class="text-col">
            ${this.badge ? html`
              <div class="badge-wrap">
                <span class="badge">✨ ${this.badge}</span>
              </div>
            ` : ''}
            <h1>${this.heading || ''}<slot name="heading"></slot></h1>
            ${this.subheading ? html`<p>${this.subheading}</p>` : html`<slot name="subheading"></slot>`}
            <div class="cta-group">
              ${this.cta ? html`<button class="cta-btn primary" @click="${() => this.dispatchEvent(new CustomEvent('pastis-cta', { bubbles: true, composed: true }))}">${this.cta} →</button>` : ''}
              ${this.ctaSecondary ? html`<button class="cta-btn secondary" @click="${() => this.dispatchEvent(new CustomEvent('pastis-cta-secondary', { bubbles: true, composed: true }))}">${this.ctaSecondary}</button>` : ''}
              <slot name="cta"></slot>
            </div>
          </div>
          ${this.image ? html`
            <div class="image-col">
              <img class="hero-image" src="${this.image}" alt="${this.imageAlt || ''}" part="image" />
            </div>
          ` : html`<slot name="image"></slot>`}
        </div>
      </section>
    `;
  }
}

customElements.define('pastis-hero', PastisHero);

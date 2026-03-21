import { LitElement, html, css } from 'lit';

export class PastisCarousel extends LitElement {
  static properties = {
    slides:     { type: Array },
    active:     { type: Number, reflect: true },
    autoplay:   { type: Number }, // interval ms, 0 = off
    loop:       { type: Boolean, reflect: true },
    showDots:   { type: Boolean, reflect: true },
    showArrows: { type: Boolean, reflect: true },
    variant:    { type: String, reflect: true }, // 'default' | 'peek' | 'fade'
    _timer:     { state: true },
  };

  static styles = css`
    :host { display: block; }

    .carousel {
      position: relative;
      border: 4px solid var(--border-default, #00FF41);
      overflow: hidden;
      background: var(--bg-card, #0A0A0F);
      font-family: var(--font-family, 'Courier New', monospace);
    }

    .slides-track {
      display: flex;
      transition: transform 0.25s steps(5);
    }

    :host([variant="fade"]) .slides-track {
      display: block;
      position: relative;
    }

    .slide {
      flex-shrink: 0;
      width: 100%;
      min-height: 200px;
      position: relative;
    }

    :host([variant="fade"]) .slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.2s steps(4);
      pointer-events: none;
    }

    :host([variant="fade"]) .slide.active-slide {
      opacity: 1;
      position: relative;
      pointer-events: auto;
    }

    .slide-content {
      padding: 32px;
    }

    .slide-image {
      width: 100%;
      display: block;
      image-rendering: pixelated;
    }

    .slide-caption {
      padding: 16px;
      border-top: 4px solid var(--border-subtle, #1A1A1A);
    }

    .slide-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-primary, #00FF41);
      margin: 0 0 4px;
    }

    .slide-body {
      font-size: 12px;
      color: var(--text-tertiary, #808080);
      margin: 0;
    }

    /* Arrows */
    .arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: var(--bg-elevated, #1A1A1A);
      border: 3px solid var(--border-default, #00FF41);
      color: var(--text-primary, #00FF41);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      font-weight: 700;
      z-index: 10;
      transition: background 50ms;
    }
    .arrow:hover { background: var(--action-primary, #00FF41); color: var(--action-primary-text, #000); }
    .arrow:focus-visible { outline: 4px solid var(--border-focus, #00FF41); outline-offset: 2px; }
    .arrow.prev { left: 8px; }
    .arrow.next { right: 8px; }
    .arrow[disabled] { opacity: 0.3; cursor: not-allowed; pointer-events: none; }

    /* Dots */
    .dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-top: 4px solid var(--border-subtle, #1A1A1A);
    }

    .dot {
      width: 10px;
      height: 10px;
      border: 2px solid var(--border-default, #00FF41);
      background: transparent;
      cursor: pointer;
      transition: background 50ms;
    }

    .dot.active-dot {
      background: var(--action-primary, #00FF41);
    }

    /* Counter */
    .counter {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--bg-elevated, #1A1A1A);
      border: 2px solid var(--border-subtle, #1A1A1A);
      color: var(--text-tertiary, #808080);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 3px 8px;
    }
  `;

  constructor() {
    super();
    this.slides = [];
    this.active = 0;
    this.autoplay = 0;
    this.loop = true;
    this.showDots = true;
    this.showArrows = true;
    this.variant = 'default';
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.autoplay > 0) this._startAutoplay();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoplay();
  }

  _startAutoplay() {
    this._timer = setInterval(() => this._next(), this.autoplay);
  }

  _stopAutoplay() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  _goTo(index) {
    const total = this.slides.length;
    if (!total) return;
    this.active = ((index % total) + total) % total;
    this.dispatchEvent(new CustomEvent('pastis-slide-change', {
      detail: { index: this.active },
      bubbles: true, composed: true,
    }));
  }

  _prev() { this._goTo(this.active - 1); }
  _next() { this._goTo(this.active + 1); }

  render() {
    const total = this.slides.length;
    const canPrev = this.loop || this.active > 0;
    const canNext = this.loop || this.active < total - 1;

    return html`
      <div class="carousel" part="carousel">
        <div
          class="slides-track"
          style=${this.variant !== 'fade' ? `transform: translateX(-${this.active * 100}%)` : ''}
        >
          ${this.slides.map((slide, i) => html`
            <div class="slide ${i === this.active ? 'active-slide' : ''}" part="slide">
              ${slide.image ? html`<img class="slide-image" src=${slide.image} alt=${slide.title || ''} />` : ''}
              ${(slide.title || slide.body) ? html`
                <div class="slide-caption">
                  ${slide.title ? html`<p class="slide-title">${slide.title}</p>` : ''}
                  ${slide.body ? html`<p class="slide-body">${slide.body}</p>` : ''}
                </div>
              ` : html`<div class="slide-content"><slot name="slide-${i}"></slot></div>`}
            </div>
          `)}
        </div>

        <span class="counter">${this.active + 1} / ${total}</span>

        ${this.showArrows ? html`
          <button class="arrow prev" ?disabled=${!canPrev} @click=${this._prev} aria-label="Previous">◀</button>
          <button class="arrow next" ?disabled=${!canNext} @click=${this._next} aria-label="Next">▶</button>
        ` : ''}

        ${this.showDots ? html`
          <div class="dots" role="tablist">
            ${this.slides.map((_, i) => html`
              <span
                class="dot ${i === this.active ? 'active-dot' : ''}"
                role="tab"
                tabindex=${i === this.active ? 0 : -1}
                aria-selected=${i === this.active}
                aria-label="Go to slide ${i + 1}"
                @click=${() => this._goTo(i)}
              ></span>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('pastis-carousel', PastisCarousel);

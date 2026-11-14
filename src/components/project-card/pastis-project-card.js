import { LitElement, html, css } from 'lit';

export class PastisProjectCard extends LitElement {
  static properties = {
    href:     { type: String },
    heading:  { type: String },
    client:   { type: String },
    year:     { type: String },
    summary:  { type: String },
    image:    { type: String },
    imageAlt: { type: String, attribute: 'image-alt' },
    video:    { type: String },
    tags:     { type: Array },
    index:    { type: String },
    size:     { type: String, reflect: true }, // 'square' | 'wide' | 'tall'
    reveal:   { type: Boolean, reflect: true },  // rise in from a clip mask when scrolled into view
    revealed: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      --_ratio: 1 / 1;
    }

    :host([size="wide"]) { --_ratio: 16 / 9; }
    :host([size="tall"]) { --_ratio: 4 / 5; }

    a {
      display: flex;
      flex-direction: column;
      gap: 14px;
      color: var(--text-primary, #f9f4da);
      text-decoration: none;
      font-family: var(--font-family-mono, 'JetBrains Mono', monospace);
    }

    a:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 6px;
      border-radius: var(--radius-md, 6px);
    }

    /* Perspective lives on the parent so the media can lean in 3D */
    .stage { perspective: 1500px; }

    .media {
      position: relative;
      aspect-ratio: var(--pastis-project-card-ratio, var(--_ratio));
      overflow: hidden;
      border-radius: var(--radius-md, 6px);
      background: var(--bg-card, #1e1e1e);
      clip-path: inset(0 0 0 0 round var(--radius-md, 6px));
      transform-origin: center bottom;
      will-change: transform;
      transition:
        transform var(--duration-tilt, 800ms) var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
        clip-path var(--duration-tilt, 800ms) var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
        opacity var(--duration-base, 200ms) var(--ease-standard, ease);
    }

    .media img,
    .media video,
    ::slotted([slot="media"]) {
      position: absolute !important;
      inset: 0;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover;
    }

    /* Hover: the card leans its top edge toward the viewer; pressing flattens it */
    @media (any-pointer: fine) {
      a:hover .media { transform: rotateX(-10deg); }
      a:hover:active .media { transform: rotateX(0deg); }
    }

    a:focus-visible .media { transform: rotateX(-10deg); }
    a:focus-visible:active .media { transform: rotateX(0deg); }

    /* Entrance: rise out of a clip mask while untilting */
    :host([reveal]:not([revealed])) .media {
      clip-path: inset(100% 0 0 0 round var(--radius-md, 6px));
      opacity: 0;
      transform: rotateX(50deg);
    }

    :host([reveal]:not([revealed])) .info { opacity: 0; }

    .info {
      transition: opacity var(--duration-slow, 400ms) var(--ease-standard, ease) 150ms;
    }

    @media (prefers-reduced-motion: reduce) {
      a:hover .media,
      a:focus-visible .media { transform: none; }

      :host([reveal]:not([revealed])) .media {
        clip-path: inset(0 0 0 0 round var(--radius-md, 6px));
        opacity: 1;
        transform: none;
      }

      :host([reveal]:not([revealed])) .info { opacity: 1; }
    }

    .tags {
      position: absolute;
      left: 12px;
      bottom: 12px;
      right: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      opacity: 0;
      transform: translateY(6px);
      transition:
        opacity var(--duration-base, 200ms) var(--ease-standard, ease),
        transform var(--duration-base, 200ms) var(--ease-standard, ease);
    }

    a:hover .tags,
    a:focus-visible .tags {
      opacity: 1;
      transform: none;
    }

    .tag {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      padding: 4px 9px;
      border-radius: var(--radius-full, 9999px);
      background: var(--bg-primary, #0d0d0d);
      color: var(--text-primary, #f9f4da);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
    }

    .meta {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: baseline;
      gap: 12px;
    }

    .index,
    .year,
    .client {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-tertiary, #909498);
    }

    .title {
      font-family: var(--font-family-display, 'Instrument Serif', serif);
      font-size: clamp(24px, 1.4rem + 0.7vw, 32px);
      font-weight: var(--font-weight-display, 400);
      line-height: 1.1;
      letter-spacing: -0.01em;
      margin: 0;
      /* Reserve lines (e.g. 2) so media bottoms line up across cards in a row */
      min-height: calc(var(--pastis-project-card-title-lines, 0) * 1.15em);
    }

    .arrow {
      display: inline-block;
      color: var(--action-primary, #fcba28);
      transform: translateX(-4px);
      opacity: 0;
      transition:
        opacity var(--duration-base, 200ms) var(--ease-standard, ease),
        transform var(--duration-base, 200ms) var(--ease-standard, ease);
    }

    a:hover .arrow,
    a:focus-visible .arrow {
      opacity: 1;
      transform: none;
    }

    .summary {
      margin: 4px 0 0;
      font-family: var(--font-family-body, 'Inter', sans-serif);
      font-size: 15px;
      line-height: 1.5;
      color: var(--text-tertiary, #909498);
      min-height: calc(var(--pastis-project-card-summary-lines, 0) * 1.5em);
    }

    /* Touch devices never see hover — keep tags visible */
    @media (hover: none) {
      .tags { opacity: 1; transform: none; }
    }
  `;

  constructor() {
    super();
    this.tags = [];
    this.size = 'square';
  }

  // React 19 assigns server-rendered attribute strings straight to the property
  // on already-upgraded elements, so accept the JSON form as well as an array.
  willUpdate() {
    if (typeof this.tags === 'string') {
      try { this.tags = JSON.parse(this.tags); } catch { this.tags = []; }
    }
  }

  updated(changed) {
    if (changed.has('reveal') && this.reveal && !this.revealed && !this._observer) {
      this._observer = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        this._observer.disconnect();
        // Delay comes from the consumer (e.g. a shelf staggering its items)
        const delay = parseFloat(getComputedStyle(this).getPropertyValue('--pastis-reveal-delay')) || 0;
        setTimeout(() => { this.revealed = true; }, delay);
      }, { threshold: 0.2 });
      this._observer.observe(this);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = null;
  }

  _renderMedia() {
    if (this.video) {
      return html`<video src=${this.video} poster=${this.image || ''} autoplay muted loop playsinline aria-hidden="true"></video>`;
    }
    if (this.image) {
      return html`<img src=${this.image} alt=${this.imageAlt || ''} loading="lazy" decoding="async" />`;
    }
    return '';
  }

  render() {
    return html`
      <a href=${this.href || '#'} part="link">
        <div class="stage">
          <div class="media" part="media">
            <slot name="media">${this._renderMedia()}</slot>
            ${this.tags?.length ? html`
              <div class="tags" aria-hidden="true">
                ${this.tags.map((t) => html`<span class="tag">${t}</span>`)}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="info">
          <div class="meta">
            ${this.index ? html`<span class="index">${this.index}</span>` : html`<span></span>`}
            <span class="client">${this.client || ''}</span>
            ${this.year ? html`<span class="year">${this.year}</span>` : ''}
          </div>
          <h3 class="title">${this.heading || ''} <span class="arrow" aria-hidden="true">→</span></h3>
          ${this.summary ? html`<p class="summary">${this.summary}</p>` : ''}
        </div>
      </a>
    `;
  }
}

customElements.define('pastis-project-card', PastisProjectCard);

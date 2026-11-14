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

    .media {
      position: relative;
      aspect-ratio: var(--_ratio);
      overflow: hidden;
      border-radius: var(--radius-md, 6px);
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-subtle, #1e1e1e);
      transition: box-shadow var(--duration-base, 200ms) var(--ease-standard, ease);
    }

    .media img,
    .media video,
    ::slotted([slot="media"]) {
      position: absolute !important;
      inset: 0;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover;
      transform: scale(1.001);
      transition: transform var(--duration-slow, 400ms) var(--ease-enter, ease);
    }

    a:hover .media,
    a:focus-visible .media {
      box-shadow: var(--shadow-lg, 5px 5px 0 #fcba28);
    }

    a:hover .media img,
    a:hover .media video,
    a:hover ::slotted([slot="media"]) {
      transform: scale(1.035);
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
      font-family: var(--font-family-display, 'Bricolage Grotesque', sans-serif);
      font-size: clamp(20px, 1.2rem + 0.6vw, 28px);
      font-weight: 600;
      line-height: 1.15;
      letter-spacing: -0.015em;
      margin: 0;
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
        <div class="media" part="media">
          <slot name="media">${this._renderMedia()}</slot>
          ${this.tags?.length ? html`
            <div class="tags" aria-hidden="true">
              ${this.tags.map((t) => html`<span class="tag">${t}</span>`)}
            </div>
          ` : ''}
        </div>
        <div>
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

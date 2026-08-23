import { LitElement, html, css } from 'lit';

export class PastisTestimonial extends LitElement {
  static properties = {
    /** The quote body text */
    quote:   { type: String },
    /** Author full name */
    name:    { type: String },
    /** Author job title */
    role:    { type: String },
    /** Author company */
    company: { type: String },
    /** Avatar image URL */
    src:     { type: String },
    /** Star rating 1-5 (0 = hidden) */
    rating:  { type: Number },
    /** 'default' | 'featured' */
    variant: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: block; }

    .testimonial {
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
      padding: var(--space-xl, 32px);
      position: relative;
      transition: box-shadow 120ms ease, transform 120ms ease;
    }

    .testimonial:hover {
      box-shadow: var(--shadow-md, 5px 5px 0 #231f20);
      transform: translate(-2px, -2px);
    }

    :host([variant="featured"]) .testimonial {
      border-color: var(--action-primary, #fcba28);
      box-shadow: var(--shadow-lg, 5px 5px 0 #fcba28);
    }

    :host([variant="featured"]) .testimonial:hover {
      box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428);
    }

    .mark {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 64px;
      line-height: 1;
      color: var(--action-primary, #fcba28);
      margin: 0 0 var(--space-md, 16px);
      display: block;
      user-select: none;
    }

    .rating {
      display: flex;
      gap: 2px;
      margin-bottom: var(--space-md, 16px);
    }

    .star {
      font-size: 14px;
      color: var(--text-disabled, #383c44);
    }

    .star.filled {
      color: var(--action-primary, #fcba28);
    }

    blockquote {
      margin: 0 0 var(--space-xl, 32px);
      padding: 0;
    }

    .quote-text {
      font-family: var(--font-family-body, 'Outfit', sans-serif);
      font-size: 16px;
      line-height: 1.7;
      color: var(--text-secondary, #f9f4da);
      font-style: italic;
    }

    :host([variant="featured"]) .quote-text {
      font-size: 18px;
    }

    .author {
      display: flex;
      align-items: center;
      gap: var(--space-md, 16px);
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #f9f4da);
      text-transform: uppercase;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .author-info { display: flex; flex-direction: column; gap: 2px; }

    .author-name {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
    }

    .author-meta {
      font-family: var(--font-family-body, 'Outfit', sans-serif);
      font-size: 12px;
      color: var(--text-tertiary, #909498);
    }
  `;

  constructor() {
    super();
    this.rating = 0;
    this.variant = 'default';
  }

  _initials() {
    if (!this.name) return '?';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  render() {
    const metaParts = [this.role, this.company].filter(Boolean);

    return html`
      <figure class="testimonial" part="testimonial">
        <span class="mark" aria-hidden="true">"</span>

        ${this.rating > 0 ? html`
          <div class="rating" role="img" aria-label="Rating: ${this.rating} out of 5 stars">
            ${[1, 2, 3, 4, 5].map((i) => html`
              <span class="star ${i <= this.rating ? 'filled' : ''}" aria-hidden="true">★</span>
            `)}
          </div>
        ` : ''}

        <blockquote>
          <p class="quote-text">
            <slot>${this.quote || ''}</slot>
          </p>
        </blockquote>

        <figcaption class="author">
          <div class="avatar" aria-hidden="true">
            ${this.src
              ? html`<img src="${this.src}" alt="${this.name || 'Author'}" />`
              : this._initials()
            }
          </div>
          <div class="author-info">
            <span class="author-name">${this.name || ''}</span>
            ${metaParts.length ? html`<span class="author-meta">${metaParts.join(' · ')}</span>` : ''}
          </div>
        </figcaption>
      </figure>
    `;
  }
}

customElements.define('pastis-testimonial', PastisTestimonial);

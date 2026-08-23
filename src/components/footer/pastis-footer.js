import { LitElement, html, css } from 'lit';

export class PastisFooter extends LitElement {
  static properties = {
    /** Brand / logo name */
    brand:     { type: String },
    /** Tagline under brand name */
    tagline:   { type: String },
    /** Copyright string */
    copyright: { type: String },
    /**
     * Link columns.
     * @type {{ heading: string, items: { label: string, href: string }[] }[]}
     */
    links:     { type: Array },
    /**
     * Social links.
     * @type {{ label: string, href: string, icon: string }[]}
     */
    socials:   { type: Array },
    /** 'default' | 'minimal' */
    variant:   { type: String, reflect: true },
  };

  static styles = css`
    :host { display: block; }

    footer {
      margin: var(--space-lg, 24px);
      border-radius: var(--radius-2xl, 2px);
      background: var(--bg-card, #1e1e1e);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      padding: var(--space-4xl, 96px) var(--grid-margin, 40px) var(--space-xl, 32px);
    }

    :host([variant="minimal"]) footer {
      padding: var(--space-xl, 32px) var(--grid-margin, 40px);
      border-radius: 16px;
    }

    .inner {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ── Main row ─────────────────────────────────────── */
    .main {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-3xl, 64px);
      margin-bottom: var(--space-3xl, 64px);
      align-items: start;
    }

    :host([variant="minimal"]) .main { display: none; }

    .brand-col {}

    .brand-name {
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      margin: 0 0 var(--space-xs, 4px);
    }

    .tagline {
      font-family: var(--font-family-body, 'Outfit', sans-serif);
      font-size: 14px;
      color: var(--text-tertiary, #909498);
      margin: 0 0 var(--space-lg, 24px);
    }

    .socials {
      display: flex;
      gap: var(--space-sm, 8px);
      flex-wrap: wrap;
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-2xl, 24px);
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      color: var(--text-secondary, #f9f4da);
      text-decoration: none;
      font-size: 16px;
      transition: box-shadow 120ms ease, transform 120ms ease, border-color 120ms ease;
    }

    .social-link:hover {
      border-color: var(--action-primary, #fcba28);
      box-shadow: var(--shadow-md, 5px 5px 0 #231f20);
      transform: translate(-2px, -2px);
    }

    .social-link:active {
      transform: translate(2px, 2px);
      box-shadow: none;
    }

    .social-link:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    /* ── Link columns ─────────────────────────────────── */
    .link-columns {
      display: flex;
      gap: var(--space-3xl, 64px);
    }

    .link-col {}

    .col-heading {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-tertiary, #909498);
      margin: 0 0 var(--space-md, 16px);
    }

    .col-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 8px);
    }

    .col-links a {
      font-size: 13px;
      color: var(--text-secondary, #f9f4da);
      text-decoration: none;
      transition: color 120ms ease;
    }

    .col-links a:hover {
      color: var(--action-primary, #fcba28);
    }

    .col-links a:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
      border-radius: var(--radius-xs, 2px);
    }

    /* ── Bottom bar ───────────────────────────────────── */
    .bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-xl, 32px);
      border-top: var(--border-width, 1px) solid var(--border-default, #383c44);
      gap: var(--space-md, 16px);
      flex-wrap: wrap;
    }

    .copyright {
      font-size: 12px;
      color: var(--text-tertiary, #909498);
    }

    .slot-actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 8px);
    }

    /* ── Minimal variant ──────────────────────────────── */
    :host([variant="minimal"]) .bottom {
      border-top: none;
      padding-top: 0;
      justify-content: center;
    }

    @media (max-width: 768px) {
      footer { padding: var(--space-3xl, 64px) var(--grid-margin-mobile, 16px) var(--space-xl, 32px); }
      .main { grid-template-columns: 1fr; }
      .link-columns { flex-wrap: wrap; gap: var(--space-xl, 32px); }
    }
  `;

  constructor() {
    super();
    this.links = [];
    this.socials = [];
    this.variant = 'default';
  }

  render() {
    return html`
      <footer part="footer">
        <div class="inner">
          <div class="main" part="main">
            <div class="brand-col">
              <slot name="brand">
                <p class="brand-name">${this.brand || ''}</p>
              </slot>
              ${this.tagline ? html`<p class="tagline">${this.tagline}</p>` : ''}
              ${this.socials.length ? html`
                <nav class="socials" aria-label="Social links">
                  ${this.socials.map((s) => html`
                    <a class="social-link" href="${s.href}" aria-label="${s.label}" target="_blank" rel="noopener noreferrer">
                      ${s.icon}
                    </a>
                  `)}
                </nav>
              ` : html`<slot name="socials"></slot>`}
            </div>

            ${this.links.length ? html`
              <nav class="link-columns" aria-label="Footer navigation">
                ${this.links.map((col) => html`
                  <div class="link-col">
                    <h3 class="col-heading">${col.heading}</h3>
                    <ul class="col-links">
                      ${col.items.map((item) => html`
                        <li><a href="${item.href}">${item.label}</a></li>
                      `)}
                    </ul>
                  </div>
                `)}
              </nav>
            ` : html`<slot name="links"></slot>`}
          </div>

          <div class="bottom" part="bottom">
            <span class="copyright">${this.copyright || ''}</span>
            <div class="slot-actions">
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('pastis-footer', PastisFooter);

import { LitElement, html, css } from 'lit';

export class PastisStatement extends LitElement {
  static properties = {
    eyebrow: { type: String },
    size:    { type: String, reflect: true }, // 'md' | 'lg' | 'xl'
    reveal:  { type: Boolean, reflect: true },
    _visible: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      --_size: var(--font-size-statement-lg, clamp(2.25rem, 1.4rem + 3.6vw, 5.5rem));
    }

    :host([size="md"]) { --_size: var(--font-size-statement-md, clamp(1.75rem, 1.3rem + 1.9vw, 3.25rem)); }
    :host([size="xl"]) { --_size: var(--font-size-statement-xl, clamp(3rem, 1.5rem + 6.4vw, 8.5rem)); }

    .eyebrow {
      display: block;
      margin-bottom: 20px;
      font-family: var(--font-family-mono, 'JetBrains Mono', monospace);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-tertiary, #909498);
    }

    .body {
      font-family: var(--font-family-display, 'Bricolage Grotesque', sans-serif);
      font-size: var(--_size);
      font-weight: 600;
      line-height: var(--line-height-statement, 0.95);
      letter-spacing: var(--letter-spacing-statement, -0.035em);
      color: var(--text-primary, #f9f4da);
      text-wrap: balance;
    }

    ::slotted(*) {
      font: inherit !important;
      letter-spacing: inherit !important;
      color: inherit;
      margin: 0 !important;
    }

    /* Nested <em> accents can't be reached through ::slotted — consumers load
       this from pastis-tokens.css (see tokens/index.css). */
    ::slotted(em) {
      font-style: normal;
      color: var(--action-primary, #fcba28);
    }

    :host([reveal]) .eyebrow,
    :host([reveal]) .body {
      opacity: 0;
      transform: translateY(var(--motion-reveal-offset, 24px));
      transition:
        opacity var(--duration-reveal, 700ms) var(--ease-enter, ease),
        transform var(--duration-reveal, 700ms) var(--ease-enter, ease);
    }

    :host([reveal]) .body { transition-delay: 80ms; }

    :host([reveal]) .visible {
      opacity: 1;
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      :host([reveal]) .eyebrow,
      :host([reveal]) .body {
        opacity: 1;
        transform: none;
      }
    }
  `;

  constructor() {
    super();
    this.size = 'lg';
    this.reveal = false;
    this._visible = false;
  }

  updated(changed) {
    if (changed.has('reveal') && this.reveal && !this._observer) {
      this._observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this._visible = true;
          this._observer.disconnect();
        }
      }, { threshold: 0.15 });
      this._observer.observe(this);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = null;
  }

  render() {
    const cls = this._visible ? 'visible' : '';
    return html`
      ${this.eyebrow ? html`<span class="eyebrow ${cls}" part="eyebrow">${this.eyebrow}</span>` : ''}
      <div class="body ${cls}" part="body"><slot></slot></div>
    `;
  }
}

customElements.define('pastis-statement', PastisStatement);

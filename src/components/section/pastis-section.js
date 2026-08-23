import { LitElement, html, css } from 'lit';

export class PastisSection extends LitElement {
  static properties = {
    /** Small eyebrow label above heading */
    label:      { type: String },
    /** Section heading */
    heading:    { type: String },
    /** Section subheading / intro paragraph */
    subheading: { type: String },
    /** 'left' | 'center' | 'right' */
    align:      { type: String, reflect: true },
    /** 'sm' | 'md' | 'lg' | 'none' */
    padding:    { type: String, reflect: true },
    /** 'primary' | 'card' | 'elevated' | 'none' */
    background: { type: String, reflect: true },
    /** Show a top border rule */
    hasDivider: { type: Boolean, attribute: 'has-divider', reflect: true },
    /** CSS max-width value for the inner container */
    maxWidth:   { type: String, attribute: 'max-width' },
  };

  static styles = css`
    :host { display: block; }

    section {
      background: var(--bg-primary, #0d0d0d);
      padding: var(--space-4xl, 96px) var(--grid-margin, 40px);
    }

    :host([background="card"]) section     { background: var(--bg-card, #1e1e1e); }
    :host([background="elevated"]) section { background: var(--bg-elevated, #262522); }
    :host([background="none"]) section     { background: transparent; }

    :host([padding="sm"]) section  { padding-top: var(--space-2xl, 48px); padding-bottom: var(--space-2xl, 48px); }
    :host([padding="lg"]) section  { padding-top: var(--space-5xl, 128px); padding-bottom: var(--space-5xl, 128px); }
    :host([padding="none"]) section { padding-top: 0; padding-bottom: 0; }

    :host([has-divider]) section {
      border-top: var(--border-width, 1px) solid var(--border-default, #383c44);
    }

    .container {
      max-width: var(--section-max-width, 1100px);
      margin: 0 auto;
      width: 100%;
    }

    .header {
      margin-bottom: var(--space-3xl, 64px);
    }

    :host([align="center"]) .header { text-align: center; }
    :host([align="right"])  .header { text-align: right; }

    .label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-primary, #0d0d0d);
      color: var(--action-primary, #fcba28);
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      border-radius: var(--radius-full, 9999px);
      padding: 4px 12px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      margin-bottom: var(--space-md, 16px);
    }

    /* Light backgrounds need adjusted label */
    :host([background="card"]) .label,
    :host([background="elevated"]) .label {
      background: var(--bg-elevated, #262522);
    }

    h2 {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: clamp(22px, 4vw, 40px);
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-transform: uppercase;
      color: var(--text-primary, #f9f4da);
      margin: 0 0 var(--space-md, 16px);
    }

    p {
      font-family: var(--font-family-body, 'Outfit', sans-serif);
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-secondary, #f9f4da);
      margin: 0;
      max-width: 640px;
    }

    :host([align="center"]) p { margin-left: auto; margin-right: auto; }
    :host([align="right"])  p { margin-left: auto; }

    @media (max-width: 768px) {
      section { padding: var(--space-3xl, 64px) var(--grid-margin-mobile, 16px); }
    }
  `;

  constructor() {
    super();
    this.align = 'left';
    this.padding = 'md';
    this.background = 'primary';
    this.hasDivider = false;
  }

  render() {
    const hasHeader = this.label || this.heading || this.subheading;

    return html`
      <section part="section" style="${this.maxWidth ? `--section-max-width:${this.maxWidth}` : ''}">
        <div class="container" part="container">
          ${hasHeader ? html`
            <header class="header" part="header">
              ${this.label    ? html`<div class="label">${this.label}</div>` : ''}
              ${this.heading  ? html`<h2>${this.heading}</h2>`               : html`<slot name="heading"></slot>`}
              ${this.subheading ? html`<p>${this.subheading}</p>`            : html`<slot name="subheading"></slot>`}
            </header>
          ` : ''}
          <slot></slot>
        </div>
      </section>
    `;
  }
}

customElements.define('pastis-section', PastisSection);

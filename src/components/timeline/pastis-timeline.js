import { LitElement, html, css } from 'lit';

export class PastisTimeline extends LitElement {
  static properties = {
    /** @type {{ date: string, title: string, body: string, tag?: string, icon?: string }[]} */
    items:   { type: Array },
    /** 'default' | 'compact' */
    variant: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: block; }

    .timeline {
      position: relative;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    /* vertical rule */
    .timeline::before {
      content: '';
      position: absolute;
      left: 11px;
      top: 0;
      bottom: 0;
      width: var(--border-width, 1px);
      background: var(--border-default, #383c44);
    }

    .item {
      position: relative;
      padding: 0 0 var(--space-2xl, 48px) 40px;
    }

    .item:last-child {
      padding-bottom: 0;
    }

    /* dot */
    .dot {
      position: absolute;
      left: 0;
      top: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: var(--action-primary, #fcba28);
      flex-shrink: 0;
      z-index: 1;
    }

    .card {
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
      padding: var(--space-md, 16px);
      transition: box-shadow 120ms ease, transform 120ms ease;
    }

    .card:hover {
      box-shadow: var(--shadow-md, 5px 5px 0 #231f20);
      transform: translate(-2px, -2px);
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 8px);
      margin-bottom: var(--space-xs, 4px);
    }

    .date {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-tertiary, #909498);
    }

    .tag {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: var(--radius-full, 9999px);
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--action-primary, #fcba28);
    }

    .title {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      margin: 0 0 var(--space-xs, 4px);
    }

    .body {
      font-family: var(--font-family-body, 'Outfit', sans-serif);
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary, #f9f4da);
      margin: 0;
    }

    /* compact: tighter spacing, no card chrome */
    :host([variant="compact"]) .item {
      padding-bottom: var(--space-lg, 24px);
    }

    :host([variant="compact"]) .card {
      background: transparent;
      border: none;
      padding: 0;
      box-shadow: none;
      transform: none;
    }

    :host([variant="compact"]) .card:hover {
      box-shadow: none;
      transform: none;
    }
  `;

  constructor() {
    super();
    this.items = [];
    this.variant = 'default';
  }

  render() {
    return html`
      <ol class="timeline" part="timeline">
        ${this.items.map((item) => html`
          <li class="item" part="item">
            <div class="dot" aria-hidden="true">${item.icon || '◆'}</div>
            <div class="card" part="card">
              <div class="meta">
                ${item.date ? html`<span class="date">${item.date}</span>` : ''}
                ${item.tag  ? html`<span class="tag">${item.tag}</span>`   : ''}
              </div>
              <p class="title">${item.title}</p>
              ${item.body ? html`<p class="body">${item.body}</p>` : ''}
              <slot name="item-${item.title}"></slot>
            </div>
          </li>
        `)}
      </ol>
    `;
  }
}

customElements.define('pastis-timeline', PastisTimeline);

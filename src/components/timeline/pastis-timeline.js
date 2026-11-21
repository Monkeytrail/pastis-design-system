import { LitElement, html, css } from 'lit';

/**
 * Two-column list of roles or milestones: title in the display serif on the left,
 * meta line (tag · date) and optional body on the right, separated by hairlines.
 * Hovering a row dims the others.
 */
export class PastisTimeline extends LitElement {
  static properties = {
    /** @type {{ date?: string, title: string, body?: string, tag?: string }[]} */
    items:   { type: Array },
    /** 'default' | 'compact' */
    variant: { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      container-type: inline-size;
    }

    .timeline {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .item {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: baseline;
      gap: var(--space-lg, 24px);
      padding: var(--space-lg, 24px) 0;
      border-top: var(--border-width, 1px) solid var(--border-default, #383c44);
      transition: opacity var(--duration-base, 200ms) var(--ease-standard, ease);
    }

    .item:last-child {
      border-bottom: var(--border-width, 1px) solid var(--border-default, #383c44);
    }

    /* Dim the other rows while one is hovered */
    .timeline:has(.item:hover) .item { opacity: 0.35; }
    .timeline:has(.item:hover) .item:hover { opacity: 1; }

    .title {
      font-family: var(--font-family-display, 'Instrument Serif', serif);
      font-size: clamp(var(--font-size-h5, 19px), 2.5vw, var(--font-size-h3, 26px));
      font-weight: var(--font-weight-display, 400);
      line-height: var(--line-height-h3, 1.25);
      color: var(--text-primary, #f9f4da);
      margin: 0;
    }

    .detail {
      font-family: var(--font-family-body, 'Inter', sans-serif);
      font-size: var(--font-size-body-sm, 14px);
      line-height: var(--line-height-body-sm, 1.55);
      color: var(--text-tertiary, #909498);
    }

    .meta { margin: 0; }

    .body {
      margin: var(--space-xs, 4px) 0 0;
      color: var(--text-secondary, #f9f4da);
    }

    :host([variant="compact"]) .item {
      padding: var(--space-md, 16px) 0;
    }

    @container (max-width: 560px) {
      .item {
        grid-template-columns: 1fr;
        gap: var(--space-xs, 4px);
      }
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
        ${this.items.map((item) => {
          const meta = [item.tag, item.date].filter(Boolean).join(' · ');
          return html`
            <li class="item" part="item">
              <p class="title">${item.title}</p>
              <div class="detail" part="detail">
                ${meta ? html`<p class="meta">${meta}</p>` : ''}
                ${item.body ? html`<p class="body">${item.body}</p>` : ''}
                <slot name="item-${item.title}"></slot>
              </div>
            </li>
          `;
        })}
      </ol>
    `;
  }
}

customElements.define('pastis-timeline', PastisTimeline);

import { LitElement, html, css } from 'lit';

export class PastisBreadcrumb extends LitElement {
  static properties = {
    items: { type: Array },
    separator: { type: String },
    maxItems: { type: Number, attribute: 'max-items' },
  };

  static styles = css`
    :host { display: block; }

    nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0;
    }

    ol {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0;
    }

    li {
      display: inline-flex;
      align-items: center;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
    }

    .crumb {
      color: var(--text-tertiary, #909498);
      text-decoration: none;
      transition: color 120ms ease;
      padding: 4px 2px;
      border-radius: var(--radius-md, 6px);
    }

    .crumb:hover { color: var(--text-primary, #f9f4da); }

    .crumb:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .crumb.active {
      color: var(--text-primary, #f9f4da);
      font-weight: 700;
      cursor: default;
      pointer-events: none;
    }

    .crumb-icon { margin-right: 4px; font-size: 11px; }

    .separator {
      color: var(--text-tertiary, #909498);
      font-size: 12px;
      margin: 0 8px;
      user-select: none;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }

    .ellipsis {
      color: var(--text-tertiary, #909498);
      cursor: pointer;
      padding: 4px 6px;
      border-radius: var(--radius-md, 6px);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      font-size: 12px;
      transition: color 120ms ease;
      background: none;
      border: none;
    }

    .ellipsis:hover { color: var(--text-secondary, #fff); }

    .ellipsis:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }
  `;

  constructor() {
    super();
    this.items = [];
    this.separator = '/';
    this._expanded = false;
  }

  _getVisibleItems() {
    if (!this.maxItems || this.items.length <= this.maxItems || this._expanded) {
      return this.items;
    }
    const first = this.items[0];
    const last = this.items.slice(-Math.min(2, this.maxItems - 1));
    return [first, { id: '__ellipsis__', label: '…' }, ...last];
  }

  render() {
    const visible = this._getVisibleItems();

    return html`
      <nav aria-label="Breadcrumb">
        <ol>
          ${visible.map((item, i) => {
            const isLast = i === visible.length - 1;
            const isEllipsis = item.id === '__ellipsis__';

            return html`
              <li>
                ${isEllipsis
                  ? html`
                    <button class="ellipsis" @click="${() => { this._expanded = true; this.requestUpdate(); }}" aria-label="Show all breadcrumb items">…</button>
                  `
                  : isLast
                    ? html`<span class="crumb active" aria-current="page">${item.icon ? html`<span class="crumb-icon">${item.icon}</span>` : ''}${item.label}</span>`
                    : html`<a class="crumb" href="${item.href || '#'}">${item.icon ? html`<span class="crumb-icon">${item.icon}</span>` : ''}${item.label}</a>`
                }
                ${!isLast ? html`<span class="separator" aria-hidden="true">${this.separator}</span>` : ''}
              </li>
            `;
          })}
        </ol>
      </nav>
    `;
  }
}

customElements.define('pastis-breadcrumb', PastisBreadcrumb);

import { LitElement, html, css } from 'lit';

export class PastisPagination extends LitElement {
  static properties = {
    total: { type: Number },
    page: { type: Number, reflect: true },
    pageSize: { type: Number, attribute: 'page-size' },
    siblingCount: { type: Number, attribute: 'sibling-count' },
    variant: { type: String, reflect: true },
    showInfo: { type: Boolean, attribute: 'show-info' },
  };

  static styles = css`
    :host { display: block; }

    .pagination {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }

    .info {
      font-size: 11px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-tertiary, #909498);
      margin-left: auto;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      padding: 0 6px;
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      background: var(--bg-primary, #0d0d0d);
      cursor: pointer;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-tertiary, #909498);
      transition: border-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
      user-select: none;
    }

    .btn:hover:not(:disabled) {
      border-color: var(--text-primary, #f9f4da);
      color: var(--text-primary, #f9f4da);
    }

    .btn.active {
      background: var(--action-primary, #fcba28);
      border-color: var(--action-primary, #fcba28);
      color: #000;
      font-weight: 700;
    }

    .btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      color: var(--text-tertiary, #909498);
      font-size: 12px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
    }

    .nav-btn {
      font-size: 14px;
      min-width: 36px;
    }

    /* Pills variant */
    :host([variant="pills"]) .btn {
      border-radius: var(--radius-full, 9999px);
    }

    /* Minimal variant */
    :host([variant="minimal"]) .btn {
      border-color: transparent;
      background: none;
    }

    :host([variant="minimal"]) .btn:hover:not(:disabled) {
      background: rgba(252, 186, 40, 0.05);
      border-color: var(--text-primary, #f9f4da);
    }

    :host([variant="minimal"]) .btn.active {
      background: rgba(252, 186, 40, 0.15);
      color: var(--text-primary, #f9f4da);
      border-color: var(--text-primary, #f9f4da);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }
  `;

  constructor() {
    super();
    this.page = 1;
    this.pageSize = 10;
    this.total = 0;
    this.siblingCount = 1;
    this.variant = 'default';
    this.showInfo = false;
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  _getPages() {
    const total = this.totalPages;
    const current = this.page;
    const sibling = this.siblingCount;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const left = Math.max(2, current - sibling);
    const right = Math.min(total - 1, current + sibling);

    const pages = [1];
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('...');
    pages.push(total);

    return pages;
  }

  _goTo(page) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.dispatchEvent(new CustomEvent('pastis-page-change', {
      detail: { page: this.page, pageSize: this.pageSize },
      bubbles: true, composed: true
    }));
  }

  render() {
    const pages = this._getPages();
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.total);

    return html`
      <nav aria-label="Pagination">
        <span class="sr-only" aria-live="polite" aria-atomic="true">Page ${this.page} of ${this.totalPages}</span>
        <div class="pagination">
          <button
            class="btn nav-btn"
            @click="${() => this._goTo(this.page - 1)}"
            ?disabled="${this.page <= 1}"
            aria-label="Previous page"
          >←</button>

          ${pages.map(p =>
            p === '...'
              ? html`<span class="ellipsis">…</span>`
              : html`
                <button
                  class="btn ${p === this.page ? 'active' : ''}"
                  @click="${() => this._goTo(p)}"
                  aria-label="Page ${p}"
                  aria-current="${p === this.page ? 'page' : undefined}"
                >${p}</button>
              `
          )}

          <button
            class="btn nav-btn"
            @click="${() => this._goTo(this.page + 1)}"
            ?disabled="${this.page >= this.totalPages}"
            aria-label="Next page"
          >→</button>

          ${this.showInfo ? html`
            <span class="info">${start}–${end} of ${this.total}</span>
          ` : ''}
        </div>
      </nav>
    `;
  }
}

customElements.define('pastis-pagination', PastisPagination);

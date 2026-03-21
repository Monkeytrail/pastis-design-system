import { LitElement, html, css } from 'lit';

export class PastisAccordion extends LitElement {
  static properties = {
    items: { type: Array },
    multiple: { type: Boolean, reflect: true },
    variant: { type: String, reflect: true },
    openItems: { type: Array, attribute: false },
  };

  static styles = css`
    :host { display: block; }

    .accordion {
      display: flex;
      flex-direction: column;
      gap: 0;
      border: 4px solid var(--border-default, #00FF41);
      border-radius: 0;
      overflow: hidden;
    }

    :host([variant="flush"]) .accordion {
      border: none;
      border-radius: 0;
      box-shadow: none;
    }

    :host([variant="separated"]) .accordion {
      gap: 8px;
      border: none;
      background: none;
      overflow: visible;
      box-shadow: none;
    }

    .item {
      background: var(--bg-card, #0A0A0F);
      border-bottom: 4px solid var(--border-default, #00FF41);
    }

    .item:last-child { border-bottom: none; }

    :host([variant="flush"]) .item {
      border-radius: 0;
      border-bottom: 4px solid var(--border-default, #00FF41);
    }

    :host([variant="separated"]) .item {
      border: 4px solid var(--border-default, #00FF41);
      border-radius: 0;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      padding: 16px 20px;
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-primary, #00FF41);
      text-align: left;
      transition: background 50ms;
    }

    .header:hover { background: rgba(0, 255, 65, 0.05); }

    .header:focus-visible {
      outline: 4px solid var(--border-focus, #00FF41);
      outline-offset: 2px;
    }

    .header-content { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

    .icon { font-size: 16px; flex-shrink: 0; }

    .chevron {
      flex-shrink: 0;
      color: var(--text-tertiary, #808080);
      font-size: 12px;
      transition: transform 50ms;
      font-family: var(--font-family, 'Courier New', monospace);
    }

    .item.open .chevron { transform: rotate(180deg); }

    .body {
      overflow: hidden;
      height: 0;
      transition: height 100ms;
    }

    .body-inner {
      padding: 0 20px 16px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      color: var(--text-secondary, #fff);
      line-height: 1.6;
    }

    .badge {
      background: var(--bg-primary, #000);
      color: var(--text-tertiary, #808080);
      border: 2px solid var(--text-tertiary, #808080);
      border-radius: 0;
      font-size: 10px;
      font-weight: 700;
      font-family: var(--font-family, 'Courier New', monospace);
      padding: 1px 6px;
    }
  `;

  constructor() {
    super();
    this.items = [];
    this.multiple = false;
    this.openItems = [];
    this.variant = 'default';
  }

  _isOpen(id) {
    return this.openItems.includes(id);
  }

  _toggle(id) {
    if (this.multiple) {
      this.openItems = this._isOpen(id)
        ? this.openItems.filter(i => i !== id)
        : [...this.openItems, id];
    } else {
      this.openItems = this._isOpen(id) ? [] : [id];
    }
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('pastis-toggle', {
      detail: { id, open: this._isOpen(id) },
      bubbles: true, composed: true
    }));
  }

  updated() {
    this.shadowRoot?.querySelectorAll('.body').forEach(body => {
      const item = body.closest('.item');
      const inner = body.querySelector('.body-inner');
      if (item?.classList.contains('open')) {
        body.style.height = inner.scrollHeight + 'px';
      } else {
        body.style.height = '0px';
      }
    });
  }

  render() {
    return html`
      <div class="accordion" part="accordion">
        ${this.items.map(item => html`
          <div class="item ${this._isOpen(item.id) ? 'open' : ''}" part="item">
            <button
              class="header"
              @click="${() => this._toggle(item.id)}"
              aria-expanded="${this._isOpen(item.id)}"
              aria-controls="body-${item.id}"
              part="header"
            >
              <span class="header-content">
                ${item.icon ? html`<span class="icon" aria-hidden="true">${item.icon}</span>` : ''}
                <span>${item.title}</span>
                ${item.badge !== undefined ? html`<span class="badge">${item.badge}</span>` : ''}
              </span>
              <span class="chevron" aria-hidden="true">▾</span>
            </button>
            <div class="body" id="body-${item.id}" role="region" part="body">
              <div class="body-inner">${item.content}</div>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('pastis-accordion', PastisAccordion);

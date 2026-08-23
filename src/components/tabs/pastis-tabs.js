import { LitElement, html, css } from 'lit';

export class PastisTabs extends LitElement {
  static properties = {
    tabs: { type: Array },
    active: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    fullWidth: { type: Boolean, attribute: 'full-width', reflect: true },
  };

  static styles = css`
    :host { display: block; }

    .tabs-container { display: flex; flex-direction: column; }

    .tab-list {
      display: flex;
      border-bottom: var(--border-width, 1px) solid var(--border-default, #383c44);
      overflow-x: auto;
      scrollbar-width: none;
      gap: 0;
    }

    .tab-list::-webkit-scrollbar { display: none; }

    :host([variant="pills"]) .tab-list {
      border-bottom: none;
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
      padding: 4px;
      gap: 4px;
    }

    :host([full-width]) .tab-list { justify-content: stretch; }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-tertiary, #909498);
      background: none;
      border: none;
      border-bottom: var(--border-width, 1px) solid transparent;
      margin-bottom: calc(-1 * var(--border-width, 1px));
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      transition: color 120ms ease;
    }

    :host([size="sm"]) .tab-btn { padding: 7px 12px; font-size: 11px; }
    :host([size="lg"]) .tab-btn { padding: 13px 20px; font-size: 13px; }

    :host([full-width]) .tab-btn { flex: 1; justify-content: center; }

    .tab-btn:hover { color: var(--text-secondary, #fff); }

    .tab-btn.active {
      color: var(--text-primary, #f9f4da);
      border-bottom-color: var(--text-primary, #f9f4da);
      font-weight: 700;
    }

    .tab-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .tab-btn:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    /* Pills variant */
    :host([variant="pills"]) .tab-btn {
      border-bottom: none;
      border-radius: var(--radius-sm, 4px);
      margin-bottom: 0;
      border: var(--border-width, 1px) solid transparent;
    }

    :host([variant="pills"]) .tab-btn.active {
      background: var(--action-primary, #fcba28);
      color: #000;
      border-color: var(--action-primary, #fcba28);
    }

    .badge {
      background: var(--bg-elevated, #383c44);
      color: var(--text-tertiary, #909498);
      border-radius: var(--radius-full, 9999px);
      border: var(--border-width, 1px) solid currentColor;
      font-size: 10px;
      font-weight: 700;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      padding: 1px 5px;
      line-height: 14px;
    }

    .tab-btn.active .badge {
      background: var(--bg-primary, #0d0d0d);
      color: var(--text-primary, #f9f4da);
      border-color: var(--text-primary, #f9f4da);
    }

    :host([variant="pills"]) .tab-btn.active .badge {
      background: #000;
      color: var(--text-primary, #f9f4da);
      border-color: var(--text-primary, #f9f4da);
    }

    .tab-panel {
      padding: 20px 0;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      color: var(--text-secondary, #fff);
      font-size: 14px;
    }
  `;

  constructor() {
    super();
    this.tabs = [];
    this.variant = 'default';
    this.size = 'md';
    this.fullWidth = false;
  }

  updated(changed) {
    if (changed.has('tabs') && this.tabs.length && !this.active) {
      const firstEnabled = this.tabs.find(t => !t.disabled);
      if (firstEnabled) this.active = firstEnabled.id;
    }
  }

  _selectTab(tab) {
    if (tab.disabled) return;
    this.active = tab.id;
    this.dispatchEvent(new CustomEvent('pastis-tab-change', {
      detail: { tab: tab.id },
      bubbles: true, composed: true
    }));
  }

  _handleKeydown(e, tab) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._selectTab(tab);
    } else if (e.key === 'ArrowRight') {
      const idx = this.tabs.indexOf(tab);
      const next = this.tabs.find((t, i) => i > idx && !t.disabled);
      if (next) { this._selectTab(next); this.shadowRoot?.querySelector(`[data-id="${next.id}"]`)?.focus(); }
    } else if (e.key === 'ArrowLeft') {
      const idx = this.tabs.indexOf(tab);
      const prev = [...this.tabs].reverse().find((t, i) => this.tabs.length - 1 - i < idx && !t.disabled);
      if (prev) { this._selectTab(prev); this.shadowRoot?.querySelector(`[data-id="${prev.id}"]`)?.focus(); }
    }
  }

  render() {
    const activeTab = this.tabs.find(t => t.id === this.active);

    return html`
      <div class="tabs-container">
        <div class="tab-list" role="tablist" part="tablist">
          ${this.tabs.map(tab => html`
            <button
              class="tab-btn ${tab.id === this.active ? 'active' : ''}"
              role="tab"
              aria-selected="${tab.id === this.active}"
              aria-controls="panel-${tab.id}"
              data-id="${tab.id}"
              ?disabled="${tab.disabled}"
              @click="${() => this._selectTab(tab)}"
              @keydown="${e => this._handleKeydown(e, tab)}"
              tabindex="${tab.id === this.active ? 0 : -1}"
              part="tab"
            >
              ${tab.icon ? html`<span aria-hidden="true">${tab.icon}</span>` : ''}
              ${tab.label}
              ${tab.badge !== undefined ? html`<span class="badge">${tab.badge}</span>` : ''}
            </button>
          `)}
        </div>
        <div
          class="tab-panel"
          id="panel-${this.active}"
          role="tabpanel"
          part="panel"
        >
          ${activeTab?.content ? html`${activeTab.content}` : html`<slot name="${this.active}"></slot>`}
        </div>
      </div>
    `;
  }
}

customElements.define('pastis-tabs', PastisTabs);

import { LitElement, html, css } from 'lit';

export class PastisFilterChip extends LitElement {
  static properties = {
    label:    { type: String },
    value:    { type: String },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    removable: { type: Boolean, reflect: true },
    icon:     { type: String },
    count:    { type: Number },
  };

  static styles = css`
    :host { display: inline-block; }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 12px;
      height: 34px;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      color: var(--text-tertiary, #909498);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      border-radius: var(--radius-full, 9999px);
      transition: border-color 120ms ease, color 120ms ease;
      white-space: nowrap;
    }

    :host([removable]) .chip {
      padding-right: 6px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
    }

    .chip:hover {
      border-color: var(--action-primary, #fcba28);
      color: var(--text-secondary, #fff);
    }

    :host([selected]) .chip {
      background: var(--action-primary, #fcba28);
      border-color: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #000);
      filter: brightness(0.9);
    }

    :host([disabled]) .chip,
    :host([disabled]) .remove {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    .icon { font-size: 14px; }
    .count {
      background: var(--bg-elevated, #383c44);
      color: var(--text-tertiary, #909498);
      font-size: 10px;
      padding: 1px 5px;
      min-width: 18px;
      text-align: center;
      border-radius: var(--radius-full, 9999px);
    }

    :host([selected]) .count {
      background: var(--action-primary-text, #000);
      color: var(--action-primary, #fcba28);
    }

    .remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 34px;
      width: 28px;
      padding: 0;
      margin: 0;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-left: none;
      border-top-right-radius: var(--radius-full, 9999px);
      border-bottom-right-radius: var(--radius-full, 9999px);
      color: var(--text-tertiary, #909498);
      font-size: 13px;
      line-height: 1;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      cursor: pointer;
      transition: border-color 120ms ease, color 120ms ease;
    }
    .remove:hover { color: var(--text-secondary, #fff); border-color: var(--action-primary, #fcba28); }

    :host([selected]) .remove {
      background: var(--action-primary, #fcba28);
      border-color: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #000);
      filter: brightness(0.9);
    }

    .chip:focus-visible,
    .remove:focus-visible { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.selected = false;
    this.disabled = false;
    this.removable = false;
  }

  _toggle() {
    if (this.disabled) return;
    this.selected = !this.selected;
    this.dispatchEvent(new CustomEvent('pastis-toggle', {
      detail: { selected: this.selected, value: this.value },
      bubbles: true, composed: true,
    }));
  }

  _remove(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('pastis-remove', {
      detail: { value: this.value },
      bubbles: true, composed: true,
    }));
  }

  render() {
    const name = this.label || this.value || '';
    return html`
      <span part="filter-chip">
        <button class="chip" @click=${this._toggle} aria-pressed="${this.selected}" ?disabled=${this.disabled}>
          ${this.icon ? html`<span class="icon" aria-hidden="true">${this.icon}</span>` : ''}
          ${name}
          ${this.count != null ? html`<span class="count">${this.count}</span>` : ''}
        </button>
        ${this.removable ? html`
          <button class="remove" @click=${this._remove} aria-label="Remove ${name}" ?disabled=${this.disabled}>✕</button>
        ` : ''}
      </span>
    `;
  }
}

customElements.define('pastis-filter-chip', PastisFilterChip);


export class PastisFilterBar extends LitElement {
  static properties = {
    filters: { type: Array },
    active:  { type: Array },
    label:   { type: String },
  };

  static styles = css`
    :host { display: block; }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      padding: 12px 0;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }

    .filter-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-tertiary, #909498);
      margin-right: 4px;
      white-space: nowrap;
    }

    .clear-btn {
      background: none;
      border: var(--border-width, 1px) solid var(--action-ghost-border, #909498);
      border-radius: var(--radius-full, 9999px);
      color: var(--text-tertiary, #909498);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      height: 34px;
      cursor: pointer;
    }

    .clear-btn:hover { border-color: var(--status-error, #f0505e); color: var(--status-error, #f0505e); }
  `;

  constructor() {
    super();
    this.filters = [];
    this.active = [];
    this.label = 'Filter';
  }

  _isActive(value) { return this.active.includes(value); }

  _handleToggle(e) {
    const { value, selected } = e.detail;
    this.active = selected
      ? [...this.active, value]
      : this.active.filter(v => v !== value);
    this.dispatchEvent(new CustomEvent('pastis-filter-change', {
      detail: { active: this.active },
      bubbles: true, composed: true,
    }));
  }

  _clearAll() {
    this.active = [];
    this.dispatchEvent(new CustomEvent('pastis-filter-change', {
      detail: { active: [] },
      bubbles: true, composed: true,
    }));
  }

  render() {
    return html`
      <div class="filter-bar" part="filter-bar">
        ${this.label ? html`<span class="filter-label">${this.label}:</span>` : ''}
        ${this.filters.map(f => html`
          <pastis-filter-chip
            .label=${f.label}
            .value=${f.value}
            .icon=${f.icon || ''}
            .count=${f.count}
            ?selected=${this._isActive(f.value)}
            @pastis-toggle=${this._handleToggle}
          ></pastis-filter-chip>
        `)}
        ${this.active.length > 0 ? html`
          <button class="clear-btn" @click=${this._clearAll}>✕ Clear</button>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('pastis-filter-bar', PastisFilterBar);

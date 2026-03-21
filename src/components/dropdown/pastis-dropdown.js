import { LitElement, html, css } from 'lit';

export class PastisDropdown extends LitElement {
  static properties = {
    label: { type: String },
    placeholder: { type: String },
    options: { type: Array },
    value: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    searchable: { type: Boolean, reflect: true },
    multiple: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    error: { type: String },
  };

  static styles = css`
    :host { display: block; }

    .field { display: flex; flex-direction: column; gap: 6px; }

    label {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
    }

    .trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 12px;
      height: auto;
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      cursor: pointer;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      transition: border-color 120ms ease;
      user-select: none;
    }

    :host([size="sm"]) .trigger { font-size: 12px; padding: 8px 10px; }
    :host([size="lg"]) .trigger { font-size: 16px; padding: 12px 16px; }

    .trigger:hover { border-color: var(--text-tertiary, #909498); }

    :host([open]) .trigger {
      border-color: var(--border-focus, #fcba28);
    }

    :host([disabled]) .trigger {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .trigger-text { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .placeholder { color: var(--text-tertiary, #909498); }

    .chevron {
      flex-shrink: 0;
      color: var(--text-tertiary, #909498);
      transition: transform 120ms ease;
      font-size: 12px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }

    :host([open]) .chevron { transform: rotate(180deg); }

    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
      border-radius: var(--radius-md, 6px);
      z-index: 1000;
      overflow: hidden;
      max-height: 260px;
      display: flex;
      flex-direction: column;
    }

    .search-wrap {
      padding: 8px;
      border-bottom: var(--border-width, 1px) solid var(--border-default, #fcba28);
      flex-shrink: 0;
    }

    .search-input {
      width: 100%;
      padding: 6px 10px;
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      font-weight: 700;
      background: var(--bg-primary, #0d0d0d);
      color: var(--text-secondary, #fff);
      outline: none;
      box-sizing: border-box;
    }

    .search-input:focus { border-color: var(--border-focus, #fcba28); }

    .options-list {
      overflow-y: auto;
      padding: 4px;
    }

    .option {
      padding: 8px 12px;
      border-radius: var(--radius-md, 6px);
      cursor: pointer;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      transition: background 120ms ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .option:hover { background: rgba(252, 186, 40, 0.1); color: var(--text-primary, #f9f4da); }

    .option.selected {
      background: var(--action-primary, #fcba28);
      color: #000;
    }

    .option.disabled {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }

    .check { margin-left: auto; font-size: 12px; }

    .no-options {
      padding: 16px;
      text-align: center;
      color: var(--text-tertiary, #909498);
      font-size: 12px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
    }

    .wrap {
      position: relative;
    }

    .error-text {
      font-size: 11px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      color: var(--status-error, #ed203d);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
    }
  `;

  constructor() {
    super();
    this.options = [];
    this.open = false;
    this.disabled = false;
    this.searchable = false;
    this.multiple = false;
    this.size = 'md';
    this._search = '';
    this._selectedValues = [];
    this._boundClose = this._handleOutsideClick.bind(this);
    this._focusedIndex = -1;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._boundClose);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundClose);
  }

  _handleOutsideClick(e) {
    if (!this.contains(e.target)) this.open = false;
  }

  _toggle() {
    if (this.disabled) return;
    this.open = !this.open;
    if (this.open) {
      this._focusedIndex = -1;
      if (this.searchable) {
        requestAnimationFrame(() => this.shadowRoot?.querySelector('.search-input')?.focus());
      } else {
        requestAnimationFrame(() => this._focusOptionAt(0));
      }
    }
  }

  _getOptionElements() {
    return Array.from(this.shadowRoot?.querySelectorAll('.option') || []);
  }

  _focusOptionAt(index) {
    const opts = this._getOptionElements();
    if (!opts.length) return;
    const clamped = Math.max(0, Math.min(index, opts.length - 1));
    this._focusedIndex = clamped;
    opts[clamped]?.focus();
  }

  _handleTriggerKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this.open) {
        this.open = true;
        this._focusedIndex = -1;
        requestAnimationFrame(() => this._focusOptionAt(0));
      } else {
        this._focusOptionAt(this._focusedIndex + 1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.open) {
        this._focusOptionAt(this._focusedIndex - 1);
      }
    } else if (e.key === 'Escape') {
      if (this.open) {
        this.open = false;
        this.shadowRoot?.querySelector('.trigger')?.focus();
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      this._toggle();
    }
  }

  _handleOptionKeydown(e, opt, index) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._focusOptionAt(index + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        this.shadowRoot?.querySelector('.trigger')?.focus();
      } else {
        this._focusOptionAt(index - 1);
      }
    } else if (e.key === 'Escape') {
      this.open = false;
      this.shadowRoot?.querySelector('.trigger')?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._selectOption(opt);
    }
  }

  _selectOption(opt) {
    if (opt.disabled) return;
    if (this.multiple) {
      const idx = this._selectedValues.indexOf(opt.value);
      if (idx > -1) this._selectedValues = this._selectedValues.filter(v => v !== opt.value);
      else this._selectedValues = [...this._selectedValues, opt.value];
      this.requestUpdate();
    } else {
      this.value = opt.value;
      this.open = false;
      this._search = '';
    }
    this.dispatchEvent(new CustomEvent('pastis-change', {
      detail: { value: this.multiple ? this._selectedValues : opt.value, option: opt },
      bubbles: true, composed: true
    }));
  }

  _getLabel() {
    if (this.multiple) {
      if (!this._selectedValues.length) return null;
      return this._selectedValues.map(v => this.options.find(o => o.value === v)?.label || v).join(', ');
    }
    return this.options.find(o => o.value === this.value)?.label || null;
  }

  _isSelected(opt) {
    if (this.multiple) return this._selectedValues.includes(opt.value);
    return opt.value === this.value;
  }

  _getFilteredOptions() {
    if (!this._search) return this.options;
    return this.options.filter(o => o.label.toLowerCase().includes(this._search.toLowerCase()));
  }

  render() {
    const selectedLabel = this._getLabel();
    const filtered = this._getFilteredOptions();

    return html`
      <div class="field">
        ${this.label ? html`<label>${this.label}</label>` : ''}
        <div class="wrap">
          <div
            class="trigger"
            @click="${this._toggle}"
            @keydown="${this._handleTriggerKeydown}"
            tabindex="${this.disabled ? -1 : 0}"
            role="combobox"
            aria-expanded="${this.open}"
            aria-haspopup="listbox"
            part="trigger"
          >
            <span class="trigger-text">
              ${selectedLabel
                ? html`${selectedLabel}`
                : html`<span class="placeholder">${this.placeholder || 'Select an option'}</span>`
              }
            </span>
            <span class="chevron">▾</span>
          </div>

          ${this.open ? html`
            <div class="dropdown" part="dropdown">
              ${this.searchable ? html`
                <div class="search-wrap">
                  <input
                    class="search-input"
                    type="text"
                    placeholder="Search…"
                    .value="${this._search}"
                    @input="${e => { this._search = e.target.value; this.requestUpdate(); }}"
                    @click="${e => e.stopPropagation()}"
                  />
                </div>
              ` : ''}
              <div class="options-list" role="listbox">
                ${filtered.length ? filtered.map((opt, index) => html`
                  <div
                    class="option ${this._isSelected(opt) ? 'selected' : ''} ${opt.disabled ? 'disabled' : ''}"
                    role="option"
                    aria-selected="${this._isSelected(opt) ? 'true' : 'false'}"
                    aria-disabled="${opt.disabled ? 'true' : 'false'}"
                    @click="${e => { e.stopPropagation(); this._selectOption(opt); }}"
                    @keydown="${e => this._handleOptionKeydown(e, opt, index)}"
                    tabindex="${opt.disabled ? -1 : 0}"
                  >
                    ${opt.icon ? html`<span>${opt.icon}</span>` : ''}
                    ${opt.label}
                    ${this._isSelected(opt) ? html`<span class="check">✓</span>` : ''}
                  </div>
                `) : html`<div class="no-options">No options found</div>`}
              </div>
            </div>
          ` : ''}
        </div>
        ${this.error ? html`<span class="error-text">⚠ ${this.error}</span>` : ''}
      </div>
    `;
  }
}

customElements.define('pastis-dropdown', PastisDropdown);

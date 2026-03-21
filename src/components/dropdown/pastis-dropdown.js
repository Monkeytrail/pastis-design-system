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
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-primary, #00FF41);
    }

    .trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 12px;
      height: auto;
      background: var(--bg-primary, #000);
      border: 4px solid var(--border-subtle, #1A1A1A);
      border-radius: 0;
      cursor: pointer;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      transition: border-color 50ms;
      user-select: none;
    }

    :host([size="sm"]) .trigger { font-size: 12px; padding: 8px 10px; }
    :host([size="lg"]) .trigger { font-size: 16px; padding: 12px 16px; }

    .trigger:hover { border-color: var(--text-tertiary, #808080); }

    :host([open]) .trigger {
      border-color: var(--border-focus, #00FF41);
    }

    :host([disabled]) .trigger {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .trigger-text { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .placeholder { color: var(--text-tertiary, #808080); }

    .chevron {
      flex-shrink: 0;
      color: var(--text-tertiary, #808080);
      transition: transform 50ms;
      font-size: 12px;
      font-family: var(--font-family, 'Courier New', monospace);
    }

    :host([open]) .chevron { transform: rotate(180deg); }

    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--bg-card, #0A0A0F);
      border: 4px solid var(--border-default, #00FF41);
      border-radius: 0;
      z-index: 1000;
      overflow: hidden;
      max-height: 260px;
      display: flex;
      flex-direction: column;
    }

    .search-wrap {
      padding: 8px;
      border-bottom: 4px solid var(--border-default, #00FF41);
      flex-shrink: 0;
    }

    .search-input {
      width: 100%;
      padding: 6px 10px;
      border: 3px solid var(--border-subtle, #1A1A1A);
      border-radius: 0;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 12px;
      font-weight: 700;
      background: var(--bg-primary, #000);
      color: var(--text-secondary, #fff);
      outline: none;
      box-sizing: border-box;
    }

    .search-input:focus { border-color: var(--border-focus, #00FF41); }

    .options-list {
      overflow-y: auto;
      padding: 4px;
    }

    .option {
      padding: 8px 12px;
      border-radius: 0;
      cursor: pointer;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      transition: background 50ms;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .option:hover { background: rgba(0, 255, 65, 0.1); color: var(--text-primary, #00FF41); }

    .option.selected {
      background: var(--action-primary, #00FF41);
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
      color: var(--text-tertiary, #808080);
      font-size: 12px;
      font-family: var(--font-family, 'Courier New', monospace);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .wrap {
      position: relative;
    }

    .error-text {
      font-size: 11px;
      font-family: var(--font-family, 'Courier New', monospace);
      color: var(--status-error, #FF006E);
      text-transform: uppercase;
      letter-spacing: 1px;
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
    if (this.open && this.searchable) {
      requestAnimationFrame(() => this.shadowRoot?.querySelector('.search-input')?.focus());
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
            @keydown="${e => (e.key === 'Enter' || e.key === ' ') && this._toggle()}"
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
                ${filtered.length ? filtered.map(opt => html`
                  <div
                    class="option ${this._isSelected(opt) ? 'selected' : ''} ${opt.disabled ? 'disabled' : ''}"
                    role="option"
                    aria-selected="${this._isSelected(opt)}"
                    @click="${e => { e.stopPropagation(); this._selectOption(opt); }}"
                    @keydown="${e => (e.key === 'Enter' || e.key === ' ') && this._selectOption(opt)}"
                    tabindex="0"
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

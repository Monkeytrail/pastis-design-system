import { LitElement, html, css } from 'lit';

export class PastisSearch extends LitElement {
  static properties = {
    placeholder: { type: String },
    value: { type: String, reflect: true },
    suggestions: { type: Array },
    loading: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
    label: { type: String },
    minChars: { type: Number, attribute: 'min-chars' },
    noResultsText: { type: String, attribute: 'no-results-text' },
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

    .wrap { position: relative; }

    .search-input {
      width: 100%;
      padding: 10px 40px 10px 38px;
      height: auto;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      background: var(--bg-primary, #000);
      border: 4px solid var(--border-subtle, #1A1A1A);
      border-radius: 0;
      outline: none;
      transition: border-color 50ms;
      box-sizing: border-box;
    }

    :host([size="sm"]) .search-input { font-size: 12px; padding: 7px 32px 7px 30px; }
    :host([size="lg"]) .search-input { font-size: 16px; padding: 13px 48px 13px 44px; }

    .search-input:focus {
      border-color: var(--border-focus, #00FF41);
      box-shadow: 4px 4px 0 var(--border-focus, #00FF41);
    }

    .search-input::placeholder { color: var(--text-tertiary, #808080); }

    :host([disabled]) .search-input { opacity: 0.3; cursor: not-allowed; }

    .icon-wrap {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      color: var(--text-tertiary, #808080);
      pointer-events: none;
    }

    .search-icon { left: 12px; font-size: 14px; }
    :host([size="sm"]) .search-icon { left: 9px; font-size: 12px; }
    :host([size="lg"]) .search-icon { left: 14px; font-size: 16px; }

    .clear-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: var(--bg-elevated, #1A1A1A);
      border: 2px solid var(--text-tertiary, #808080);
      border-radius: 0;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-tertiary, #808080);
      font-size: 11px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      transition: color 50ms, border-color 50ms;
      pointer-events: all;
    }

    .clear-btn:hover { color: var(--text-primary, #00FF41); border-color: var(--text-primary, #00FF41); }

    .spinner-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      border: 3px solid var(--border-subtle, #1A1A1A);
      border-top-color: var(--text-primary, #00FF41);
      border-radius: 0;
      animation: pixel-spin 0.5s steps(8) infinite;
    }

    @keyframes pixel-spin { to { transform: translateY(-50%) rotate(360deg); } }

    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--bg-card, #0A0A0F);
      border: 4px solid var(--border-default, #00FF41);
      border-radius: 0;
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
      padding: 4px;
    }

    .suggestion {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 0;
      cursor: pointer;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      transition: background 50ms;
    }

    .suggestion:hover, .suggestion.focused {
      background: rgba(0, 255, 65, 0.1);
      color: var(--text-primary, #00FF41);
    }

    .suggestion-icon { color: var(--text-tertiary, #808080); font-size: 13px; }

    .suggestion-label { flex: 1; }

    .suggestion-sub {
      font-size: 11px;
      color: var(--text-tertiary, #808080);
      font-family: var(--font-family, 'Courier New', monospace);
    }

    .no-results {
      padding: 16px;
      text-align: center;
      color: var(--text-tertiary, #808080);
      font-size: 11px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    mark {
      background: var(--action-primary, #00FF41);
      color: #000;
      border-radius: 0;
      padding: 0 2px;
      font-weight: 700;
    }
  `;

  constructor() {
    super();
    this.value = '';
    this.suggestions = [];
    this.open = false;
    this.loading = false;
    this.disabled = false;
    this.size = 'md';
    this.minChars = 1;
    this.noResultsText = 'No results found';
    this._focusedIndex = -1;
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

  _handleInput(e) {
    this.value = e.target.value;
    this._focusedIndex = -1;
    this.open = this.value.length >= this.minChars;
    this.dispatchEvent(new CustomEvent('pastis-search', {
      detail: { value: this.value },
      bubbles: true, composed: true
    }));
  }

  _handleKeydown(e) {
    const items = this.suggestions;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._focusedIndex = Math.min(this._focusedIndex + 1, items.length - 1);
      this.requestUpdate();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._focusedIndex = Math.max(this._focusedIndex - 1, -1);
      this.requestUpdate();
    } else if (e.key === 'Enter') {
      if (this._focusedIndex >= 0 && items[this._focusedIndex]) {
        this._select(items[this._focusedIndex]);
      } else {
        this.dispatchEvent(new CustomEvent('pastis-submit', { detail: { value: this.value }, bubbles: true, composed: true }));
        this.open = false;
      }
    } else if (e.key === 'Escape') {
      this.open = false;
    }
  }

  _select(item) {
    this.value = item.label || item.value || item;
    this.open = false;
    this.dispatchEvent(new CustomEvent('pastis-select', {
      detail: { item },
      bubbles: true, composed: true
    }));
  }

  _clear() {
    this.value = '';
    this.open = false;
    this.shadowRoot?.querySelector('.search-input')?.focus();
    this.dispatchEvent(new CustomEvent('pastis-clear', { bubbles: true, composed: true }));
  }

  _highlight(text) {
    if (!this.value) return text;
    const idx = text.toLowerCase().indexOf(this.value.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + this.value.length) + '</mark>' + text.slice(idx + this.value.length);
  }

  render() {
    return html`
      <div class="field">
        ${this.label ? html`<label>${this.label}</label>` : ''}
        <div class="wrap" @click="${e => e.stopPropagation()}">
          <span class="icon-wrap search-icon" aria-hidden="true">🔍</span>
          <input
            class="search-input"
            type="search"
            placeholder="${this.placeholder || 'Search…'}"
            .value="${this.value}"
            ?disabled="${this.disabled}"
            autocomplete="off"
            role="combobox"
            aria-expanded="${this.open}"
            aria-autocomplete="list"
            @input="${this._handleInput}"
            @focus="${() => { if (this.value.length >= this.minChars) this.open = true; }}"
            @keydown="${this._handleKeydown}"
            part="input"
          />
          ${this.loading ? html`<span class="spinner-icon"></span>` : ''}
          ${this.value && !this.loading ? html`
            <button class="clear-btn" @click="${this._clear}" aria-label="Clear search">✕</button>
          ` : ''}

          ${this.open ? html`
            <div class="dropdown" role="listbox" part="dropdown">
              ${this.suggestions.length ? this.suggestions.map((item, i) => html`
                <div
                  class="suggestion ${i === this._focusedIndex ? 'focused' : ''}"
                  role="option"
                  @click="${() => this._select(item)}"
                >
                  ${item.icon ? html`<span class="suggestion-icon">${item.icon}</span>` : ''}
                  <span class="suggestion-label" .innerHTML="${this._highlight(item.label || item)}"></span>
                  ${item.sub ? html`<span class="suggestion-sub">${item.sub}</span>` : ''}
                </div>
              `) : html`
                <div class="no-results">${this.noResultsText}</div>
              `}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('pastis-search', PastisSearch);

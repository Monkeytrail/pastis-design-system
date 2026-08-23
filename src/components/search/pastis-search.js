import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

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
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
    }

    .wrap { position: relative; }

    .search-input {
      width: 100%;
      padding: 10px 40px 10px 38px;
      height: auto;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      outline: none;
      transition: border-color 120ms ease;
      box-sizing: border-box;
    }

    :host([size="sm"]) .search-input { font-size: 12px; padding: 7px 32px 7px 30px; }
    :host([size="lg"]) .search-input { font-size: 16px; padding: 13px 48px 13px 44px; }

    .search-input:focus {
      border-color: var(--border-focus, #fcba28);
      box-shadow: 4px 4px 0 var(--border-focus, #fcba28);
    }

    .search-input::placeholder { color: var(--text-tertiary, #909498); }

    :host([disabled]) .search-input { opacity: 0.3; cursor: not-allowed; }

    .icon-wrap {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      color: var(--text-tertiary, #909498);
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
      background: var(--bg-elevated, #383c44);
      border: var(--border-width, 1px) solid var(--text-tertiary, #909498);
      border-radius: var(--radius-sm, 4px);
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-tertiary, #909498);
      font-size: 11px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      transition: color 120ms ease, border-color 120ms ease;
      pointer-events: all;
    }

    .clear-btn:hover { color: var(--text-primary, #f9f4da); border-color: var(--text-primary, #f9f4da); }

    .spinner-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-top-color: var(--text-primary, #f9f4da);
      border-radius: var(--radius-sm, 4px);
      animation: pixel-spin 0.5s steps(8) infinite;
    }

    @keyframes pixel-spin { to { transform: translateY(-50%) rotate(360deg); } }

    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
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
      border-radius: var(--radius-md, 6px);
      cursor: pointer;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      transition: background 120ms ease;
    }

    .suggestion:hover, .suggestion.focused {
      background: rgba(252, 186, 40, 0.1);
      color: var(--text-primary, #f9f4da);
    }

    .suggestion-icon { color: var(--text-tertiary, #909498); font-size: 13px; }

    .suggestion-label { flex: 1; }

    .suggestion-sub {
      font-size: 11px;
      color: var(--text-tertiary, #909498);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
    }

    .no-results {
      padding: 16px;
      text-align: center;
      color: var(--text-tertiary, #909498);
      font-size: 11px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
    }

    mark {
      background: var(--action-primary, #fcba28);
      color: #000;
      border-radius: var(--radius-xs, 2px);
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
    this._listboxId = `pastis-search-listbox-${Math.random().toString(36).slice(2, 9)}`;
  }

  _optionId(index) {
    return `${this._listboxId}-option-${index}`;
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
    if (!this.value) return html`${text}`;
    const idx = text.toLowerCase().indexOf(this.value.toLowerCase());
    if (idx === -1) return html`${text}`;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + this.value.length);
    const after = text.slice(idx + this.value.length);
    return html`${before}<mark>${match}</mark>${after}`;
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
            aria-controls="${this._listboxId}"
            aria-activedescendant="${ifDefined(this._focusedIndex >= 0 ? this._optionId(this._focusedIndex) : undefined)}"
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
            <div class="dropdown" role="listbox" id="${this._listboxId}" part="dropdown">
              ${this.suggestions.length ? this.suggestions.map((item, i) => html`
                <div
                  id="${this._optionId(i)}"
                  class="suggestion ${i === this._focusedIndex ? 'focused' : ''}"
                  role="option"
                  aria-selected="${i === this._focusedIndex}"
                  @click="${() => this._select(item)}"
                >
                  ${item.icon ? html`<span class="suggestion-icon">${item.icon}</span>` : ''}
                  <span class="suggestion-label">${this._highlight(item.label || item)}</span>
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

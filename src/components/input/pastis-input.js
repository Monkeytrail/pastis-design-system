import { LitElement, html, css } from 'lit';

export class PastisInput extends LitElement {
  static properties = {
    label: { type: String },
    placeholder: { type: String },
    value: { type: String, reflect: true },
    type: { type: String },
    helper: { type: String },
    error: { type: String },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    leadingIcon: { type: String, attribute: 'leading-icon' },
    trailingIcon: { type: String, attribute: 'trailing-icon' },
    name: { type: String },
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
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required-dot {
      color: var(--status-error, #FF006E);
      font-size: 16px;
      line-height: 1;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    input {
      width: 100%;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      background: var(--bg-primary, #000);
      border: 4px solid var(--border-subtle, #1A1A1A);
      border-radius: 0;
      padding: 10px 12px;
      height: auto;
      outline: none;
      transition: border-color 50ms;
      box-sizing: border-box;
    }

    :host([size="sm"]) input { font-size: 12px; padding: 8px 10px; }
    :host([size="lg"]) input { font-size: 16px; padding: 12px 16px; }

    input:hover { border-color: var(--text-tertiary, #808080); }

    input:focus {
      border-color: var(--border-focus, #00FF41);
      box-shadow: 4px 4px 0 var(--border-focus, #00FF41);
    }

    input::placeholder { color: var(--text-tertiary, #808080); }

    :host([disabled]) input {
      opacity: 0.3;
      cursor: not-allowed;
    }

    :host([readonly]) input {
      opacity: 0.6;
      cursor: default;
    }

    .has-error input {
      border-color: var(--status-error, #FF006E);
    }

    .has-error input:focus {
      box-shadow: 4px 4px 0 var(--status-error, #FF006E);
    }

    .leading-icon, .trailing-icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary, #808080);
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .leading-icon { left: 10px; }
    .trailing-icon { right: 10px; }

    .has-leading input { padding-left: 34px; }
    .has-trailing input { padding-right: 34px; }

    .helper-text {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      color: var(--text-tertiary, #808080);
      margin: 0;
    }

    .error-text {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      color: var(--status-error, #FF006E);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    input:focus-visible {
      outline: 4px solid var(--border-focus, #00FF41);
      outline-offset: 2px;
    }
  `;

  constructor() {
    super();
    this.type = 'text';
    this.value = '';
    this.disabled = false;
    this.readonly = false;
    this.required = false;
    this.size = 'md';
  }

  render() {
    const hasError = !!this.error;
    const hasLeading = !!this.leadingIcon;
    const hasTrailing = !!this.trailingIcon;

    const wrapClasses = [
      'input-wrap',
      hasError ? 'has-error' : '',
      hasLeading ? 'has-leading' : '',
      hasTrailing ? 'has-trailing' : '',
    ].filter(Boolean).join(' ');

    const inputId = `pastis-input-${Math.random().toString(36).slice(2, 9)}`;

    return html`
      <div class="field">
        ${this.label ? html`
          <label for="${inputId}">
            ${this.label}
            ${this.required ? html`<span class="required-dot" aria-hidden="true">*</span>` : ''}
          </label>
        ` : ''}
        <div class="${wrapClasses}">
          ${hasLeading ? html`<span class="leading-icon" aria-hidden="true">${this.leadingIcon}</span>` : ''}
          <input
            id="${inputId}"
            type="${this.type}"
            .value="${this.value}"
            placeholder="${this.placeholder || ''}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            ?required="${this.required}"
            name="${this.name || ''}"
            aria-invalid="${hasError}"
            aria-describedby="${hasError ? 'error' : this.helper ? 'helper' : ''}"
            @input="${this._handleInput}"
            @change="${this._handleChange}"
            part="input"
          />
          ${hasTrailing ? html`<span class="trailing-icon" aria-hidden="true">${this.trailingIcon}</span>` : ''}
        </div>
        ${hasError
          ? html`<p class="error-text" id="error" role="alert">⚠ ${this.error}</p>`
          : this.helper
            ? html`<p class="helper-text" id="helper">${this.helper}</p>`
            : ''}
      </div>
    `;
  }

  _handleInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('pastis-input', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  _handleChange(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('pastis-change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }
}

customElements.define('pastis-input', PastisInput);

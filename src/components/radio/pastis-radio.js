import { LitElement, html, css } from 'lit';

export class PastisRadio extends LitElement {
  static properties = {
    label:    { type: String },
    value:    { type: String },
    name:     { type: String },
    checked:  { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    helper:   { type: String },
  };

  static styles = css`
    :host { display: block; }

    label {
      display: inline-flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 14px;
      color: var(--text-secondary, #fff);
      user-select: none;
    }

    :host([disabled]) label { opacity: 0.4; cursor: not-allowed; }

    input[type="radio"] { display: none; }

    .radio-visual {
      width: 20px;
      height: 20px;
      border: 4px solid var(--border-default, #00FF41);
      background: var(--bg-primary, #000);
      flex-shrink: 0;
      margin-top: 1px;
      position: relative;
      transition: box-shadow 50ms;
    }

    :host([checked]) .radio-visual {
      border-color: var(--action-primary, #00FF41);
    }

    :host([checked]) .radio-visual::after {
      content: '';
      position: absolute;
      inset: 2px;
      background: var(--action-primary, #00FF41);
    }

    /* radio border is green → hover shadow is cyan */
    label:hover .radio-visual { box-shadow: 4px 4px 0 var(--action-secondary, #00FFFF); }
    :host([disabled]) label:hover .radio-visual { box-shadow: none; }

    .radio-visual:focus-visible { outline: 4px solid var(--border-focus, #00FF41); outline-offset: 2px; }

    .label-wrap { display: flex; flex-direction: column; gap: 2px; }
    .label-text { line-height: 1.4; }
    .helper { font-size: 12px; color: var(--text-tertiary, #808080); margin: 0; }
  `;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
  }

  render() {
    return html`
      <label>
        <input
          type="radio"
          .name=${this.name || ''}
          .value=${this.value || ''}
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this._handleChange}
        />
        <span class="radio-visual" tabindex=${this.disabled ? -1 : 0} @keydown=${this._handleKey}></span>
        ${this.label || this.helper ? html`
          <span class="label-wrap">
            ${this.label ? html`<span class="label-text">${this.label}</span>` : ''}
            ${this.helper ? html`<span class="helper">${this.helper}</span>` : ''}
          </span>
        ` : ''}
      </label>
    `;
  }

  _handleChange(e) {
    this.checked = e.target.checked;
    this.dispatchEvent(new CustomEvent('pastis-change', {
      detail: { checked: this.checked, value: this.value },
      bubbles: true, composed: true,
    }));
  }

  _handleKey(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!this.disabled) { this.checked = true; this._handleChange({ target: { checked: true } }); }
    }
  }
}

customElements.define('pastis-radio', PastisRadio);

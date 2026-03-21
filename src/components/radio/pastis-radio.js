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
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 14px;
      color: var(--text-secondary, #fff);
      user-select: none;
    }

    :host([disabled]) label { opacity: 0.4; cursor: not-allowed; }

    input[type="radio"] {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      margin: 0;
    }

    .radio-visual {
      width: 20px;
      height: 20px;
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
      background: var(--bg-primary, #0d0d0d);
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 1px;
      position: relative;
      transition: box-shadow 120ms ease;
    }

    :host([checked]) .radio-visual {
      border-color: var(--action-primary, #fcba28);
    }

    :host([checked]) .radio-visual::after {
      content: '';
      position: absolute;
      inset: 2px;
      background: var(--action-primary, #fcba28);
      border-radius: 50%;
    }

    label:hover .radio-visual { box-shadow: 4px 4px 0 var(--action-secondary, #fc7428); }
    :host([disabled]) label:hover .radio-visual { box-shadow: none; }

    :host(:focus-within) .radio-visual { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }

    .label-wrap { display: flex; flex-direction: column; gap: 2px; }
    .label-text { line-height: 1.4; }
    .helper { font-size: 12px; color: var(--text-tertiary, #909498); margin: 0; }
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
        <span class="radio-visual" aria-hidden="true"></span>
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

import { LitElement, html, css } from 'lit';

export class PastisCheckbox extends LitElement {
  static properties = {
    label: { type: String },
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { type: String },
    value: { type: String },
    helper: { type: String },
  };

  static styles = css`
    :host { display: inline-flex; align-items: flex-start; }

    label {
      display: inline-flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-secondary, #fff);
      user-select: none;
    }

    :host([disabled]) label { cursor: not-allowed; opacity: 0.3; }

    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }

    .box {
      width: 20px;
      height: 20px;
      min-width: 20px;
      border-radius: var(--radius-sm, 4px);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      background: var(--bg-primary, #0d0d0d);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 120ms ease, background 120ms ease;
      margin-top: 1px;
    }

    :host([checked]) .box,
    :host([indeterminate]) .box {
      background: var(--action-primary, #fcba28);
      border-color: var(--action-primary, #fcba28);
    }

    .checkmark {
      display: none;
      width: 10px;
      height: 7px;
      border-left: 3px solid var(--action-primary-text, #0d0d0d);
      border-bottom: 3px solid var(--action-primary-text, #0d0d0d);
      transform: rotate(-45deg) translateY(-1px);
    }

    .indeterminate-mark {
      display: none;
      width: 10px;
      height: 3px;
      background: var(--action-primary-text, #0d0d0d);
      border-radius: 0;
    }

    :host([checked]) .checkmark { display: block; }
    :host([indeterminate]) .indeterminate-mark { display: block; }
    :host([indeterminate]) .checkmark { display: none; }

    label:hover .box { border-color: var(--action-primary, #fcba28); }
    :host([checked]) label:hover .box,
    :host([indeterminate]) label:hover .box { opacity: 0.85; }

    input:focus-visible ~ .box {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .label-content { display: flex; flex-direction: column; gap: 2px; }
    .helper {
      font-size: 11px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      color: var(--text-tertiary, #909498);
      text-transform: none;
    }
  `;

  constructor() {
    super();
    this.checked = false;
    this.indeterminate = false;
    this.disabled = false;
    this.value = '';
  }

  updated(changed) {
    if (changed.has('indeterminate')) {
      const input = this.shadowRoot?.querySelector('input');
      if (input) input.indeterminate = this.indeterminate;
    }
  }

  render() {
    return html`
      <label @click="${this._handleClick}">
        <input
          type="checkbox"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          name="${this.name || ''}"
          value="${this.value || ''}"
          aria-checked="${this.indeterminate ? 'mixed' : this.checked}"
          @change="${this._handleChange}"
        />
        <span class="box">
          <span class="checkmark"></span>
          <span class="indeterminate-mark"></span>
        </span>
        ${this.label ? html`
          <span class="label-content">
            <span>${this.label}</span>
            ${this.helper ? html`<span class="helper">${this.helper}</span>` : ''}
          </span>
        ` : ''}
      </label>
    `;
  }

  _handleClick(e) {
    if (this.disabled) { e.preventDefault(); return; }
  }

  _handleChange(e) {
    this.checked = e.target.checked;
    this.indeterminate = false;
    this.dispatchEvent(new CustomEvent('pastis-change', {
      detail: { checked: this.checked, value: this.value },
      bubbles: true, composed: true
    }));
  }
}

customElements.define('pastis-checkbox', PastisCheckbox);

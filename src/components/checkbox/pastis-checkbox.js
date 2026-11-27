import { LitElement, html, css, nothing } from 'lit';

/**
 * Checkbox with label and helper text.
 *
 * Form-associated like a native checkbox: when checked, the owning form's data has `name`
 * with `value` (`on` when `value` is empty); `required` makes it invalid until checked; it resets
 * with the form and is disabled by a disabled <fieldset>.
 *
 * The label is uppercase by default (the Pastis look); `label-case="none"` keeps the text as
 * written (for user content such as task titles).
 *
 * @fires pastis-change - When the user toggles it, detail { checked, value }
 */
export class PastisCheckbox extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    /** Visible label. */
    label: { type: String },
    /** Checked state. */
    checked: { type: Boolean, reflect: true },
    /** Mixed state (cleared when the user toggles). */
    indeterminate: { type: Boolean, reflect: true },
    /** Disables the checkbox (a disabled <fieldset> disables it too). */
    disabled: { type: Boolean, reflect: true },
    /** Requires the checkbox to be checked for the form to be valid. */
    required: { type: Boolean, reflect: true },
    /** Name in the form data. */
    name: { type: String },
    /** Value in the form data when checked (`on` when empty). */
    value: { type: String },
    /** Helper text below the label. */
    helper: { type: String },
    /** Label case: `upper` (default) or `none` (text as written). */
    labelCase: { type: String, attribute: 'label-case' },
    /** Accessible name when there is no visible label. Forwarded to the input. */
    ariaLabel: { type: String, attribute: 'aria-label' },
    _formDisabled: { state: true },
  };

  static styles = css`
    :host { display: inline-flex; align-items: flex-start; position: relative; }

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

    label.case-none {
      text-transform: none;
      letter-spacing: normal;
    }

    :host([disabled]) label, :host(:disabled) label { cursor: not-allowed; opacity: 0.3; }

    /* Visually hidden but still rendered (1 px clip), so touch exploration and tools find it */
    input[type="checkbox"] {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

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
      /* 20 px box plus 2 px each side: a 24 × 24 px target (WCAG 2.5.8) */
      margin: 2px;
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
    this.required = false;
    this.labelCase = 'upper';
    this._formDisabled = false;
    this._internals = this.attachInternals();
  }

  /** The owning form, if any. */
  get form() { return this._internals.form; }
  /** Validity state. */
  get validity() { return this._internals.validity; }
  /** The browser's validation message. */
  get validationMessage() { return this._internals.validationMessage; }
  /** Whether it takes part in constraint validation. */
  get willValidate() { return this._internals.willValidate; }
  /** Checks validity; fires `invalid` when invalid. */
  checkValidity() { return this._internals.checkValidity(); }
  /** Checks validity and shows the browser's message when invalid. */
  reportValidity() { return this._internals.reportValidity(); }

  formResetCallback() {
    this.checked = this._defaultChecked;
    this.indeterminate = false;
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
  }

  formStateRestoreCallback(state) {
    this.checked = state === 'true';
  }

  willUpdate(changed) {
    if (!this.hasUpdated) this._defaultChecked = this.checked;
    // Reflect `disabled` before render rather than in Lit's update(): the reflection makes the
    // browser call formDisabledCallback synchronously, and a property change made during
    // update() (after render) is dropped, which left the input disabled after re-enabling.
    if (changed.has('disabled')) this.toggleAttribute('disabled', this.disabled);
  }

  updated(changed) {
    const input = this.shadowRoot.querySelector('input');
    if (changed.has('indeterminate')) input.indeterminate = this.indeterminate;
    this._internals.setFormValue(this.checked ? (this.value || 'on') : null, String(this.checked));
    if (input.validity.valid) this._internals.setValidity({});
    else this._internals.setValidity(input.validity, input.validationMessage, input);
  }

  render() {
    return html`
      <label class=${this.labelCase === 'none' ? 'case-none' : ''} @click="${this._handleClick}">
        <input
          type="checkbox"
          .checked="${this.checked}"
          ?disabled="${this.disabled || this._formDisabled}"
          ?required="${this.required}"
          name="${this.name || ''}"
          value="${this.value || ''}"
          aria-label=${!this.label && this.ariaLabel ? this.ariaLabel : nothing}
          aria-checked="${this.indeterminate ? 'mixed' : this.checked}"
          aria-describedby=${this.helper && this.label ? 'helper' : nothing}
          @change="${this._handleChange}"
        />
        <span class="box">
          <span class="checkmark"></span>
          <span class="indeterminate-mark"></span>
        </span>
        ${this.label ? html`
          <span class="label-content">
            <span>${this.label}</span>
            ${this.helper
              // Hidden from the label's name; the input is described by it instead.
              ? html`<span class="helper" id="helper" aria-hidden="true">${this.helper}</span>`
              : ''}
          </span>
        ` : ''}
      </label>
    `;
  }

  _handleClick(e) {
    if (this.disabled || this._formDisabled) { e.preventDefault(); return; }
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

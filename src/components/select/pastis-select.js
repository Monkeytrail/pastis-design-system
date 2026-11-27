import { LitElement, html, css, nothing } from 'lit';
import '../icon/pastis-icon.js';

let nextId = 0;

/**
 * Select: one choice from a list, as a form field. A native `<select>` inside (the platform's own
 * picker on iOS and Android), styled like `pastis-input`.
 *
 * - **Options:** the `options` property, `[{ value, label, disabled? }]` (labels as written).
 * - **Form-associated:** takes part in forms (value, `required`, reset, a disabled fieldset).
 * - **Named** by `label` as written (its uppercase styling never reaches the name), or by
 *   `aria-label` without one; `helper` and `error` describe it.
 * - **Event:** `pastis-change` with `detail { value }` when the user picks another option.
 *
 * @fires pastis-change - The user picked an option, detail { value }
 * @csspart select - The native select
 */
export class PastisSelect extends LitElement {
  static formAssociated = true;

  static properties = {
    /** The visible label, and the field's name as written. */
    label: { type: String },
    /** The chosen option's value. */
    value: { type: String },
    /** The choices: `[{ value, label, disabled? }]`. */
    options: { type: Array, attribute: false },
    /** A value must be chosen (an option with value `''` counts as none). */
    required: { type: Boolean, reflect: true },
    /** No choosing. */
    disabled: { type: Boolean, reflect: true },
    /** A line of help under the field. */
    helper: { type: String },
    /** An error under the field, in place of the helper; marks the field invalid. */
    error: { type: String },
    /** The form field name. */
    name: { type: String, reflect: true },
    /** The field's name when there is no visible label. */
    ariaLabel: { type: String, attribute: 'aria-label' },
    _formDisabled: { state: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }

    .field { display: flex; flex-direction: column; gap: var(--space-xs, 6px); }

    label {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: var(--font-size-caption, 11px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
    }

    .wrap { position: relative; display: flex; align-items: center; }

    select {
      appearance: none;
      width: 100%;
      min-height: 44px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: var(--font-size-body-sm, 14px);
      font-weight: 700;
      color: var(--text-secondary, #fff);
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      padding: var(--space-sm, 8px) 40px var(--space-sm, 8px) var(--space-md, 12px);
      margin: 0;
      cursor: pointer;
      transition: border-color 120ms ease;
    }

    select:hover { border-color: var(--text-tertiary, #909498); }

    select:focus-visible {
      outline: none;
      border-color: var(--border-focus, #fcba28);
      box-shadow: 4px 4px 0 var(--border-focus, #fcba28);
    }

    select:disabled { opacity: 0.3; cursor: not-allowed; }

    .has-error select { border-color: var(--status-error, #f0505e); }

    pastis-icon {
      position: absolute;
      right: var(--space-md, 12px);
      color: var(--text-tertiary, #909498);
      pointer-events: none;
    }

    .helper, .error {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: var(--font-size-caption, 11px);
      margin: 0;
    }
    .helper { color: var(--text-tertiary, #909498); }
    .error { color: var(--status-error, #f0505e); }
  `;

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.options = [];
    this.required = false;
    this.disabled = false;
    this._formDisabled = false;
    this._id = `pastis-select-${++nextId}`;
    this._internals = this.attachInternals();
  }

  // ─── Form-associated API ──────────────────────────────────────────────────

  /** The owning form, if any. */
  get form() { return this._internals.form; }
  /** The field's validity state. */
  get validity() { return this._internals.validity; }
  /** The browser's validation message. */
  get validationMessage() { return this._internals.validationMessage; }

  /** Checks validity; fires `invalid` when invalid. */
  checkValidity() { return this._internals.checkValidity(); }
  /** Checks validity and shows the browser's message when invalid. */
  reportValidity() { return this._internals.reportValidity(); }

  formResetCallback() { this.value = this._defaultValue ?? ''; }
  formDisabledCallback(disabled) { this._formDisabled = disabled; }
  formStateRestoreCallback(state) { if (typeof state === 'string') this.value = state; }

  /** Focuses the select. */
  focus(options) { this.shadowRoot?.querySelector('select')?.focus(options); }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  willUpdate(changed) {
    if (!this.hasUpdated) this._defaultValue = this.value;
    if (changed.has('disabled')) this.toggleAttribute('disabled', this.disabled);
  }

  updated() {
    const select = this.shadowRoot.querySelector('select');
    // Options render after the value is set: set it again so the native select shows it.
    if (select.value !== (this.value ?? '')) select.value = this.value ?? '';
    this._internals.setFormValue(this.value ?? '', this.value ?? '');
    // A disabled field is not validated (its message is empty then, which setValidity refuses).
    if (select.validity.valid || select.disabled) this._internals.setValidity({});
    else this._internals.setValidity(select.validity, select.validationMessage || 'Choose an option', select);
  }

  render() {
    const describedBy = this.error ? `${this._id}-error` : this.helper ? `${this._id}-helper` : null;
    return html`
      <div class="field ${this.error ? 'has-error' : ''}">
        ${this.label ? html`<label for=${this._id}>${this.label}</label>` : ''}
        <div class="wrap">
          <select
            id=${this._id}
            part="select"
            name=${this.name || nothing}
            ?required=${this.required}
            ?disabled=${this.disabled || this._formDisabled}
            aria-label=${this.label || this.ariaLabel || nothing}
            aria-invalid=${this.error ? 'true' : nothing}
            aria-describedby=${describedBy ?? nothing}
            @change=${this._onChange}
          >
            ${this.options.map(option => html`
              <option
                value=${option.value}
                ?disabled=${option.disabled}
                ?selected=${option.value === this.value}
              >${option.label}</option>
            `)}
          </select>
          <pastis-icon name="chevron-down" size="sm" aria-hidden="true"></pastis-icon>
        </div>
        ${this.error
          ? html`<p class="error" id="${this._id}-error" role="alert">${this.error}</p>`
          : this.helper
            ? html`<p class="helper" id="${this._id}-helper">${this.helper}</p>`
            : ''}
      </div>
    `;
  }

  _onChange(event) {
    this.value = event.target.value;
    this.dispatchEvent(new CustomEvent('pastis-change', {
      detail: { value: this.value }, bubbles: true, composed: true,
    }));
  }
}

customElements.define('pastis-select', PastisSelect);

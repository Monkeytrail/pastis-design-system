import { LitElement, html, css, nothing } from 'lit';
import '../icon/pastis-icon.js';

let nextId = 0;

/** One detached native input per type, used to sanitise values exactly as the browser does. */
const probes = {};

/**
 * The value a native `<input type>` keeps for `value`: the value itself when it is valid for
 * the type (`YYYY-MM-DD`, `HH:MM`…), otherwise `''`.
 * @param {string} type
 * @param {unknown} value
 */
function sanitize(type, value) {
  if (value == null || value === '') return '';
  probes[type] ??= Object.assign(document.createElement('input'), { type });
  probes[type].value = String(value);
  return probes[type].value;
}

/**
 * Finds the form's default button (its first submit button in tree order), native or Pastis.
 * @param {HTMLFormElement} form
 */
function defaultButton(form) {
  return Array.from(form.elements).find(
    el => el.type === 'submit' || (el instanceof HTMLInputElement && el.type === 'image'),
  );
}

/**
 * Shared base of `<pastis-date-field>` and `<pastis-time-field>`: a form-associated field
 * wrapping one native `<input>` of the subclass's `inputType`, with a label, helper and error
 * text, optional quick-pick chips and a clear button. Not registered as an element itself.
 *
 * @fires pastis-input - On every edit, chip click or clear, detail { value }
 * @fires pastis-change - On commit (and on every chip click or clear), detail { value }
 * @csspart input - The native <input>
 * @csspart clear - The clear button
 * @csspart chips - The chips' group
 * @csspart chip - Each chip button
 */
export class PastisDateTimeFieldBase extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  /** Native input type; set by the subclass. */
  static inputType = 'text';

  static properties = {
    /** Visible label: the input's accessible name, the chips' group name and part of “Clear <label>”. */
    label: { type: String },
    /** Current value in the native input's format, or `''` for none. An invalid value becomes `''`. */
    value: { type: String, reflect: true },
    /** Earliest allowed value (the native input's `min`). */
    min: { type: String },
    /** Latest allowed value (the native input's `max`). */
    max: { type: String },
    /** Helper text below the field. */
    helper: { type: String },
    /** Error message; replaces the helper and marks the field invalid. */
    error: { type: String },
    /** Disables the field, its chips and the clear button (a disabled <fieldset> does too). */
    disabled: { type: Boolean, reflect: true },
    /** Requires a value (validity and the required marker); hides the clear button. */
    required: { type: Boolean, reflect: true },
    /** Name of the value in the form data. */
    name: { type: String },
    /**
     * Quick picks shown as a row of buttons below the field: an array of `{ label, value }`,
     * where `value` is a value for the field or `''` (e.g. “No date”). The chip matching the
     * current value is pressed. As an attribute, a JSON array.
     */
    chips: { type: Array },
    _formDisabled: { state: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 8px);
      font-family: var(--font-family-mono, monospace);
    }

    label {
      display: flex;
      align-items: center;
      gap: var(--space-xs, 4px);
      font-size: var(--font-size-micro, 11px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-transform: uppercase;
      color: var(--text-primary, #f4eee3);
    }

    .required-dot {
      color: var(--text-error, #f45f6b);
      font-size: var(--font-size-body, 16px);
      line-height: 1;
    }

    .control {
      display: flex;
      align-items: center;
      gap: var(--space-xs, 4px);
    }

    input {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      min-height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      margin: 0;
      padding: var(--space-sm, 8px) calc(var(--space-sm, 8px) * 1.5);
      font: inherit;
      font-size: var(--font-size-body-sm, 14px);
      font-weight: var(--font-weight-bold, 700);
      color: var(--text-secondary, #e6dfd2);
      background: var(--bg-primary, #110d0a);
      border: var(--border-width, 1px) solid var(--border-default, #3a322b);
      border-radius: var(--radius-md, 6px);
      /* Native picker icon and popup follow the theme */
      color-scheme: var(--color-scheme, dark);
      transition: border-color var(--transition-fast, 120ms ease);
    }

    input:hover { border-color: var(--text-tertiary, #a39b90); }

    input:focus { border-color: var(--border-focus, #fcba28); outline: none; }

    input:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .has-error input { border-color: var(--text-error, #f45f6b); }

    input:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    button {
      box-sizing: border-box;
      margin: 0;
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    button:disabled { cursor: not-allowed; opacity: 0.4; }

    .clear {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--space-xl, 32px);
      height: var(--space-xl, 32px);
      padding: 0;
      border: 0;
      border-radius: var(--radius-full, 9999px);
      background: none;
      color: var(--text-tertiary, #a39b90);
    }

    .clear:hover { color: var(--text-primary, #f4eee3); background: var(--bg-elevated, #251f1a); }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm, 8px);
    }

    .chip {
      display: inline-flex;
      align-items: center;
      min-height: var(--space-xl, 32px);
      padding: 0 calc(var(--space-sm, 8px) * 1.5);
      border: var(--border-width, 1px) solid var(--border-default, #3a322b);
      border-radius: var(--radius-full, 9999px);
      background: var(--bg-card, #1b1612);
      color: var(--text-secondary, #e6dfd2);
      font-size: var(--font-size-caption, 12px);
      font-weight: var(--font-weight-bold, 700);
      white-space: nowrap;
      transition: border-color var(--transition-fast, 120ms ease);
    }

    .chip:hover:not(:disabled) { border-color: var(--action-primary, #fcba28); }

    .chip[aria-pressed="true"] {
      background: var(--action-primary, #fcba28);
      border-color: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
    }

    /* 44 × 44 px targets on touch screens */
    @media (pointer: coarse) {
      .clear {
        width: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
        height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      }
      .chip { min-height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px)); }
    }

    .helper-text, .error-text {
      margin: 0;
      font-size: var(--font-size-micro, 11px);
      line-height: var(--line-height-caption, 1.4);
    }

    .helper-text { color: var(--text-tertiary, #a39b90); }
    .error-text { color: var(--text-error, #f45f6b); }

    @media (forced-colors: active) {
      .chip[aria-pressed="true"] { background: Highlight; color: HighlightText; border-color: Highlight; }
    }
  `;

  constructor() {
    super();
    this.value = '';
    this.disabled = false;
    this.required = false;
    this.chips = [];
    this._formDisabled = false;
    this._id = `pastis-dt-field-${++nextId}`;
    this._internals = this.attachInternals();
    this.addEventListener('keydown', e => this._onKeydown(e));
  }

  // ─── Form-associated API ──────────────────────────────────────────────────

  /** The owning form, if any. */
  get form() { return this._internals.form; }
  /** The field's validity state. */
  get validity() { return this._internals.validity; }
  /** The browser's validation message. */
  get validationMessage() { return this._internals.validationMessage; }
  /** Whether the field takes part in constraint validation. */
  get willValidate() { return this._internals.willValidate; }

  /** Checks validity; fires `invalid` when invalid. */
  checkValidity() { return this._internals.checkValidity(); }

  /** Checks validity and shows the browser's message when invalid. */
  reportValidity() { return this._internals.reportValidity(); }

  formResetCallback() {
    this.value = this._defaultValue ?? '';
    // Also clears a partly typed value the native input holds while `value` is still ''
    if (this._input) this._input.value = this.value;
    this._syncForm();
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string') this.value = state;
  }

  /** Focuses the native input. */
  focus(options) {
    if (this._input) this._input.focus(options);
    else super.focus(options);
  }

  get _input() {
    return this.shadowRoot?.querySelector('input') ?? null;
  }

  get _isDisabled() {
    return this.disabled || this._formDisabled;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  willUpdate(changed) {
    if (changed.has('value')) this.value = sanitize(this.constructor.inputType, this.value);
    if (!this.hasUpdated) this._defaultValue = this.value;
    // Reflect `disabled` before render (see pastis-input): the reflection makes the browser call
    // formDisabledCallback synchronously, and a change made during update() would be dropped.
    if (changed.has('disabled')) this.toggleAttribute('disabled', this.disabled);
  }

  updated() {
    this._syncForm();
  }

  /** Publishes the value and the native input's validity to the form. */
  _syncForm() {
    const input = this._input;
    if (!input) return;
    this._internals.setFormValue(this.value, this.value);
    if (input.validity.valid) this._internals.setValidity({});
    else this._internals.setValidity(input.validity, input.validationMessage, input);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  /** Extra attributes for the native input (the time field's `step`). */
  _inputAttributes() {
    return {};
  }

  render() {
    const id = this._id;
    const hasError = !!this.error;
    const disabled = this._isDisabled;
    const chips = Array.isArray(this.chips) ? this.chips.filter(c => c && c.label) : [];
    const showClear = !this.required && !disabled && this.value !== '';
    const extra = this._inputAttributes();
    // The input also gets aria-label: the visible label is uppercased, and Chrome would name the
    // input by that rendered text (“DUE DATE”)
    return html`
      <div class="field ${hasError ? 'has-error' : ''}">
        ${this.label ? html`
          <label for="${id}">
            ${this.label}
            ${this.required ? html`<span class="required-dot" aria-hidden="true">*</span>` : nothing}
          </label>
        ` : nothing}
        <div class="control">
          <input
            id="${id}"
            part="input"
            type="${this.constructor.inputType}"
            .value="${this.value}"
            min=${this.min || nothing}
            max=${this.max || nothing}
            step=${extra.step ?? nothing}
            ?disabled=${disabled}
            ?required=${this.required}
            aria-label=${this.label || nothing}
            aria-invalid="${hasError ? 'true' : 'false'}"
            aria-describedby=${hasError ? `${id}-error` : this.helper ? `${id}-helper` : nothing}
            @input=${this._onInput}
            @change=${this._onChange}
            @keyup=${this._syncForm}
            @blur=${this._syncForm}
          />
          ${showClear ? html`
            <button
              class="clear"
              part="clear"
              type="button"
              aria-label=${this.label ? `Clear ${this.label}` : 'Clear'}
              @click=${this._onClear}
            ><pastis-icon name="close" size="sm"></pastis-icon></button>
          ` : nothing}
        </div>
        ${hasError
          ? html`<p class="error-text" id="${id}-error" role="alert">${this.error}</p>`
          : this.helper ? html`<p class="helper-text" id="${id}-helper">${this.helper}</p>` : nothing}
        ${chips.length ? html`
          <div class="chips" part="chips" role="group" aria-label=${this.label || nothing}>
            ${chips.map(chip => html`
              <button
                class="chip"
                part="chip"
                type="button"
                aria-pressed=${sanitize(this.constructor.inputType, chip.value) === this.value ? 'true' : 'false'}
                ?disabled=${disabled}
                @click=${() => this._pick(chip.value)}
              >${chip.label}</button>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  _emit(type) {
    this.dispatchEvent(new CustomEvent(type, { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  _onInput(e) {
    this.value = e.target.value;
    this._syncForm();
    this._emit('pastis-input');
  }

  _onChange(e) {
    this.value = e.target.value;
    this._syncForm();
    this._emit('pastis-change');
  }

  /** Sets the value as the user did (a chip or the clear button): both events fire. */
  _setByUser(value) {
    const next = sanitize(this.constructor.inputType, value);
    if (next === this.value && (!this._input || this._input.value === next)) return false;
    this.value = next;
    if (this._input) this._input.value = next;
    this._syncForm();
    this._emit('pastis-input');
    this._emit('pastis-change');
    return true;
  }

  _pick(value) {
    if (this._isDisabled) return;
    this._setByUser(value);
  }

  _onClear() {
    if (this._isDisabled) return;
    this._setByUser('');
    // The clear button disappears with the value: keep focus in the field
    this._input?.focus();
  }

  /**
   * Implicit submission: Enter in the native input submits the owning form, through its default
   * button when it has one. The input sits in the shadow root, so the browser does not do it.
   */
  _onKeydown(e) {
    if (e.key !== 'Enter' || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.composedPath()[0] !== this._input) return;
    const form = this.form;
    if (!form) return;
    // Let every listener run first, so one that prevents Enter's default cancels submission
    setTimeout(() => {
      if (e.defaultPrevented) return;
      const button = defaultButton(form);
      if (!button) form.requestSubmit();
      else if (!button.disabled && !button.matches(':disabled')) button.click();
    });
  }
}

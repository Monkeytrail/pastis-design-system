import { LitElement, html, css, nothing } from 'lit';

let nextId = 0;

/**
 * Finds the form's default button (its first submit button in tree order), native or Pastis.
 * @param {HTMLFormElement} form
 */
function defaultButton(form) {
  return Array.from(form.elements).find(
    el => el.type === 'submit' || (el instanceof HTMLInputElement && el.type === 'image'),
  );
}

const isNativeControl = el => el instanceof HTMLButtonElement || el instanceof HTMLInputElement;

/**
 * Text field with label, helper and error text.
 *
 * Form-associated: its value is part of the owning form's data under `name`, it takes part in
 * validation (`required`, `minlength`, `maxlength`, `pattern`, the type's own rules), it resets
 * with the form and is disabled by a disabled <fieldset>. Enter submits the owning form, through
 * its default button when it has one (a native or a Pastis submit button).
 *
 * **Slotted mode:** put a native `<input slot="input">` inside to have the field render its
 * label, helper, error and styling around that light-DOM input instead of its own. Password
 * managers and passkey autofill (`autocomplete="username webauthn"`) only see light-DOM inputs,
 * so use this for credentials. The slotted input is then the form control (set `name`, `type`,
 * `autocomplete`, `required` … on it); the host labels it (`aria-label` from `label`) and
 * describes it (`aria-description` from `error` or `helper`). The host's `required`, `disabled`
 * and `readonly` are mirrored onto it, unless it sets them itself.
 *
 * @slot input - Optional native <input> used instead of the built-in one (slotted mode)
 * @csspart input - The built-in <input> (not in slotted mode)
 * @fires pastis-input - On every edit, detail { value }
 * @fires pastis-change - On commit, detail { value }
 */
export class PastisInput extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    /** Visible label. */
    label: { type: String },
    /** Placeholder text. */
    placeholder: { type: String },
    /** Current value. */
    value: { type: String, reflect: true },
    /** Input type: text, email, password, number, search, url, … */
    type: { type: String },
    /** Helper text below the field. */
    helper: { type: String },
    /** Error message; replaces the helper and marks the field invalid. */
    error: { type: String },
    /** Disables the field (a disabled <fieldset> disables it too). */
    disabled: { type: Boolean, reflect: true },
    /** Makes the field read-only. */
    readonly: { type: Boolean, reflect: true },
    /** Requires a value (validity and the required marker). */
    required: { type: Boolean, reflect: true },
    /** sm | md | lg */
    size: { type: String, reflect: true },
    /** Decorative icon before the value. */
    leadingIcon: { type: String, attribute: 'leading-icon' },
    /** Decorative icon after the value. */
    trailingIcon: { type: String, attribute: 'trailing-icon' },
    /** Name of the value in the form data. */
    name: { type: String },
    /** Maximum length in characters. */
    maxlength: { type: Number },
    /** Minimum length in characters. */
    minlength: { type: Number },
    /** Pattern the whole value must match. */
    pattern: { type: String },
    /** Autofill hint. */
    autocomplete: { type: String },
    /** Virtual keyboard hint (text, email, numeric, …). */
    inputmode: { type: String },
    /** Virtual keyboard Enter key label (enter, done, go, next, send, …). */
    enterkeyhint: { type: String },
    /** Focuses the field on first render. */
    autofocus: { type: Boolean },
    /** Spellcheck: "true" or "false". */
    spellcheck: { type: String },
    /** Auto-capitalisation: off, none, on, sentences, words, characters. */
    autocapitalize: { type: String },
    /** Accessible name when there is no visible label. Forwarded to the input. */
    ariaLabel: { type: String, attribute: 'aria-label' },
    _slotted: { state: true },
    _formDisabled: { state: true },
  };

  static styles = css`
    :host { display: block; background: var(--bg-primary, #0d0d0d); }

    .field { display: flex; flex-direction: column; gap: 6px; }

    label {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required-dot {
      color: var(--status-error, #f0505e);
      font-size: 16px;
      line-height: 1;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    input, ::slotted(input) {
      width: 100%;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      padding: 10px 12px;
      height: auto;
      margin: 0;
      outline: none;
      transition: border-color 120ms ease;
      box-sizing: border-box;
    }

    :host([size="sm"]) input, :host([size="sm"]) ::slotted(input) { font-size: 12px; padding: 8px 10px; }
    :host([size="lg"]) input, :host([size="lg"]) ::slotted(input) { font-size: 16px; padding: 12px 16px; }

    input:hover, ::slotted(input:hover) { border-color: var(--text-tertiary, #909498); }

    input:focus, ::slotted(input:focus) {
      border-color: var(--border-focus, #fcba28);
      box-shadow: 4px 4px 0 var(--border-focus, #fcba28);
    }

    input::placeholder { color: var(--text-tertiary, #909498); }

    :host([disabled]) input, :host(:disabled) input,
    :host([disabled]) ::slotted(input), ::slotted(input:disabled) {
      opacity: 0.3;
      cursor: not-allowed;
    }

    :host([readonly]) input, :host([readonly]) ::slotted(input), ::slotted(input[readonly]) {
      opacity: 0.6;
      cursor: default;
    }

    .has-error input, .has-error ::slotted(input) {
      border-color: var(--status-error, #f0505e);
    }

    .has-error input:focus, .has-error ::slotted(input:focus) {
      box-shadow: 4px 4px 0 var(--status-error, #f0505e);
    }

    .leading-icon, .trailing-icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary, #909498);
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .leading-icon { left: 10px; }
    .trailing-icon { right: 10px; }

    .has-leading input, .has-leading ::slotted(input) { padding-left: 34px; }
    .has-trailing input, .has-trailing ::slotted(input) { padding-right: 34px; }

    .helper-text {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      color: var(--text-tertiary, #909498);
      margin: 0;
    }

    .error-text {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      color: var(--status-error, #f0505e);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    input:focus-visible, ::slotted(input:focus-visible) {
      outline: 2px solid var(--border-focus, #fcba28);
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
    this.autofocus = false;
    /** @type {HTMLInputElement | false | null} null until looked up */
    this._slotted = null;
    /** Attributes this component set on the slotted input, with the value it set. */
    this._owned = {};
    /** Re-renders when the slotted input's own state changes (the marker, owned attributes). */
    this._slottedObserver = new MutationObserver(() => this.requestUpdate());
    this._formDisabled = false;
    this._inputId = `pastis-input-${++nextId}`;
    this._internals = this.attachInternals();
    this.addEventListener('keydown', e => this._onKeydown(e));
  }

  // ─── Form-associated API ──────────────────────────────────────────────────

  /** The owning form, if any. */
  get form() { return this._internals.form; }
  /** The field's validity state (always valid in slotted mode: the native input carries it). */
  get validity() { return this._internals.validity; }
  /** The browser's validation message. */
  get validationMessage() { return this._internals.validationMessage; }
  /** Whether the field takes part in constraint validation. */
  get willValidate() { return this._internals.willValidate; }

  /** Checks validity; fires `invalid` when invalid. */
  checkValidity() {
    return this._slotted ? this._slotted.checkValidity() : this._internals.checkValidity();
  }

  /** Checks validity and shows the browser's message when invalid. */
  reportValidity() {
    return this._slotted ? this._slotted.reportValidity() : this._internals.reportValidity();
  }

  formResetCallback() {
    if (this._slotted) {
      // The native input resets itself, after the host (tree order): follow it afterwards
      queueMicrotask(() => { if (this._slotted) this.value = this._slotted.value; });
      return;
    }
    this.value = this._defaultValue ?? '';
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
  }

  formStateRestoreCallback(state) {
    if (typeof state === 'string') this.value = state;
  }

  /** Focuses the input (the slotted one in slotted mode). */
  focus(options) {
    if (this._slotted) this._slotted.focus(options);
    else super.focus(options);
  }

  /** The element the user types in: the built-in input or the slotted one. */
  get _control() {
    return this._slotted || this.shadowRoot?.querySelector('input') || null;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  willUpdate(changed) {
    if (this._slotted === null) this._adoptSlotted();
    if (!this.hasUpdated) this._defaultValue = this.value;
    // Reflect `disabled` before render rather than in Lit's update(): the reflection makes the
    // browser call formDisabledCallback synchronously, and a property change made during
    // update() (after render) is dropped, which left the input disabled after re-enabling.
    if (changed.has('disabled')) this.toggleAttribute('disabled', this.disabled);
    if (changed.has('value') && this._slotted && this._slotted.value !== (this.value ?? '')) {
      this._slotted.value = this.value ?? '';
    }
  }

  firstUpdated() {
    if (this.autofocus) this.focus();
  }

  updated() {
    if (this._slotted) {
      this._syncSlotted();
      this._internals.setValidity({});
      return;
    }
    const input = this.shadowRoot.querySelector('input');
    this._internals.setFormValue(this.value ?? '', this.value ?? '');
    if (input.validity.valid) this._internals.setValidity({});
    else this._internals.setValidity(input.validity, input.validationMessage, input);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._slotted) this._observeSlotted();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._slottedObserver.disconnect();
  }

  /** Picks up (or drops) a native `<input slot="input">` child. */
  _adoptSlotted() {
    const input = this.querySelector(':scope > input[slot="input"]') || false;
    if (input === this._slotted) return;
    this._slottedObserver.disconnect();
    this._slotted = input;
    this._owned = {};
    if (input) {
      this.value = input.value;
      this._internals.setFormValue(null);
      this._observeSlotted();
    }
  }

  /** Watches the slotted input's attributes that the marker or the owned attributes depend on. */
  _observeSlotted() {
    this._slottedObserver.observe(this._slotted, {
      attributes: true,
      attributeFilter: [
        'required', 'disabled', 'readonly',
        'aria-label', 'aria-labelledby', 'aria-description', 'aria-invalid',
      ],
    });
  }

  /**
   * Labels, describes and disables the slotted input: ID references cannot cross the shadow
   * boundary. Only attributes the component set itself are ever changed or removed; an author's
   * own aria-label (or <label>, aria-labelledby), aria-description, aria-invalid, required,
   * disabled or readonly on the slotted input are left alone.
   */
  _syncSlotted() {
    const input = this._slotted;
    const hasOwnName = input.labels?.length > 0 || input.hasAttribute('aria-labelledby');
    this._setOwned(input, 'aria-label', hasOwnName ? null : (this.label || this.ariaLabel || null));
    this._setOwned(input, 'aria-description', this.error || this.helper || null);
    this._setOwned(input, 'aria-invalid', this.error ? 'true' : null);
    this._setOwned(input, 'required', this.required ? '' : null);
    this._setOwned(input, 'disabled', this.disabled ? '' : null);
    this._setOwned(input, 'readonly', this.readonly ? '' : null);
    this._slottedObserver.takeRecords(); // its own changes need no re-render
  }

  /** Sets (value) or removes (null) an attribute the component owns on the slotted input. */
  _setOwned(input, name, value) {
    const current = input.getAttribute(name);
    const owned = Object.hasOwn(this._owned, name);
    if (current !== null && !(owned && current === this._owned[name])) return; // the author's
    if (current === value) return;
    if (value === null) {
      if (owned) input.removeAttribute(name);
      delete this._owned[name];
    } else {
      input.setAttribute(name, value);
      this._owned[name] = value;
    }
  }

  _focusSlotted() {
    if (this._slotted) this._slotted.focus();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    const hasError = !!this.error;
    const hasLeading = !!this.leadingIcon;
    const hasTrailing = !!this.trailingIcon;
    const slotted = !!this._slotted;

    const wrapClasses = [
      'input-wrap',
      hasError ? 'has-error' : '',
      hasLeading ? 'has-leading' : '',
      hasTrailing ? 'has-trailing' : '',
    ].filter(Boolean).join(' ');

    const inputId = this._inputId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const required = this.required || (slotted && this._slotted.required);

    // In slotted mode the label and helper are presentational: their text reaches the slotted
    // input as aria-label / aria-description (the error stays a live alert).
    return html`
      <div class="field">
        ${this.label ? html`
          <label
            for=${slotted ? nothing : inputId}
            aria-hidden=${slotted ? 'true' : nothing}
            @click=${this._focusSlotted}
          >
            ${this.label}
            ${required ? html`<span class="required-dot" aria-hidden="true">*</span>` : ''}
          </label>
        ` : ''}
        <div class="${wrapClasses}">
          ${hasLeading ? html`<span class="leading-icon" aria-hidden="true">${this.leadingIcon}</span>` : ''}
          <slot
            name="input"
            @slotchange=${this._adoptSlotted}
            @input=${this._handleSlottedInput}
            @change=${this._handleSlottedChange}
          ></slot>
          ${slotted ? '' : html`
            <input
              id="${inputId}"
              type="${this.type}"
              .value="${this.value ?? ''}"
              placeholder="${this.placeholder || ''}"
              ?disabled="${this.disabled || this._formDisabled}"
              ?readonly="${this.readonly}"
              ?required="${this.required}"
              name="${this.name || ''}"
              maxlength=${this.maxlength ?? nothing}
              minlength=${this.minlength ?? nothing}
              pattern=${this.pattern || nothing}
              autocomplete=${this.autocomplete || nothing}
              inputmode=${this.inputmode || nothing}
              enterkeyhint=${this.enterkeyhint || nothing}
              spellcheck=${this.spellcheck ?? nothing}
              autocapitalize=${this.autocapitalize || nothing}
              aria-label=${!this.label && this.ariaLabel ? this.ariaLabel : nothing}
              aria-invalid="${hasError}"
              aria-describedby="${hasError ? errorId : this.helper ? helperId : ''}"
              @input="${this._handleInput}"
              @change="${this._handleChange}"
              part="input"
            />
          `}
          ${hasTrailing ? html`<span class="trailing-icon" aria-hidden="true">${this.trailingIcon}</span>` : ''}
        </div>
        ${hasError
          ? html`<p class="error-text" id="${errorId}" role="alert">⚠ ${this.error}</p>`
          : this.helper
            ? html`<p class="helper-text" id="${helperId}" aria-hidden=${slotted ? 'true' : nothing}>${this.helper}</p>`
            : ''}
      </div>
    `;
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  _handleInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('pastis-input', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  _handleChange(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('pastis-change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  _handleSlottedInput(e) {
    if (e.target === this._slotted) this._handleInput(e);
  }

  _handleSlottedChange(e) {
    if (e.target === this._slotted) this._handleChange(e);
  }

  /**
   * Implicit submission (Enter submits the owning form). The built-in input has no form of its
   * own, so Enter is handled here for it. A slotted input is native: the browser handles Enter
   * itself when the form's default button is native; when it is a Pastis button (which the
   * browser does not know) or there is none, it is handled here.
   */
  _onKeydown(e) {
    if (e.key !== 'Enter' || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const control = this._control;
    if (!control || e.composedPath()[0] !== control) return;
    const form = this._slotted ? this._slotted.form : this.form;
    if (!form) return;
    const button = defaultButton(form);
    if (this._slotted) {
      if (e.defaultPrevented || (button && isNativeControl(button))) return;
      e.preventDefault();
      this._submitVia(form, button);
      return;
    }
    // Let every listener run first, so one that prevents Enter's default cancels submission
    setTimeout(() => {
      if (!e.defaultPrevented) this._submitVia(form, button);
    });
  }

  _submitVia(form, button) {
    if (!button) {
      form.requestSubmit();
      return;
    }
    if (button.disabled || button.matches(':disabled')) return;
    button.click();
  }
}

customElements.define('pastis-input', PastisInput);

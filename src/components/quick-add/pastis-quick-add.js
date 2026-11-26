import { LitElement, html, css, nothing } from 'lit';
import '../icon/pastis-icon.js';

let nextId = 0;

/**
 * Quick add: a single-line command bar. The user types a whole entry (“Call the plumber
 * tomorrow at 9 #home !!”); the app parses it and shows what it understood as token chips
 * below the input, each with a remove button, before the entry is added.
 *
 * - **Value:** the app owns it. `pastis-input` reports every edit; set `value` back (e.g. to
 *   `''` once the entry is saved).
 * - **Tokens:** `tokens` is an array of `{ id, label, icon? }` (`icon` a `pastis-icon` name),
 *   computed by the app from the value. They are listed below the input and are its
 *   description (“Will set: Tomorrow 09:00, #home”). A token's remove button fires
 *   `pastis-token-remove` with its `id`; the app decides what that means (usually: keep that
 *   text in the title).
 * - **Submit:** Enter in the input or the Add button fires `pastis-submit` with the value. A
 *   blank value fires nothing. The bar is its own form: it is not form-associated.
 *
 * @fires pastis-input - On every edit, detail { value }
 * @fires pastis-submit - On Enter or Add with a value that is not blank, detail { value }
 * @fires pastis-token-remove - A token's remove button, detail { id }
 * @csspart input - The native <input>
 * @csspart submit - The Add button
 * @csspart tokens - The tokens' list
 * @csspart token - Each token
 */
export class PastisQuickAdd extends LitElement {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    /** Visible label and the input's accessible name. */
    label: { type: String },
    /** The entry as typed. */
    value: { type: String },
    /** Placeholder text, e.g. an example entry. */
    placeholder: { type: String },
    /** Maximum length of the entry (the native input's `maxlength`). */
    maxlength: { type: Number },
    /** Text of the submit button (default “Add”). */
    submitLabel: { type: String, attribute: 'submit-label' },
    /** What the tokens are, for screen readers (default “Will set”). */
    tokensLabel: { type: String, attribute: 'tokens-label' },
    /**
     * What the app understood, as an array of `{ id, label, icon? }`: shown as chips with a
     * remove button each. As an attribute, a JSON array.
     */
    tokens: { type: Array },
    /** Disables the input, the tokens' buttons and the Add button. */
    disabled: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 8px);
      margin: 0;
      font-family: var(--font-family-mono, monospace);
    }

    label {
      font-size: var(--font-size-micro, 11px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-transform: uppercase;
      color: var(--text-primary, #f4eee3);
    }

    .control {
      display: flex;
      align-items: stretch;
      gap: var(--space-sm, 8px);
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
      transition: border-color var(--transition-fast, 120ms ease);
    }

    input::placeholder { color: var(--text-tertiary, #a39b90); font-weight: 400; }
    input:hover { border-color: var(--text-tertiary, #a39b90); }
    input:focus { border-color: var(--border-focus, #fcba28); outline: none; }
    input:focus-visible { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }
    input:disabled { opacity: 0.4; cursor: not-allowed; }

    button {
      box-sizing: border-box;
      margin: 0;
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button:focus-visible { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }
    button:disabled { cursor: not-allowed; opacity: 0.4; }

    .submit {
      flex: none;
      min-height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      padding: 0 var(--space-md, 16px);
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      border-radius: var(--radius-md, 6px);
      background: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
      font-size: var(--font-size-caption, 12px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-transform: uppercase;
    }

    .submit:hover:not(:disabled) { filter: brightness(1.08); }

    .tokens {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs, 4px) var(--space-sm, 8px);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .token {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs, 4px);
      min-height: var(--space-xl, 32px);
      padding-left: calc(var(--space-sm, 8px) * 1.25);
      border: var(--border-width, 1px) solid var(--border-default, #3a322b);
      border-radius: var(--radius-full, 9999px);
      background: var(--bg-card, #1b1612);
      color: var(--text-secondary, #e6dfd2);
      font-size: var(--font-size-caption, 12px);
      font-weight: var(--font-weight-bold, 700);
      white-space: nowrap;
    }

    .remove {
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

    .remove:hover:not(:disabled) { color: var(--text-primary, #f4eee3); background: var(--bg-elevated, #251f1a); }

    /* 44 × 44 px targets on touch screens */
    @media (pointer: coarse) {
      .remove {
        width: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
        height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      }
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }
  `;

  constructor() {
    super();
    this.value = '';
    this.tokens = [];
    this.disabled = false;
    this._id = `pastis-quick-add-${++nextId}`;
  }

  /** Focuses the input. */
  focus(options) {
    const input = this.shadowRoot?.querySelector('input');
    if (input) input.focus(options);
    else super.focus(options);
  }

  _tokens() {
    return Array.isArray(this.tokens) ? this.tokens.filter(t => t && t.label) : [];
  }

  render() {
    const id = this._id;
    const tokens = this._tokens();
    const tokensLabel = this.tokensLabel || 'Will set';
    // The input also gets aria-label: the visible label is uppercased, and Chrome would name the
    // input by that rendered text
    return html`
      <form @submit=${this._onSubmit} novalidate>
        ${this.label ? html`<label for="${id}">${this.label}</label>` : nothing}
        <div class="control">
          <input
            id="${id}"
            part="input"
            type="text"
            autocomplete="off"
            enterkeyhint="done"
            .value="${this.value ?? ''}"
            placeholder=${this.placeholder || nothing}
            maxlength=${this.maxlength ?? nothing}
            aria-label=${this.label || nothing}
            aria-describedby=${tokens.length ? `${id}-summary` : nothing}
            ?disabled=${this.disabled}
            @input=${this._onInput}
          />
          <!-- aria-label: Chrome would name it by its uppercased rendering -->
          <button
            class="submit"
            part="submit"
            type="submit"
            aria-label=${this.submitLabel || 'Add'}
            ?disabled=${this.disabled}
          >${this.submitLabel || 'Add'}</button>
        </div>
        ${tokens.length ? html`
          <p class="sr-only" id="${id}-summary">${tokensLabel}: ${tokens.map(t => t.label).join(', ')}</p>
          <ul class="tokens" part="tokens" aria-label=${tokensLabel}>
            ${tokens.map(token => html`
              <li class="token" part="token">
                ${token.icon ? html`<pastis-icon name=${token.icon} size="sm"></pastis-icon>` : nothing}
                <span>${token.label}</span>
                <button
                  class="remove"
                  type="button"
                  aria-label="Remove ${token.label}"
                  ?disabled=${this.disabled}
                  @click=${() => this._remove(token.id)}
                ><pastis-icon name="close" size="sm"></pastis-icon></button>
              </li>
            `)}
          </ul>
        ` : nothing}
      </form>
    `;
  }

  _onInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('pastis-input', {
      detail: { value: this.value }, bubbles: true, composed: true,
    }));
  }

  _onSubmit(e) {
    e.preventDefault();
    if (this.disabled || (this.value ?? '').trim() === '') return;
    this.dispatchEvent(new CustomEvent('pastis-submit', {
      detail: { value: this.value }, bubbles: true, composed: true,
    }));
  }

  _remove(id) {
    this.dispatchEvent(new CustomEvent('pastis-token-remove', {
      detail: { id }, bubbles: true, composed: true,
    }));
    // The token goes away: keep focus in the bar
    this.focus();
  }
}

customElements.define('pastis-quick-add', PastisQuickAdd);

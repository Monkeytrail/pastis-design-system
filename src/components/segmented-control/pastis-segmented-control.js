import { LitElement, html, css, nothing } from 'lit';

/**
 * Segmented control: one choice among a few (2–5), all visible, as a row of segments.
 *
 * - **A radio group** (`radiogroup` of `radio`s), named by `label`: Tab reaches the chosen
 *   segment, Arrow Left/Right (and Up/Down) move to the previous/next one and choose it, Home/End
 *   the first/last; Space or a click chooses.
 * - **Options:** the `options` property, `[{ value, label }]` (labels as written).
 * - **Event:** `pastis-change` with `detail { value }`, cancelable: `preventDefault()` keeps
 *   `value` as it was, so an app can keep the control controlled.
 *
 * @fires pastis-change - A segment was chosen, detail { value }; cancelable
 * @csspart segment - Each segment button
 */
export class PastisSegmentedControl extends LitElement {
  static properties = {
    /** The group's name; shown above the segments unless `label-hidden`. */
    label: { type: String },
    /** Keeps the label for assistive technology only. */
    labelHidden: { type: Boolean, attribute: 'label-hidden', reflect: true },
    /** The chosen option's value. */
    value: { type: String },
    /** The choices: `[{ value, label }]`. */
    options: { type: Array, attribute: false },
    /** No choosing. */
    disabled: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }

    .label {
      display: block;
      margin-bottom: var(--space-xs, 6px);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: var(--font-size-caption, 11px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
    }

    :host([label-hidden]) .label {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
    }

    .group {
      display: inline-flex;
      flex-wrap: wrap;
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-md, 6px);
      overflow: hidden;
      background: var(--bg-card, #1e1e1e);
    }

    button {
      min-height: 44px;
      min-width: 44px;
      padding: 0 var(--space-md, 16px);
      margin: 0;
      border: 0;
      border-inline-start: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      background: transparent;
      color: var(--text-secondary, #fff);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: var(--font-size-body-sm, 14px);
      font-weight: 700;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }

    button:first-child { border-inline-start: 0; }
    button:hover { background: var(--bg-elevated, #383c44); }

    button[aria-checked="true"],
    button[aria-checked="true"]:hover {
      background: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
    }

    button:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -4px;
    }
    button[aria-checked="true"]:focus-visible { outline-color: var(--action-primary-text, #0d0d0d); }

    :host([disabled]) button { opacity: 0.3; cursor: not-allowed; }
  `;

  constructor() {
    super();
    this.label = '';
    this.labelHidden = false;
    this.value = '';
    this.options = [];
    this.disabled = false;
  }

  /** Focuses the chosen segment (or the first). */
  focus(options) {
    const buttons = this._buttons();
    (buttons.find(b => b.getAttribute('aria-checked') === 'true') ?? buttons[0])?.focus(options);
  }

  _buttons() {
    return [...(this.shadowRoot?.querySelectorAll('button') ?? [])];
  }

  render() {
    const chosen = this.options.findIndex(option => option.value === this.value);
    // Roving tabindex: the chosen segment (or the first when none is) is the one Tab reaches.
    const tabStop = chosen === -1 ? 0 : chosen;
    return html`
      ${this.label ? html`<span class="label" id="label">${this.label}</span>` : ''}
      <div
        class="group"
        role="radiogroup"
        aria-labelledby=${this.label ? 'label' : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        @keydown=${this._onKeydown}
      >
        ${this.options.map((option, index) => html`
          <button
            type="button"
            role="radio"
            part="segment"
            aria-checked=${option.value === this.value ? 'true' : 'false'}
            tabindex=${index === tabStop ? '0' : '-1'}
            ?disabled=${this.disabled}
            @click=${() => this._choose(index)}
          >${option.label}</button>
        `)}
      </div>
    `;
  }

  _choose(index, { focus = false } = {}) {
    const option = this.options[index];
    if (!option || this.disabled) return;
    if (focus) this._buttons()[index]?.focus();
    if (option.value === this.value) return;
    const accepted = this.dispatchEvent(new CustomEvent('pastis-change', {
      detail: { value: option.value }, bubbles: true, composed: true, cancelable: true,
    }));
    if (accepted) this.value = option.value;
  }

  _onKeydown(event) {
    const buttons = this._buttons();
    const current = buttons.indexOf(event.composedPath()[0]);
    if (current === -1) return;
    const last = buttons.length - 1;
    const rtl = getComputedStyle(this).direction === 'rtl';
    const next = {
      ArrowRight: rtl ? current - 1 : current + 1,
      ArrowLeft: rtl ? current + 1 : current - 1,
      ArrowDown: current + 1,
      ArrowUp: current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    // Wraps around, as native radio groups do.
    this._choose((next + buttons.length) % buttons.length, { focus: true });
  }
}

customElements.define('pastis-segmented-control', PastisSegmentedControl);

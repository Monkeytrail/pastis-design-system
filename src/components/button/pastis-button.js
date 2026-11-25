import { LitElement, html, css, nothing } from 'lit';

/**
 * ARIA attributes set on the host that are forwarded to the inner <button>/<a>.
 * Maps the host attribute to the Lit property that stores it.
 */
const FORWARDED_ARIA = {
  'aria-label': 'ariaLabel',
  'aria-labelledby': 'ariaLabelledby',
  'aria-describedby': 'ariaDescribedby',
  'aria-pressed': 'ariaPressed',
  'aria-expanded': 'ariaExpanded',
  'aria-controls': 'ariaControls',
  'aria-haspopup': 'ariaHasPopup',
  'aria-current': 'ariaCurrent',
};

/** ID-reference attributes: resolved in the host's tree and set as element references. */
const ID_REFS = {
  ariaLabelledby: 'ariaLabelledByElements',
  ariaDescribedby: 'ariaDescribedByElements',
  ariaControls: 'ariaControlsElements',
};

/**
 * Button (or link when `href` is set).
 *
 * Form-associated: inside a <form>, `type="submit"` submits it and `type="reset"` resets it.
 * Unlike a native <button>, the default `type` is `button`, so a Pastis button never submits a
 * form unless it says so.
 *
 * ARIA set on the host (aria-label, aria-labelledby, aria-describedby, aria-pressed,
 * aria-expanded, aria-controls, aria-haspopup, aria-current) is forwarded to the inner
 * <button>/<a>; the host itself has no role.
 *
 * @slot - Button label
 * @csspart button - The inner <button> or <a>
 * @fires pastis-click - On activation (not when disabled or loading)
 */
export class PastisButton extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    /** primary | secondary | ghost | destructive */
    variant: { type: String, reflect: true },
    /** sm | md | lg */
    size: { type: String, reflect: true },
    /** Disables the button (also disabled by a disabled <fieldset>). */
    disabled: { type: Boolean, reflect: true },
    /** Shows a spinner and blocks activation. */
    loading: { type: Boolean, reflect: true },
    /** Renders a link instead of a button. */
    href: { type: String },
    /** Link target (with `href`). */
    target: { type: String },
    /** Value to copy to the clipboard on click. */
    copy: { type: String },
    /** button (default) | submit | reset. The default differs from native <button> (submit). */
    type: { type: String },
    /** Name sent with the form data when this button submits the form. */
    name: { type: String },
    /** Value sent with the form data when this button submits the form. */
    value: { type: String },
    /** Accessible name (e.g. for an icon-only button). Forwarded to the inner element. */
    ariaLabel: { type: String, attribute: 'aria-label' },
    /** IDs of elements (in the host's tree) that name the button. Forwarded as references. */
    ariaLabelledby: { type: String, attribute: 'aria-labelledby' },
    /** IDs of elements (in the host's tree) that describe the button. Forwarded as references. */
    ariaDescribedby: { type: String, attribute: 'aria-describedby' },
    /** Toggle state: "true", "false" or "mixed". Forwarded to the inner <button>. */
    ariaPressed: { type: String, attribute: 'aria-pressed' },
    /** Whether what it controls is expanded: "true" or "false". Forwarded. */
    ariaExpanded: { type: String, attribute: 'aria-expanded' },
    /** IDs of the elements it controls (in the host's tree). Forwarded as references. */
    ariaControls: { type: String, attribute: 'aria-controls' },
    /** Popup it opens: "menu", "listbox", "dialog", "true", … Forwarded. */
    ariaHasPopup: { type: String, attribute: 'aria-haspopup' },
    /** Current item in a set: "page", "step", "true", … Forwarded. */
    ariaCurrent: { type: String, attribute: 'aria-current' },
    _copied: { type: Boolean, state: true },
    _formDisabled: { type: Boolean, state: true },
  };

  static styles = css`
    :host { display: inline-block; }

    button, a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      border-radius: var(--radius-2xl, 24px);
      cursor: pointer;
      text-decoration: none;
      transition: box-shadow 120ms ease, transform 80ms ease,
                  background var(--duration-fast, 120ms) var(--ease-standard, ease),
                  color      var(--duration-fast, 120ms) var(--ease-standard, ease),
                  border-color var(--duration-fast, 120ms) var(--ease-standard, ease);
      white-space: nowrap;
      background: var(--bg-primary, #0d0d0d);
      color: var(--action-primary, #fcba28);
    }

    button:hover, a:hover { box-shadow: var(--shadow-md, 5px 5px 0 #231f20); }
    button:active, a:active { transform: translate(2px, 2px); box-shadow: var(--shadow-sm, 3px 3px 0 #262522); }

    :host([size="sm"]) button, :host([size="sm"]) a { font-size: 12px; padding: 0 12px; height: 32px; }
    :host([size="lg"]) button, :host([size="lg"]) a { font-size: 18px; padding: 0 24px; height: 56px; }
    button, a { font-size: 14px; padding: 0 16px; height: 40px; }

    :host([variant="primary"]) :is(button, a),
    :host(:not([variant])) :is(button, a) {
      background: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
      border-color: var(--action-primary, #fcba28);
    }
    :host([variant="primary"]) :is(button, a):hover,
    :host(:not([variant])) :is(button, a):hover {
      box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428);
    }
    :host([variant="primary"]) :is(button, a):active,
    :host(:not([variant])) :is(button, a):active {
      transform: translate(2px, 2px);
      box-shadow: var(--shadow-lg, 5px 5px 0 #fcba28);
    }

    :host([variant="secondary"]) :is(button, a) {
      background: var(--bg-primary, #0d0d0d);
      color: var(--action-secondary, #fc7428);
      border-color: var(--action-secondary, #fc7428);
    }
    :host([variant="secondary"]) :is(button, a):hover { box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428); }

    :host([variant="ghost"]) :is(button, a) {
      background: transparent;
      color: var(--text-primary, #f9f4da);
      border-color: var(--action-ghost-border, #383c44);
    }
    :host([variant="ghost"]) :is(button, a):hover {
      background: var(--text-primary, #f9f4da);
      color: var(--bg-primary, #0d0d0d);
      border-color: var(--text-primary, #f9f4da);
      box-shadow: none;
    }

    :host([variant="destructive"]) :is(button, a) {
      background: var(--action-destructive, #ed203d);
      color: var(--action-destructive-text, #000000);
      border-color: var(--action-destructive, #ed203d);
    }
    :host([variant="destructive"]) :is(button, a):hover { box-shadow: var(--shadow-lg, 5px 5px 0 #fcba28); }

    :host([disabled]) :is(button, a),
    :host(:disabled) :is(button, a) {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
      box-shadow: none;
    }

    .spinner {
      width: 14px; height: 14px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    button:focus-visible, a:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 3px;
    }
  `;

  constructor() {
    super();
    this.variant = 'primary';
    this.size = 'md';
    this.disabled = false;
    this.loading = false;
    this._copied = false;
    this._formDisabled = false;
    this.type = 'button';
    this._internals = this.attachInternals();
  }

  /** The form this button belongs to, if any. */
  get form() { return this._internals.form; }

  /** Clicking the host activates the inner element, as for a native button. */
  click() {
    const inner = this._inner;
    if (inner) inner.click();
    else super.click();
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
  }

  /** The element that carries the semantics (inner <button> or <a>). */
  get _inner() { return this.shadowRoot?.querySelector('[part="button"]') ?? null; }

  updated() {
    this._syncIdRefs();
  }

  /**
   * aria-labelledby/-describedby/-controls on the host name elements in the host's tree, which an
   * ID attribute inside the shadow root cannot reach. They are set as element references (ARIA
   * element reflection), and the referenced text is also mirrored as aria-label (labelledby,
   * unless aria-label is set) and aria-description (describedby), for browsers and test tools
   * that do not follow element references. The mirrored text is refreshed on every update.
   */
  _syncIdRefs() {
    const inner = this._inner;
    if (!inner) return;
    const root = this.getRootNode();
    const resolve = ids => (ids || '').split(/\s+/).filter(Boolean)
      .map(id => (root.getElementById ? root.getElementById(id) : document.getElementById(id)))
      .filter(Boolean);
    const textOf = elements => elements.map(e => e.textContent.trim()).join(' ');

    for (const [prop, reflected] of Object.entries(ID_REFS)) {
      const elements = resolve(this[prop]);
      if (reflected in inner) inner[reflected] = elements.length ? elements : null;
    }
    if (!this.ariaLabel) {
      const label = textOf(resolve(this.ariaLabelledby));
      if (label) inner.setAttribute('aria-label', label);
      else inner.removeAttribute('aria-label');
    }
    const description = textOf(resolve(this.ariaDescribedby));
    if (description) inner.setAttribute('aria-description', description);
    else inner.removeAttribute('aria-description');
  }

  _aria() {
    return {
      label: this.ariaLabel || nothing,
      pressed: this.ariaPressed || nothing,
      expanded: this.ariaExpanded || nothing,
      haspopup: this.ariaHasPopup || nothing,
      current: this.ariaCurrent || nothing,
    };
  }

  render() {
    const content = html`
      ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : ''}
      ${this.copy ? (this._copied ? '✓ Copied' : html`<slot></slot>`) : html`<slot></slot>`}
    `;

    // A link when href is set (and it isn't a copy button), so it never has to be nested in an <a>
    const aria = this._aria();
    if (this.href && !this.copy) {
      const unavailable = this.disabled || this._formDisabled || this.loading;
      return html`
        <a
          href=${unavailable ? nothing : this.href}
          target=${this.target || nothing}
          rel=${this.target === '_blank' ? 'noopener noreferrer' : nothing}
          aria-disabled=${unavailable ? 'true' : nothing}
          aria-busy=${this.loading ? 'true' : nothing}
          aria-label=${aria.label}
          aria-expanded=${aria.expanded}
          aria-haspopup=${aria.haspopup}
          aria-current=${aria.current}
          @click=${this._handleClick}
          part="button"
        >${content}</a>
      `;
    }

    return html`
      <button
        type="button"
        ?disabled=${this.disabled || this._formDisabled || this.loading}
        @click=${this._handleClick}
        aria-busy=${this.loading}
        aria-label=${aria.label}
        aria-pressed=${aria.pressed}
        aria-expanded=${aria.expanded}
        aria-haspopup=${aria.haspopup}
        aria-current=${aria.current}
        part="button"
      >${content}</button>
    `;
  }

  _handleClick(e) {
    if (this.disabled || this._formDisabled || this.loading) { e.preventDefault(); e.stopPropagation(); return; }
    const isLink = this.href && !this.copy;
    if (!isLink && (this.type === 'submit' || this.type === 'reset')) this._activateAfterDispatch(e);
    if (this.copy) {
      this._copyThenNotify();
      return;
    }
    this.dispatchEvent(new CustomEvent('pastis-click', { bubbles: true, composed: true }));
  }

  async _copyThenNotify() {
    try { await navigator.clipboard.writeText(this.copy); } catch { /* ignore */ }
    this._copied = true;
    setTimeout(() => { this._copied = false; }, 2000);
    this.dispatchEvent(new CustomEvent('pastis-click', { bubbles: true, composed: true }));
  }

  /**
   * Submit/reset is the click's default action, as for a native button: it runs once the click
   * has gone through every listener, and not at all when one of them called preventDefault().
   * A window listener added now runs last in the click's path; if propagation was stopped before
   * it, a task fallback runs the activation instead (stopPropagation does not cancel it natively).
   */
  _activateAfterDispatch(event) {
    let done = false;
    const activate = () => {
      if (done) return;
      done = true;
      window.removeEventListener('click', onWindowClick);
      clearTimeout(fallback);
      if (event.defaultPrevented) return;
      if (this.type === 'submit') this._submit();
      else if (this.type === 'reset') this.form?.reset();
    };
    const onWindowClick = (e) => { if (e === event) activate(); };
    window.addEventListener('click', onWindowClick);
    const fallback = setTimeout(activate);
  }

  /**
   * Submits the owning form like a native submit button: validation runs, `submit` fires once
   * and the form data includes this button's name/value. `requestSubmit()` only accepts native
   * submit buttons as submitter, so a hidden native button stands in for the host for the
   * duration of the call (it is the event's `submitter`).
   */
  _submit() {
    const form = this.form;
    if (!form) return;
    const proxy = document.createElement('button');
    proxy.type = 'submit';
    proxy.hidden = true;
    if (this.name) proxy.name = this.name;
    if (this.value != null) proxy.value = this.value;
    form.append(proxy);
    try {
      form.requestSubmit(proxy);
    } finally {
      proxy.remove();
    }
  }
}

customElements.define('pastis-button', PastisButton);

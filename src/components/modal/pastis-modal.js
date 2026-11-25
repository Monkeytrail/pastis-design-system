import { LitElement, html, css } from 'lit';

/** The element that really has focus, looking through shadow roots. */
function deepActiveElement() {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

function isTabbable(el) {
  if (el.tabIndex < 0 || el.localName === 'slot') return false;
  // <a> without href is not focusable, though its tabIndex reports 0
  if (el.localName === 'a' && !el.hasAttribute('href') && !el.hasAttribute('tabindex')) return false;
  // :disabled also covers controls (and form-associated elements) in a disabled <fieldset>
  if (el.disabled || el.matches(':disabled') || el.inert || el.closest('[inert]')) return false;
  return typeof el.checkVisibility === 'function'
    ? el.checkVisibility({ visibilityProperty: true })
    : el.getClientRects().length > 0;
}

/**
 * A radio group is one tab stop: keep its checked radio, or its first one when none is checked.
 * @param {HTMLElement[]} elements
 */
function oneStopPerRadioGroup(elements) {
  const groupKey = el => (el instanceof HTMLInputElement && el.type === 'radio' && el.name ? el.name : null);
  const groups = new Map();
  for (const el of elements) {
    const key = groupKey(el);
    if (!key) continue;
    const scope = el.form ?? el.getRootNode();
    const scoped = groups.get(scope) ?? new Map();
    groups.set(scope, scoped);
    const members = scoped.get(key) ?? [];
    scoped.set(key, members);
    members.push(el);
  }
  const keep = new Set();
  for (const scoped of groups.values()) {
    for (const members of scoped.values()) keep.add(members.find(r => r.checked) ?? members[0]);
  }
  return elements.filter(el => !groupKey(el) || keep.has(el));
}

/** Tabbable elements under `nodes` in flat-tree order (through slots and open shadow roots). */
function* tabbables(nodes) {
  for (const el of nodes) {
    if (!(el instanceof HTMLElement)) continue;
    if (isTabbable(el)) yield el;
    if (el.localName === 'slot') {
      const assigned = el.assignedElements({ flatten: true });
      yield* tabbables(assigned.length ? assigned : el.children);
    } else if (el.shadowRoot) {
      yield* tabbables(el.shadowRoot.children);
    } else {
      yield* tabbables(el.children);
    }
  }
}

/**
 * Modal dialog on the native <dialog> (`showModal()`): the rest of the page is inert while it is
 * open, Tab and Shift+Tab cycle through everything in it (slotted content included), Escape
 * closes it unless `persistent`, and focus returns to where it was when it closes.
 *
 * Initial focus goes to an element with `autofocus` in the slotted content, else the first
 * focusable slotted element, else the close button.
 *
 * @slot - Body content (the dialog's description)
 * @slot footer - Actions
 * @csspart backdrop - The <dialog> element, covering the viewport
 * @csspart dialog - The visible panel
 * @fires pastis-open - When opened with `open_()`
 * @fires pastis-close - When closed (close button, Escape, backdrop or `close()`)
 */
export class PastisModal extends LitElement {
  static properties = {
    /** Shows the dialog. */
    open: { type: Boolean, reflect: true },
    /** Title, also the dialog's accessible name. */
    title: { type: String },
    /** sm | md | lg | xl | full */
    size: { type: String, reflect: true },
    /** Shows the close button. */
    closable: { type: Boolean, reflect: true },
    /** Ignores Escape and backdrop clicks. */
    persistent: { type: Boolean, reflect: true },
    /**
     * `dialog` (default) or `alertdialog` (a confirmation or warning that needs a response).
     * Applied to the inner <dialog>; a `role` attribute on the host is consumed (removed).
     */
    role: { type: String },
  };

  static styles = css`
    :host { display: contents; }
    :host(:not([open])) { display: none; }

    /* The <dialog> covers the viewport and is the dimmed backdrop; the panel sits inside it */
    .backdrop {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      margin: 0;
      border: 0;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.85);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      color: inherit;
    }

    .backdrop:not([open]) { display: none; }
    .backdrop::backdrop { background: transparent; }
    .backdrop:focus-visible { outline: none; }

    .dialog {
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-lg, 8px);
      width: 100%;
      max-height: calc(100vh - 32px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    :host(:not([size])) .dialog,
    :host([size="md"]) .dialog { max-width: 540px; }
    :host([size="sm"]) .dialog { max-width: 380px; }
    :host([size="lg"]) .dialog { max-width: 720px; }
    :host([size="xl"]) .dialog { max-width: 960px; }
    :host([size="full"]) .dialog { max-width: calc(100vw - 32px); height: calc(100vh - 32px); }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: var(--border-width, 1px) solid var(--border-default, #383c44);
      flex-shrink: 0;
    }

    .modal-title {
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      margin: 0;
    }

    .close-btn {
      background: var(--bg-primary, #0d0d0d);
      border: var(--border-width, 1px) solid var(--text-primary, #f9f4da);
      border-radius: var(--radius-sm, 4px);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary, #f9f4da);
      font-size: 14px;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-weight: 700;
      transition: box-shadow 120ms ease;
      flex-shrink: 0;
    }

    .close-btn:hover {
      box-shadow: var(--shadow-xl, 5px 5px 0 #fc7428);
    }

    .close-btn:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      color: var(--text-secondary, #fff);
      font-size: 14px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: var(--border-width, 1px) solid var(--border-default, #383c44);
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      flex-shrink: 0;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.closable = true;
    this.persistent = false;
    this.size = 'md';
    this.role = 'dialog';
    this._boundKeydown = this._handleKeydown.bind(this);
    this._previousFocus = null;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._boundKeydown);
    // Moved in the DOM while open: removal took the <dialog> out of the top layer
    if (this.open && this.hasUpdated) {
      this.updateComplete.then(() => {
        if (!this.open || !this.isConnected) return;
        const dialog = this._dialog;
        if (dialog && !dialog.matches(':modal')) {
          dialog.removeAttribute('open'); // still marked open, but no longer modal
          dialog.showModal();
        }
        document.body.style.overflow = 'hidden';
        this._focusInitial();
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundKeydown);
    if (this.open) document.body.style.overflow = '';
  }

  /**
   * The host must not keep a `role` attribute: it would be a second, empty (alert)dialog around
   * the real one. The attribute is read into the `role` property and removed from the host.
   */
  attributeChangedCallback(name, oldValue, value) {
    if (name !== 'role') {
      super.attributeChangedCallback(name, oldValue, value);
      return;
    }
    if (this._consumingRole) return;
    this.role = value ?? 'dialog';
    if (value !== null) {
      this._consumingRole = true;
      this.removeAttribute('role');
      this._consumingRole = false;
    }
  }

  get _dialog() { return this.shadowRoot?.querySelector('dialog') ?? null; }

  /** Every tabbable element in the dialog, in order, slotted content included. */
  _getFocusableElements() {
    const panel = this.shadowRoot?.querySelector('.dialog');
    return panel ? oneStopPerRadioGroup([...tabbables(panel.children)]) : [];
  }

  willUpdate(changed) {
    // Close the native dialog before it leaves the DOM, so the browser restores focus
    if (changed.has('open') && !this.open) this._dialog?.close();
  }

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        this._previousFocus = deepActiveElement();
        document.body.style.overflow = 'hidden';
        const dialog = this._dialog;
        if (dialog && !dialog.open && dialog.isConnected) dialog.showModal();
        this._focusInitialWhenReady();
      } else if (changed.get('open')) {
        document.body.style.overflow = '';
        if (this._previousFocus?.isConnected && deepActiveElement() !== this._previousFocus) {
          this._previousFocus.focus();
        }
        this._previousFocus = null;
      }
    }
  }

  /**
   * Slotted Lit elements (e.g. a pastis-input with autofocus) may not have rendered yet when the
   * modal opens in the same pass as its content: wait for them before picking the target.
   */
  async _focusInitialWhenReady() {
    const pending = [...this.querySelectorAll('*')]
      .map(el => el.updateComplete)
      .filter(p => p && typeof p.then === 'function');
    if (pending.length) await Promise.all(pending);
    if (!this.open || !this.isConnected) return;
    // The user (or the content itself) may already have moved focus into the dialog
    const active = deepActiveElement();
    const inDialog = active && (this.contains(active) || this.shadowRoot.contains(active)
      || this.contains(active.getRootNode().host));
    if (inDialog && active !== this.shadowRoot.querySelector('.close-btn') && active !== this._dialog) return;
    this._focusInitial();
  }

  _focusInitial() {
    const auto = this.querySelector('[autofocus]');
    const slotted = this._getFocusableElements().filter(el => el.getRootNode() !== this.shadowRoot);
    const target = auto
      || slotted[0]
      || this.shadowRoot.querySelector('.close-btn')
      || this.shadowRoot.querySelector('.modal-body');
    target?.focus();
  }

  render() {
    if (!this.open) return html``;
    const role = this.role === 'alertdialog' ? 'alertdialog' : 'dialog';

    return html`
      <dialog
        class="backdrop"
        @click="${this._handleBackdropClick}"
        @cancel="${this._handleCancel}"
        @close="${this._handleNativeClose}"
        @keydown="${this._handleTab}"
        role="${role}"
        aria-modal="true"
        aria-label="${this.title || 'Dialog'}"
        aria-describedby="modal-body"
        part="backdrop"
      >
        <div class="dialog" part="dialog">
          <div class="modal-header">
            <h2 class="modal-title">${this.title || ''}</h2>
            ${this.closable ? html`
              <button class="close-btn" @click="${this.close}" aria-label="Close dialog">✕</button>
            ` : ''}
          </div>
          <div class="modal-body" id="modal-body" tabindex="0">
            <slot></slot>
          </div>
          <slot name="footer" class="modal-footer"></slot>
        </div>
      </dialog>
    `;
  }

  _handleBackdropClick(e) {
    if (e.target !== e.currentTarget) return;
    if (!this.persistent) this.close();
  }

  /** Escape. Handled on keydown so it also works when the close request never reaches the dialog. */
  _handleKeydown(e) {
    if (!this.open || e.key !== 'Escape' || e.defaultPrevented) return;
    e.preventDefault(); // the native cancel would close the dialog behind Lit's back
    if (!this.persistent) this.close();
  }

  /** Other close requests (e.g. the Android back gesture). */
  _handleCancel(e) {
    e.preventDefault();
    if (!this.persistent) this.close();
  }

  /**
   * The browser closed the dialog by itself: keep `open` in step. A `close` event is queued, so
   * one from a previous <dialog> (closed, then the modal reopened) must not close the new one.
   */
  _handleNativeClose(e) {
    if (e.target !== this._dialog || e.target.open) return;
    if (this.open) this.close();
  }

  /** Wraps Tab / Shift+Tab inside the dialog (the browser would move on to its own UI). */
  _handleTab(e) {
    if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return;
    const focusable = this._getFocusableElements();
    if (!focusable.length) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = deepActiveElement();
    const inside = focusable.includes(active);
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  }

  open_() {
    this.open = true;
    this.dispatchEvent(new CustomEvent('pastis-open', { bubbles: true, composed: true }));
  }

  close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('pastis-close', { bubbles: true, composed: true }));
  }
}

customElements.define('pastis-modal', PastisModal);

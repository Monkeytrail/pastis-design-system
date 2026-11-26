import { LitElement, html, css, nothing } from 'lit';

/**
 * Editor shell: the frame of a rich-text field, for an editor the app brings (Tiptap,
 * ProseMirror, a plain `contenteditable`). Pastis draws the label, a toolbar row, the field's
 * border with the focus ring of the other fields, and helper or error text; the app mounts its
 * editor into the default slot and its buttons into `toolbar`.
 *
 * - **Content styles:** slotted content is light DOM, which shadow styles cannot reach: load
 *   `pastis-design-system/src/components/editor/prose.css` and give the editable element the
 *   class `pastis-prose` (headings, lists, task lists, code, quotes, both themes).
 * - **Accessible name:** the visible label is in shadow DOM and cannot name a slotted element:
 *   give the editable element `role="textbox"`, `aria-multiline="true"` and an `aria-label`
 *   (the same text as `label`).
 * - **Focus:** the frame shows the focus ring while anything inside it has focus, and a tap
 *   anywhere in the content area focuses the editor (prose.css lets it fill the frame).
 * - **Disabled:** the slotted editor and toolbar become `inert`.
 *
 * @slot - The editable element
 * @slot toolbar - Formatting buttons (e.g. pastis-button with `aria-pressed`)
 * @csspart frame - The bordered frame around the content
 * @csspart toolbar - The toolbar row
 */
export class PastisEditor extends LitElement {
  static properties = {
    /** Visible label (name the editable element with the same text, see above). */
    label: { type: String },
    /** Helper text below the field. */
    helper: { type: String },
    /** Error message; replaces the helper and marks the field invalid. */
    error: { type: String },
    /**
     * Disables the field: dimmed, and its slotted editor and toolbar made `inert` (no focus, no
     * input, hidden from assistive technology until enabled again).
     */
    disabled: { type: Boolean, reflect: true },
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

    .label {
      font-size: var(--font-size-micro, 11px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-transform: uppercase;
      color: var(--text-primary, #f4eee3);
    }

    .frame {
      display: flex;
      flex-direction: column;
      border: var(--border-width, 1px) solid var(--border-default, #3a322b);
      border-radius: var(--radius-md, 6px);
      background: var(--bg-primary, #110d0a);
      transition: border-color var(--transition-fast, 120ms ease);
    }

    .frame:hover { border-color: var(--text-tertiary, #a39b90); }

    .frame:focus-within {
      border-color: var(--border-focus, #fcba28);
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .has-error .frame { border-color: var(--text-error, #f45f6b); }

    :host([disabled]) .frame { opacity: 0.4; }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs, 4px);
      padding: var(--space-xs, 4px);
      border-bottom: var(--border-width, 1px) solid var(--border-subtle, #2a241f);
    }

    .toolbar:not(.filled) { display: none; }

    .content {
      display: flex;
      flex-direction: column;
      padding: var(--space-sm, 8px) calc(var(--space-sm, 8px) * 1.5);
      min-height: calc(var(--space-2xl, 48px) * 3);
      cursor: text;
    }

    .helper-text, .error-text {
      margin: 0;
      font-size: var(--font-size-micro, 11px);
      line-height: var(--line-height-caption, 1.4);
    }

    .helper-text { color: var(--text-tertiary, #a39b90); }
    .error-text { color: var(--text-error, #f45f6b); }
  `;

  constructor() {
    super();
    this.disabled = false;
    this._toolbarFilled = false;
  }

  render() {
    const hasError = !!this.error;
    return html`
      <div class="field ${hasError ? 'has-error' : ''}">
        ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
        <div class="frame" part="frame">
          <div class="toolbar ${this._toolbarFilled ? 'filled' : ''}" part="toolbar">
            <slot name="toolbar" @slotchange=${this._onToolbarChange}></slot>
          </div>
          <div class="content" @click=${this._focusEditor}><slot @slotchange=${this._applyDisabled}></slot></div>
        </div>
        ${hasError
          ? html`<p class="error-text" role="alert">${this.error}</p>`
          : this.helper ? html`<p class="helper-text">${this.helper}</p>` : nothing}
      </div>
    `;
  }

  updated(changed) {
    if (changed.has('disabled')) this._applyDisabled();
  }

  /** The slotted editor and toolbar follow `disabled` as `inert`. */
  _applyDisabled() {
    for (const element of this.children) element.inert = this.disabled;
  }

  /** A tap on the content area outside the editable element focuses it. */
  _focusEditor(e) {
    if (this.disabled) return;
    const editable = this.querySelector('[contenteditable="true"]');
    if (editable && !editable.contains(e.target)) editable.focus();
  }

  _onToolbarChange(e) {
    const filled = e.target.assignedElements().length > 0;
    if (filled !== this._toolbarFilled) {
      this._toolbarFilled = filled;
      this.requestUpdate();
    }
  }
}

customElements.define('pastis-editor', PastisEditor);

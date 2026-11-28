import { LitElement, html, css } from 'lit';

/**
 * Key cap: one key of a keyboard shortcut, as a `<kbd>` element (`Esc`, `?`, `⌘`). Put several
 * side by side for a sequence or a chord, with the words in between as text ("<kbd>g</kbd> then
 * <kbd>t</kbd>").
 *
 * The key is the slotted text, read as written. For a symbol that screen readers do not say well
 * (`↑`, `⌘`), set `label` ("Up arrow", "Command"): the symbol is then hidden from assistive
 * technology and the label is read instead (visually hidden text, not `aria-label`, which a
 * `kbd` does not take).
 *
 * @slot - The key, as text
 * @csspart kbd - The `kbd` element
 */
export class PastisKbd extends LitElement {
  static properties = {
    /** What screen readers read instead of the slotted symbol (“Up arrow”). */
    label: { type: String },
  };

  static styles = css`
    :host { display: inline-flex; vertical-align: baseline; }
    :host([hidden]) { display: none; }

    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      min-width: calc(var(--space-md, 16px) + var(--space-xs, 4px));
      padding: 0 var(--space-xs, 4px);
      border: var(--border-width, 1px) solid var(--border-default, #3a322b);
      border-bottom-width: calc(var(--border-width, 1px) * 2);
      border-radius: var(--radius-sm, 4px);
      background: var(--bg-elevated, #2a231d);
      color: var(--text-primary, #f4eee3);
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-caption, 12px);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-caption, 1.4);
      white-space: nowrap;
    }

    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `;

  render() {
    if (!this.label) return html`<kbd part="kbd"><slot></slot></kbd>`;
    return html`<kbd part="kbd"><span aria-hidden="true"><slot></slot></span><span class="sr">${this.label}</span></kbd>`;
  }
}

customElements.define('pastis-kbd', PastisKbd);

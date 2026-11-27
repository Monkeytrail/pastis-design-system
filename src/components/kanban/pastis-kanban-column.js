import { LitElement, html, css, nothing } from 'lit';

/**
 * Kanban column: one status of a board, a named list of its slotted cards with a count. Put
 * columns in a `<pastis-kanban-board>`, which moves cards between them.
 *
 * - **Cards** are the column's children (e.g. `<pastis-task-row reorderable>`, a `listitem`);
 *   their handles are what the board listens to.
 * - **Move here:** while the board has a card picked up, every other column shows a "Move here"
 *   button, which puts the card at its end.
 *
 * @slot - The cards
 * @csspart header - The heading and count
 * @csspart cards - The list of cards
 */
export class PastisKanbanColumn extends LitElement {
  static properties = {
    /** The column's value, reported in `pastis-kanban-move` (e.g. a status). */
    value: { type: String, reflect: true },
    /** Visible name, and the list's accessible name. */
    label: { type: String },
    /** Set by the board while a card from another column is picked up. */
    dropTarget: { type: Boolean, reflect: true, attribute: 'drop-target' },
    /** Set by the board while a dragged card is over this column. */
    over: { type: Boolean, reflect: true },
    _count: { state: true },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-width: 0;
      border: var(--border-width, 1px) solid var(--border-subtle, #2a241f);
      border-radius: var(--radius-lg, 10px);
      background: var(--bg-secondary, #16110d);
      transition: border-color var(--transition-fast, 120ms ease);
    }
    :host([hidden]) { display: none; }
    :host([over]) { border-color: var(--action-primary, #fcba28); }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm, 8px);
      min-height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      padding: 0 var(--space-sm, 8px) 0 var(--space-md, 16px);
      font-family: var(--font-family-mono, monospace);
    }

    h3 {
      margin: 0;
      font-size: var(--font-size-micro, 11px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-transform: uppercase;
      color: var(--text-primary, #f4eee3);
    }

    .count {
      color: var(--text-tertiary, #a39b90);
      font-size: var(--font-size-caption, 12px);
    }

    .move {
      margin: 0;
      min-height: var(--space-xl, 32px);
      padding: 0 var(--space-sm, 8px);
      border: var(--border-width, 1px) solid var(--action-primary, #fcba28);
      border-radius: var(--radius-full, 9999px);
      background: none;
      color: var(--text-primary, #f4eee3);
      font: inherit;
      font-size: var(--font-size-caption, 12px);
      font-weight: var(--font-weight-bold, 700);
      cursor: pointer;
    }
    .move:focus-visible { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }

    @media (pointer: coarse) {
      .move { min-height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px)); }
    }

    .cards {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs, 4px);
      flex: 1;
      min-height: var(--space-2xl, 48px);
      padding: 0 var(--space-xs, 4px) var(--space-xs, 4px);
    }
  `;

  constructor() {
    super();
    this.dropTarget = false;
    this.over = false;
    this._count = 0;
  }

  render() {
    const label = this.label || this.value || '';
    return html`
      <div class="header" part="header">
        <h3>${label} <span class="count" aria-hidden="true">${this._count}</span></h3>
        ${this.dropTarget ? html`
          <button class="move" type="button" aria-label="Move here: ${label}" @click=${this._moveHere}>Move here</button>
        ` : nothing}
      </div>
      <div class="cards" part="cards" role="list" aria-label="${label}, ${this._count} ${this._count === 1 ? 'item' : 'items'}">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }

  _onSlotChange(e) {
    this._count = e.target.assignedElements().length;
  }

  _moveHere() {
    this.dispatchEvent(new CustomEvent('pastis-kanban-move-here', { bubbles: true, composed: true }));
  }
}

customElements.define('pastis-kanban-column', PastisKanbanColumn);

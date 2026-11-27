import { LitElement, html, css } from 'lit';
import './pastis-kanban-column.js';

/** Pointer travel (px) before a press on a handle becomes a drag rather than a tap. */
const DRAG_THRESHOLD = 6;

/**
 * Kanban board: lays out its `<pastis-kanban-column>` children side by side (scrolling sideways on
 * a phone) and turns gestures on the cards' handles into moves. It never moves the cards: the app
 * updates its data and renders them again.
 *
 * - **Handles:** an element with the part `handle` (`<pastis-task-row reorderable>`) or the
 *   attribute `data-sortable-handle`, inside a card (a column's child).
 * - **Ways to move a card** (WCAG 2.5.7):
 *   1. **Drag** a handle to another place, in its column or another: the column under the pointer
 *      highlights and a line shows where the card lands.
 *   2. **Tap** a handle to pick the card up (`data-picked`); then tap another card's handle (that
 *      place) or a column's "Move here" button (its end). The same handle, or Escape, puts it back.
 *   3. **Keys** on a focused handle: Arrow Up / Down within the column; Arrow Left / Right to the
 *      end of the neighbouring column.
 * - **Event:** `pastis-kanban-move` with `detail { from: { column, index }, to: { column, index } }`:
 *   columns by their `value`, `to.index` the card's index in the target column afterwards.
 *
 * @fires pastis-kanban-move - A card was moved, detail { from, to }
 * @slot - The columns
 * @csspart indicator - The line that shows where a dragged card will land
 */
export class PastisKanbanBoard extends LitElement {
  static properties = {
    /** Disables every way of moving cards. */
    disabled: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; position: relative; }
    :host([hidden]) { display: none; }

    .columns {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(16rem, 1fr);
      gap: var(--space-sm, 8px);
      overflow-x: auto;
      padding-bottom: var(--space-xs, 4px);
      scroll-snap-type: x proximity;
    }

    ::slotted(pastis-kanban-column) { scroll-snap-align: start; }

    ::slotted([data-dragging]) { opacity: 0.4; }

    .indicator {
      position: absolute;
      height: 2px;
      margin-top: -1px;
      background: var(--action-primary, #fcba28);
      pointer-events: none;
    }
    .indicator[hidden] { display: none; }
  `;

  constructor() {
    super();
    this.disabled = false;
    this._press = null;
    this._picked = null;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onMoveHere = this._onMoveHere.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('pointerdown', this._onPointerDown);
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeydown);
    this.addEventListener('pastis-kanban-move-here', this._onMoveHere);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pointerdown', this._onPointerDown);
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeydown);
    this.removeEventListener('pastis-kanban-move-here', this._onMoveHere);
    this._endPress();
  }

  render() {
    return html`
      <div class="columns"><slot></slot></div>
      <div class="indicator" part="indicator" aria-hidden="true" hidden></div>
    `;
  }

  _columns() {
    return [...this.children].filter(child => child.localName === 'pastis-kanban-column' && !child.hidden);
  }

  _cards(column) {
    return [...column.children].filter(child => !child.hidden);
  }

  /** The card (and its column) an event's handle belongs to, or null when not on a handle. */
  _cardOfHandle(event) {
    const path = event.composedPath();
    const isHandle = (node) =>
      node instanceof Element &&
      (node.hasAttribute('data-sortable-handle') ||
        (node.getAttribute('part') ?? '').split(/\s+/).includes('handle'));
    const handle = path.findIndex(isHandle);
    if (handle === -1 || path[handle].disabled) return null;
    const rest = path.slice(handle);
    const column = rest.find(node => node instanceof Element && node.localName === 'pastis-kanban-column' && node.parentElement === this);
    if (!column) return null;
    const card = rest.find(node => node instanceof Element && node.parentElement === column);
    return card ? { card, column } : null;
  }

  _where(card, column) {
    return { column: column.value, index: this._cards(column).indexOf(card) };
  }

  _move(from, to) {
    if (from.column === to.column && from.index === to.index) return;
    this.dispatchEvent(new CustomEvent('pastis-kanban-move', {
      detail: { from, to }, bubbles: true, composed: true,
    }));
  }

  _setPicked(picked) {
    if (this._picked) this._picked.card.removeAttribute('data-picked');
    this._picked = picked;
    if (picked) picked.card.setAttribute('data-picked', '');
    for (const column of this._columns()) {
      column.dropTarget = !!picked && column !== picked.column;
    }
  }

  // ─── Tap: pick up and put down ─────────────────────────────────────────────

  _onClick(event) {
    if (this.disabled) return;
    const target = this._cardOfHandle(event);
    if (!target) return;
    if (this._suppressClick) {
      this._suppressClick = false;
      return;
    }
    if (!this._picked) {
      this._setPicked(target);
      return;
    }
    const picked = this._picked;
    this._setPicked(null);
    if (picked.card === target.card) return;
    const from = this._where(picked.card, picked.column);
    const to = this._where(target.card, target.column);
    this._move(from, to);
  }

  _onMoveHere(event) {
    if (this.disabled || !this._picked) return;
    const column = event.composedPath().find(node => node instanceof Element && node.localName === 'pastis-kanban-column');
    if (!column) return;
    const picked = this._picked;
    this._setPicked(null);
    this._move(this._where(picked.card, picked.column), { column: column.value, index: this._cards(column).length });
  }

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  _onKeydown(event) {
    if (this.disabled) return;
    if (event.key === 'Escape' && this._picked) {
      this._setPicked(null);
      return;
    }
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const target = this._cardOfHandle(event);
    if (!target) return;
    event.preventDefault();
    const from = this._where(target.card, target.column);
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const index = from.index + (event.key === 'ArrowUp' ? -1 : 1);
      if (index < 0 || index >= this._cards(target.column).length) return;
      this._move(from, { column: from.column, index });
      return;
    }
    const columns = this._columns();
    const next = columns[columns.indexOf(target.column) + (event.key === 'ArrowLeft' ? -1 : 1)];
    if (!next) return;
    this._move(from, { column: next.value, index: this._cards(next).length });
  }

  // ─── Drag ──────────────────────────────────────────────────────────────────

  _onPointerDown(event) {
    if (this.disabled || event.button !== 0 || this._press) return;
    const target = this._cardOfHandle(event);
    if (!target) return;
    this._press = { ...target, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dragging: false, to: null };
    this.addEventListener('pointermove', this._onPointerMove);
    this.addEventListener('pointerup', this._onPointerUp);
    this.addEventListener('pointercancel', this._onPointerUp);
  }

  _onPointerMove(event) {
    const press = this._press;
    if (!press || event.pointerId !== press.pointerId) return;
    if (!press.dragging) {
      if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) < DRAG_THRESHOLD) return;
      press.dragging = true;
      try {
        this.setPointerCapture(press.pointerId);
      } catch {
        // A pointer the browser no longer tracks (or a synthetic one): follow it uncaptured
      }
      this._setPicked(null);
      press.card.setAttribute('data-dragging', '');
    }
    event.preventDefault();
    const column = this._columnAt(event.clientX);
    for (const each of this._columns()) each.over = each === column;
    if (!column) {
      press.to = null;
      this.shadowRoot?.querySelector('.indicator')?.setAttribute('hidden', '');
      return;
    }
    const index = this._dropIndex(column, event.clientY, press.card);
    press.to = { column: column.value, index };
    this._showIndicator(column, index, press.card);
  }

  _onPointerUp(event) {
    const press = this._press;
    if (!press || event.pointerId !== press.pointerId) return;
    const { card, column, dragging, to } = press;
    this._endPress();
    if (!dragging) return;
    this._suppressClick = true;
    setTimeout(() => { this._suppressClick = false; }, 0);
    if (event.type === 'pointercancel' || !to) return;
    this._move(this._where(card, column), to);
  }

  _endPress() {
    const press = this._press;
    if (!press) return;
    this._press = null;
    press.card.removeAttribute('data-dragging');
    for (const column of this._columns()) column.over = false;
    this.shadowRoot?.querySelector('.indicator')?.setAttribute('hidden', '');
    this.removeEventListener('pointermove', this._onPointerMove);
    this.removeEventListener('pointerup', this._onPointerUp);
    this.removeEventListener('pointercancel', this._onPointerUp);
    try {
      if (this.hasPointerCapture(press.pointerId)) this.releasePointerCapture(press.pointerId);
    } catch {
      // Already released
    }
  }

  _columnAt(x) {
    return this._columns().find(column => {
      const rect = column.getBoundingClientRect();
      return x >= rect.left && x <= rect.right;
    }) ?? null;
  }

  /** The dragged card's index in `column` afterwards: the other cards whose middle is above y. */
  _dropIndex(column, y, dragged) {
    let index = 0;
    for (const card of this._cards(column)) {
      if (card === dragged) continue;
      const rect = card.getBoundingClientRect();
      if (y > rect.top + rect.height / 2) index++;
    }
    return index;
  }

  _showIndicator(column, index, dragged) {
    const indicator = this.shadowRoot?.querySelector('.indicator');
    if (!indicator) return;
    const others = this._cards(column).filter(card => card !== dragged);
    const host = this.getBoundingClientRect();
    const box = column.getBoundingClientRect();
    const top = index < others.length
      ? others[index].getBoundingClientRect().top
      : others.at(-1)?.getBoundingClientRect().bottom ?? box.top + box.height / 2;
    indicator.style.top = `${top - host.top}px`;
    indicator.style.left = `${box.left - host.left + 8}px`;
    indicator.style.width = `${box.width - 16}px`;
    indicator.removeAttribute('hidden');
  }
}

customElements.define('pastis-kanban-board', PastisKanbanBoard);

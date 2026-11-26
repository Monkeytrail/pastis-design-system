import { LitElement, html, css } from 'lit';

/** Pointer travel (px) before a press on a handle becomes a drag rather than a tap. */
const DRAG_THRESHOLD = 6;

/**
 * Sortable: makes its children reorderable by their handles, and reports the new order. The
 * children stay the app's; the app moves them when it gets `pastis-reorder`.
 *
 * - **Handles:** an element is a handle if it has the part `handle` (as in
 *   `<pastis-task-row reorderable>`) or the attribute `data-sortable-handle` (any button in a
 *   child, for rows the app renders itself). Make handles buttons with a name (“Reorder Milk”).
 * - **Three ways to move a child** (WCAG 2.5.7, a non-dragging alternative):
 *   1. **Drag** a handle (mouse, pen or touch): the child follows the pointer and a line shows
 *      where it will land.
 *   2. **Tap** a handle to pick the child up (it gets `data-picked`), then tap another child's
 *      handle to put it in that place; tap the same handle (or Escape) to put it down.
 *   3. **Arrow Up / Arrow Down** on a focused handle move it one place.
 * - **A list:** give the element `role="list"` and a name (`aria-label`); its children are the
 *   items (`<pastis-task-row>` is a `listitem`; give other children `role="listitem"`). The
 *   moved row keeps focus; moves are not announced yet (a live region in the list would be one
 *   of its items).
 * - **Event:** `pastis-reorder` with `detail { from, to }`: the child's index before, and its
 *   index in the new order (both among the element children, in order). Not fired for no move.
 *
 * @fires pastis-reorder - A child was moved, detail { from, to }
 * @csspart indicator - The line that shows where a dragged child will land
 */
export class PastisSortable extends LitElement {
  static properties = {
    /** Disables every way of reordering. */
    disabled: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; position: relative; }
    :host([hidden]) { display: none; }

    ::slotted([data-dragging]) {
      position: relative;
      z-index: 1;
      opacity: 0.9;
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.35));
      background: var(--bg-elevated, #251f1a);
    }

    ::slotted([data-picked]) {
      outline: 2px solid var(--action-primary, #fcba28);
      outline-offset: -2px;
    }

    .indicator {
      position: absolute;
      inset-inline: 0;
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
    /** The pressed handle's child, while a press or drag goes on. */
    this._press = null;
    /** The child picked up by a tap. */
    this._picked = null;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('pointerdown', this._onPointerDown);
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pointerdown', this._onPointerDown);
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeydown);
    this._endPress();
  }

  render() {
    return html`
      <slot></slot>
      <div class="indicator" part="indicator" aria-hidden="true" hidden></div>
    `;
  }

  /** The children, in order. */
  _items() {
    return [...this.children].filter(child => !child.hidden);
  }

  /** The child an event's handle belongs to, or null when the event is not on a handle. */
  _childOfHandle(event) {
    const path = event.composedPath();
    const isHandle = (node) =>
      node instanceof Element &&
      (node.hasAttribute('data-sortable-handle') ||
        (node.getAttribute('part') ?? '').split(/\s+/).includes('handle'));
    const handle = path.findIndex(isHandle);
    if (handle === -1) return null;
    if (path[handle].disabled) return null;
    const child = path.slice(handle).find(node => node instanceof Element && node.parentElement === this);
    return child ?? null;
  }

  _move(from, to) {
    const items = this._items();
    if (from === to || from < 0 || to < 0 || to >= items.length) return;
    this.dispatchEvent(new CustomEvent('pastis-reorder', {
      detail: { from, to }, bubbles: true, composed: true,
    }));
  }

  _setPicked(child) {
    this._picked?.removeAttribute('data-picked');
    this._picked = child;
    child?.setAttribute('data-picked', '');
  }

  // ─── Tap: pick up and put down ─────────────────────────────────────────────

  _onClick(event) {
    if (this.disabled) return;
    const child = this._childOfHandle(event);
    if (!child) return;
    if (this._suppressClick) {
      this._suppressClick = false;
      return;
    }
    if (!this._picked) {
      this._setPicked(child);
      return;
    }
    const items = this._items();
    const from = items.indexOf(this._picked);
    const to = items.indexOf(child);
    this._setPicked(null);
    if (from !== to) this._move(from, to);
  }

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  _onKeydown(event) {
    if (this.disabled) return;
    if (event.key === 'Escape' && this._picked) {
      this._setPicked(null);
      return;
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    const child = this._childOfHandle(event);
    if (!child) return;
    event.preventDefault();
    const from = this._items().indexOf(child);
    this._move(from, from + (event.key === 'ArrowUp' ? -1 : 1));
  }

  // ─── Drag ──────────────────────────────────────────────────────────────────

  _onPointerDown(event) {
    if (this.disabled || event.button !== 0 || this._press) return;
    const child = this._childOfHandle(event);
    if (!child) return;
    this._press = { child, pointerId: event.pointerId, startY: event.clientY, dragging: false, to: null };
    // The pointer is captured only once the press becomes a drag: captured, the click of a tap
    // would go to this element instead of the handle.
    this.addEventListener('pointermove', this._onPointerMove);
    this.addEventListener('pointerup', this._onPointerUp);
    this.addEventListener('pointercancel', this._onPointerUp);
  }

  _onPointerMove(event) {
    const press = this._press;
    if (!press || event.pointerId !== press.pointerId) return;
    const dy = event.clientY - press.startY;
    if (!press.dragging) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return;
      press.dragging = true;
      try {
        this.setPointerCapture(press.pointerId);
      } catch {
        // A pointer the browser no longer tracks (or a synthetic one): follow it uncaptured
      }
      this._setPicked(null);
      press.child.setAttribute('data-dragging', '');
    }
    event.preventDefault();
    press.child.style.transform = `translateY(${dy}px)`;
    press.to = this._dropIndex(event.clientY, press.child);
    this._showIndicator(press.to, press.child);
  }

  _onPointerUp(event) {
    const press = this._press;
    if (!press || event.pointerId !== press.pointerId) return;
    const { child, dragging, to } = press;
    this._endPress();
    if (!dragging) return;
    // The click that follows a drag is not a tap
    this._suppressClick = true;
    setTimeout(() => { this._suppressClick = false; }, 0);
    if (event.type === 'pointercancel' || to === null) return;
    this._move(this._items().indexOf(child), to);
  }

  _endPress() {
    const press = this._press;
    if (!press) return;
    this._press = null;
    press.child.removeAttribute('data-dragging');
    press.child.style.transform = '';
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

  /** The index the dragged child would get: how many of the others have their middle above y. */
  _dropIndex(y, dragged) {
    const others = this._items().filter(child => child !== dragged);
    let index = 0;
    for (const child of others) {
      const rect = child.getBoundingClientRect();
      if (y > rect.top + rect.height / 2) index++;
    }
    return index;
  }

  _showIndicator(to, dragged) {
    const indicator = this.shadowRoot?.querySelector('.indicator');
    if (!indicator) return;
    const others = this._items().filter(child => child !== dragged);
    const host = this.getBoundingClientRect();
    const edge = to < others.length
      ? others[to].getBoundingClientRect().top
      : others.at(-1)?.getBoundingClientRect().bottom ?? host.top;
    indicator.style.top = `${edge - host.top}px`;
    indicator.removeAttribute('hidden');
  }
}

customElements.define('pastis-sortable', PastisSortable);

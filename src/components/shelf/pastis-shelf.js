import { LitElement, html, css } from 'lit';

/**
 * Horizontal, snapping shelf of slotted items (e.g. project cards).
 * Native scrolling (touch, trackpad, keyboard via focus), plus mouse drag,
 * prev/next buttons and a progress bar.
 *
 * Consumers tune it with:
 *   --pastis-shelf-inset       leading/trailing space; align it with your container
 *   --pastis-shelf-item-width  width of each slotted item
 *   --pastis-shelf-gap         space between items
 */
export class PastisShelf extends LitElement {
  static properties = {
    label:     { type: String },
    stagger:   { type: Number }, // ms between item entrance animations
    _progress: { state: true },
    _atStart:  { state: true },
    _atEnd:    { state: true },
    _dragging: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      --_inset: var(--pastis-shelf-inset, var(--layout-gutter, 24px));
      --_gap: var(--pastis-shelf-gap, 16px);
    }

    .track {
      display: flex;
      align-items: flex-end;
      gap: var(--_gap);
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scroll-snap-type: x mandatory;
      scroll-padding-inline: var(--_inset);
      padding-inline: var(--_inset);
      /* Room for the hover tilt so it isn't clipped by the scroller */
      padding-block: 48px 8px;
      scrollbar-width: none;
      cursor: grab;
    }

    .track::-webkit-scrollbar { display: none; }

    .track.dragging {
      cursor: grabbing;
      scroll-snap-type: none;
      user-select: none;
    }

    ::slotted(*) {
      flex: 0 0 var(--pastis-shelf-item-width, clamp(260px, 26vw, 380px));
      scroll-snap-align: start;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 32px;
      padding-inline: var(--_inset);
    }

    .progress {
      flex: 1;
      height: 2px;
      background: var(--border-default, #383c44);
      border-radius: var(--radius-full, 9999px);
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: var(--action-primary, #fcba28);
      transform-origin: left center;
      transition: transform var(--duration-fast, 120ms) linear;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-full, 9999px);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      background: transparent;
      color: var(--text-primary, #f9f4da);
      font-family: var(--font-family-mono, 'JetBrains Mono', monospace);
      font-size: 16px;
      cursor: pointer;
      transition:
        border-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        opacity var(--duration-fast, 120ms) var(--ease-standard, ease),
        transform var(--duration-tilt, 800ms) var(--ease-out-expo, ease);
    }

    button:hover:not(:disabled) { border-color: var(--action-primary, #fcba28); }
    button:active:not(:disabled) { transform: scale(0.92); }

    button:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.35;
      cursor: default;
    }

    @media (hover: none) {
      .track { cursor: auto; }
    }
  `;

  constructor() {
    super();
    this.label = 'Carousel';
    this.stagger = 90;
    this._progress = 0;
    this._atStart = true;
    this._atEnd = false;
    this._dragging = false;
    this._drag = null;
    this._suppressClick = false;
  }

  get _track() {
    return this.renderRoot?.querySelector('.track');
  }

  firstUpdated() {
    this._resizeObserver = new ResizeObserver(() => this._updateScrollState());
    this._resizeObserver.observe(this._track);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
  }

  _onSlotChange(e) {
    const items = e.target.assignedElements();
    // Stagger entrance animations of items that support it (e.g. pastis-project-card[reveal])
    items.forEach((item, i) => item.style.setProperty('--pastis-reveal-delay', `${i * this.stagger}ms`));
    this._updateScrollState();
  }

  _updateScrollState() {
    const track = this._track;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    this._progress = max > 0 ? track.scrollLeft / max : 1;
    this._atStart = track.scrollLeft <= 1;
    this._atEnd = track.scrollLeft >= max - 1;
  }

  _scrollByPage(direction) {
    const track = this._track;
    const item = this.querySelector(':scope > *');
    const step = item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
    // Move by as many whole items as fit, at least one
    const perPage = Math.max(1, Math.floor((track.clientWidth - 1) / step));
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * perPage * step, behavior: smooth ? 'smooth' : 'auto' });
  }

  // ── Mouse drag (touch and trackpads already scroll natively) ──
  _onPointerDown(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    this._drag = { x: e.clientX, scrollLeft: this._track.scrollLeft, moved: false };
  }

  _onPointerMove(e) {
    if (!this._drag) return;
    const dx = e.clientX - this._drag.x;
    if (!this._drag.moved && Math.abs(dx) < 5) return;
    if (!this._drag.moved) {
      this._drag.moved = true;
      this._dragging = true;
      this._track.setPointerCapture(e.pointerId);
    }
    this._track.scrollLeft = this._drag.scrollLeft - dx;
  }

  _onPointerUp() {
    if (!this._drag) return;
    const { moved, scrollLeft } = this._drag;
    this._drag = null;
    if (!moved) return;
    // The click that follows this pointerup (if any) must not navigate
    this._suppressClick = true;
    setTimeout(() => { this._suppressClick = false; }, 0);

    this._snapToNearest(this._track.scrollLeft > scrollLeft ? 1 : -1);
    // Keep snapping off until the eased scroll settles, or re-enabling it jumps
    const release = () => { this._dragging = false; };
    this._track.addEventListener('scrollend', release, { once: true });
    setTimeout(release, 700);
  }

  _snapToNearest(direction) {
    const track = this._track;
    const inset = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
    const trackLeft = track.getBoundingClientRect().left;
    const offsets = [...this.children].map((el) => el.getBoundingClientRect().left - trackLeft - inset);
    // Pick the first item past the leading edge in the drag direction
    const target = direction > 0
      ? offsets.find((o) => o > 8) ?? offsets.at(-1)
      : [...offsets].reverse().find((o) => o < -8) ?? offsets[0];
    if (target === undefined) return;
    track.scrollBy({ left: target, behavior: 'smooth' });
  }

  _onClickCapture(e) {
    if (!this._suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    return html`
      <div
        class="track ${this._dragging ? 'dragging' : ''}"
        part="track"
        role="region"
        aria-label=${this.label}
        @scroll=${this._updateScrollState}
        @pointerdown=${this._onPointerDown}
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @pointercancel=${this._onPointerUp}
        @click=${{ handleEvent: (e) => this._onClickCapture(e), capture: true }}
        @dragstart=${(e) => e.preventDefault()}
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div class="controls" part="controls">
        <div class="progress" aria-hidden="true">
          <div class="progress-bar" style="transform: scaleX(${Math.max(this._progress, 0.04)})"></div>
        </div>
        <button aria-label="Previous" ?disabled=${this._atStart} @click=${() => this._scrollByPage(-1)}>←</button>
        <button aria-label="Next" ?disabled=${this._atEnd} @click=${() => this._scrollByPage(1)}>→</button>
      </div>
    `;
  }
}

customElements.define('pastis-shelf', PastisShelf);

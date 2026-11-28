import { LitElement, html, css, nothing } from 'lit';

/** The detail pane's narrowest width, in px. */
export const DETAIL_MIN_WIDTH = 380;
/** The detail pane's widest width, as a share of the layout's width. */
export const DETAIL_MAX_RATIO = 0.6;
const STEP = 16;
const LARGE_STEP = 64;

/**
 * App layout: a desktop app's three panes, sidebar · main · detail, each filling the viewport's
 * height and scrolling on its own. Below `breakpoint` (a window width) only the main slot renders,
 * as a plain block in the page's own scroll, so a phone layout can live inside it unchanged.
 *
 * - **Landmarks:** the sidebar is in a `nav` (named by `sidebar-label`), the main slot in `main`,
 *   the detail in an `aside` (`complementary`, named by `detail-label`). Do not put another
 *   `main` inside.
 * - **Panes:** `sidebar-collapsed` removes the sidebar (`--pastis-app-layout-sidebar-width` wide
 *   otherwise); `detail-open` adds the detail pane, `detail-width` px wide, kept between 380 px and
 *   60 % of the layout's width. The main pane takes what is left.
 * - **Splitter:** the detail pane's leading edge is a focusable `role="separator"` (value: the
 *   width in px). Drag it, or use Left/Right (16 px; with Shift 64 px), Home (narrowest) and End
 *   (widest); a double click (the single-pointer way, without dragging) switches between the widest
 *   and the narrowest. The layout applies the new width itself and reports it with `pastis-resize { width }`
 *   (after each key or double click, and once at the end of a drag) for the app to remember.
 * - **Mode:** the reflected `mode` attribute is `wide` (at or above `breakpoint`) or `narrow`, from
 *   `matchMedia('(min-width: <breakpoint>px)')`; a change fires `pastis-layout-change { mode }`.
 *
 * Safe areas: each pane is padded by the `env(safe-area-inset-*)` on its outer edges. Needs
 * `<meta name="viewport" content="…, viewport-fit=cover">` for them to be non-zero.
 *
 * @slot - The main pane: the current list or view
 * @slot sidebar - Wide mode, unless `sidebar-collapsed`: the navigation (a `<pastis-sidebar>`)
 * @slot detail - Wide mode, while `detail-open`: the open item
 * @fires pastis-resize - The user resized the detail pane, detail { width } in px
 * @fires pastis-layout-change - The mode changed (the window crossed the breakpoint), detail { mode }
 * @csspart layout - The grid
 * @csspart sidebar - The `nav`
 * @csspart main - The `main`
 * @csspart detail - The `aside`
 * @csspart splitter - The separator on the detail pane's edge
 * @cssprop --pastis-app-layout-sidebar-width - The sidebar's width (default 260px)
 * @cssprop --pastis-app-layout-height - The layout's height in wide mode (default 100dvh)
 */
export class PastisAppLayout extends LitElement {
  static properties = {
    /** Hides the sidebar (wide mode). */
    sidebarCollapsed: { type: Boolean, reflect: true, attribute: 'sidebar-collapsed' },
    /** Shows the detail pane (wide mode). */
    detailOpen: { type: Boolean, reflect: true, attribute: 'detail-open' },
    /** The detail pane's width in px; kept between 380 px and 60 % of the layout's width. */
    detailWidth: { type: Number, attribute: 'detail-width' },
    /** Window width in px from which the layout is wide (default 1024). */
    breakpoint: { type: Number },
    /** Accessible name of the sidebar's `nav` (default “Sidebar”). */
    sidebarLabel: { type: String, attribute: 'sidebar-label' },
    /** Accessible name of the detail pane's `aside` (default “Details”). */
    detailLabel: { type: String, attribute: 'detail-label' },
    /** Accessible name of the splitter (default “Resize details”). */
    splitterLabel: { type: String, attribute: 'splitter-label' },
    /** `wide` or `narrow`, set by the layout from the window width (reflected; read it, do not set it). */
    mode: { type: String, reflect: true },
    _width: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      height: var(--pastis-app-layout-height, 100dvh);
      color: var(--text-primary, #f4eee3);
    }
    :host([hidden]) { display: none; }
    :host([mode="narrow"]) { height: auto; }

    .layout {
      display: grid;
      grid-template-rows: minmax(0, 1fr);
      height: 100%;
      min-height: 0;
    }
    :host([mode="narrow"]) .layout { display: block; height: auto; }

    nav, main, aside {
      box-sizing: border-box;
      min-width: 0;
      min-height: 0;
      padding-block: env(safe-area-inset-top, 0px) env(safe-area-inset-bottom, 0px);
    }

    nav {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding-inline-start: env(safe-area-inset-left, 0px);
      border-inline-end: var(--border-width, 1px) solid var(--border-subtle, #221c17);
      background: var(--bg-secondary, #16110d);
    }
    ::slotted([slot="sidebar"]) { flex: 1; min-height: 0; }

    main {
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    main.first { padding-inline-start: env(safe-area-inset-left, 0px); }
    main.last { padding-inline-end: env(safe-area-inset-right, 0px); }
    :host([mode="narrow"]) main {
      overflow: visible;
      padding-block: 0;
      padding-inline: env(safe-area-inset-left, 0px) env(safe-area-inset-right, 0px);
    }

    aside {
      position: relative;
      display: flex;
      flex-direction: column;
      padding-inline-end: env(safe-area-inset-right, 0px);
      border-inline-start: var(--border-width, 1px) solid var(--border-subtle, #221c17);
    }
    .detail {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    /* The splitter: an 8 px strip on the detail pane's leading edge; a line shows on hover and focus */
    .splitter {
      position: absolute;
      inset-block: 0;
      inset-inline-start: calc(var(--border-width, 1px) * -1);
      z-index: 1;
      width: var(--space-sm, 8px);
      cursor: col-resize;
      touch-action: none;
    }
    .splitter::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      width: calc(var(--border-width, 1px) * 2);
      background: transparent;
      transition: background var(--transition-fast, 120ms ease);
    }
    .splitter:hover::before,
    :host([data-dragging]) .splitter::before { background: var(--border-default, #3a322b); }
    .splitter:focus-visible { outline: none; }
    .splitter:focus-visible::before {
      width: calc(var(--border-width, 1px) * 3);
      background: var(--border-focus, #fcba28);
    }
    :host([data-dragging]) { cursor: col-resize; user-select: none; }

    @media (prefers-reduced-motion: reduce) {
      .splitter::before { transition: none; }
    }

    @media (forced-colors: active) {
      .splitter:focus-visible::before { background: Highlight; }
    }
  `;

  constructor() {
    super();
    this.sidebarCollapsed = false;
    this.detailOpen = false;
    this.detailWidth = 420;
    this.breakpoint = 1024;
    this._width = 0;
    this._onMediaChange = this._onMediaChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._watchMedia();
    this._resizeObserver = new ResizeObserver(entries => {
      this._width = entries[0].contentRect.width;
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unwatchMedia();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }

  willUpdate(changed) {
    if (changed.has('breakpoint') && this.hasUpdated) this._watchMedia();
  }

  /** The widest the detail pane may be now, in px. */
  get detailMaxWidth() {
    // Until the first resize observation, the window's width (no layout read while rendering)
    const width = this._width || window.innerWidth;
    return Math.max(DETAIL_MIN_WIDTH, Math.floor(width * DETAIL_MAX_RATIO));
  }

  /** `detailWidth` kept between the narrowest and widest, as the pane shows it. */
  get detailEffectiveWidth() {
    return this._clamp(Number(this.detailWidth) || DETAIL_MIN_WIDTH);
  }

  _clamp(width) {
    return Math.round(Math.min(Math.max(width, DETAIL_MIN_WIDTH), this.detailMaxWidth));
  }

  _watchMedia() {
    this._unwatchMedia();
    const breakpoint = Number.isFinite(Number(this.breakpoint)) ? Number(this.breakpoint) : 1024;
    this._media = window.matchMedia(`(min-width: ${breakpoint}px)`);
    this._media.addEventListener('change', this._onMediaChange);
    this._setMode(this._media.matches ? 'wide' : 'narrow');
  }

  _unwatchMedia() {
    this._media?.removeEventListener('change', this._onMediaChange);
    this._media = undefined;
  }

  _onMediaChange(e) {
    this._setMode(e.matches ? 'wide' : 'narrow');
  }

  _setMode(mode) {
    const previous = this.mode;
    if (previous === mode) return;
    this.mode = mode;
    if (previous === undefined) return;
    this.dispatchEvent(new CustomEvent('pastis-layout-change', {
      detail: { mode },
      bubbles: true, composed: true,
    }));
  }

  render() {
    if (this.mode !== 'wide') {
      return html`<div class="layout" part="layout"><main part="main"><slot></slot></main></div>`;
    }
    const sidebar = !this.sidebarCollapsed;
    const detail = this.detailOpen;
    const columns = [
      sidebar ? 'var(--pastis-app-layout-sidebar-width, 260px)' : '',
      'minmax(0, 1fr)',
      detail ? `${this.detailEffectiveWidth}px` : '',
    ].filter(Boolean).join(' ');
    return html`
      <div class="layout" part="layout" style="grid-template-columns: ${columns}">
        ${sidebar ? html`
          <nav part="sidebar" aria-label=${this.sidebarLabel || 'Sidebar'}><slot name="sidebar"></slot></nav>
        ` : nothing}
        <main part="main" class="${sidebar ? '' : 'first'} ${detail ? '' : 'last'}"><slot></slot></main>
        ${detail ? html`
          <aside id="detail" part="detail" aria-label=${this.detailLabel || 'Details'}>
            <div
              class="splitter"
              part="splitter"
              role="separator"
              tabindex="0"
              aria-orientation="vertical"
              aria-label=${this.splitterLabel || 'Resize details'}
              aria-controls="detail"
              aria-valuenow=${this.detailEffectiveWidth}
              aria-valuemin=${DETAIL_MIN_WIDTH}
              aria-valuemax=${this.detailMaxWidth}
              @keydown=${this._onSplitterKeydown}
              @dblclick=${this._onSplitterDoubleClick}
              @pointerdown=${this._onPointerDown}
              @pointermove=${this._onPointerMove}
              @pointerup=${this._onPointerUp}
              @pointercancel=${this._onPointerUp}
              @lostpointercapture=${this._onPointerUp}
            ></div>
            <div class="detail"><slot name="detail"></slot></div>
          </aside>
        ` : nothing}
      </div>
    `;
  }

  _resize(width) {
    const next = this._clamp(width);
    const changed = next !== this.detailEffectiveWidth;
    this.detailWidth = next;
    return changed;
  }

  _emitResize() {
    this.dispatchEvent(new CustomEvent('pastis-resize', {
      detail: { width: this.detailEffectiveWidth },
      bubbles: true, composed: true,
    }));
  }

  // The splitter is on the pane's leading edge: Left widens the pane, Right narrows it
  _onSplitterKeydown(e) {
    const step = e.shiftKey ? LARGE_STEP : STEP;
    const current = this.detailEffectiveWidth;
    let width;
    if (e.key === 'ArrowLeft') width = current + step;
    else if (e.key === 'ArrowRight') width = current - step;
    else if (e.key === 'Home') width = DETAIL_MIN_WIDTH;
    else if (e.key === 'End') width = this.detailMaxWidth;
    else return;
    e.preventDefault();
    if (this._resize(width)) this._emitResize();
  }

  _onSplitterDoubleClick() {
    const max = this.detailMaxWidth;
    if (this._resize(this.detailEffectiveWidth >= max ? DETAIL_MIN_WIDTH : max)) this._emitResize();
  }

  _onPointerDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // A pointer that is no longer active (or a synthetic one) cannot be captured
    }
    this._drag = { x: e.clientX, width: this.detailEffectiveWidth };
    this.toggleAttribute('data-dragging', true);
  }

  _onPointerMove(e) {
    if (!this._drag) return;
    this._resize(this._drag.width + (this._drag.x - e.clientX));
  }

  _onPointerUp() {
    if (!this._drag) return;
    const start = this._drag.width;
    this._drag = undefined;
    this.removeAttribute('data-dragging');
    if (this.detailEffectiveWidth !== start) this._emitResize();
  }
}

customElements.define('pastis-app-layout', PastisAppLayout);

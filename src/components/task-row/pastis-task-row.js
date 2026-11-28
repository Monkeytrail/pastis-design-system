import { LitElement, html, css, nothing } from 'lit';
import '../icon/pastis-icon.js';
import '../tag/pastis-tag.js';

const PRIORITY_NAMES = ['', 'low', 'medium', 'high'];

/** Accessible name of a task without a title. */
const UNTITLED = 'Untitled task';

/**
 * A row in a list of tasks: a round completion toggle, the title, a meta line and optional
 * actions.
 *
 * The host has `role="listitem"`, so render the rows inside an element with `role="list"`
 * (or a `<ul>`/`<ol>`).
 *
 * - **Toggle:** a round `role="checkbox"` control named “Complete <title>” (`toggle-label`
 *   overrides it). Click or Space toggles it. It fires a cancelable `pastis-toggle`; `done` only
 *   changes when the event is not cancelled, so an app can keep the row controlled (cancel it and
 *   set `done` itself).
 * - **Title:** a button, the row's main action (e.g. open the detail); fires `pastis-open`. The
 *   text is the `taskTitle` property, attribute `task-title`: the global `title` attribute is the
 *   browser's tooltip, so the row does not use it. Shown as written, wraps to two lines, then an
 *   ellipsis. An empty title is named “Untitled task” (toggle: “Complete Untitled task”), so
 *   both controls always have a name.
 * - **Meta line:** shown when any of `due`, `overdue`, `repeats`, `flagged`, `priority`,
 *   `subtasks` or `tags` is set. It is visual only (`aria-hidden`): the same facts, in words
 *   (“Overdue: Yesterday”, “Repeats”, “Flagged”, “Priority high”, “Subtasks 2/5”,
 *   “Tags: errands, groceries”), are the title button's accessible description, so a screen
 *   reader hears “Buy oat milk, button, Today 14:00, Flagged” once.
 *
 * Keyboard order: toggle, title, then the slotted actions.
 *
 * - **Compact density** (`density="compact"`, for desktop lists): one line of about 32 px:
 *   toggle · title (one line, ellipsis) · the `meta` slot · actions. The `meta` slot's elements
 *   are cells of a CSS grid whose tracks come from `--pastis-task-row-columns`; set it once on the
 *   list (e.g. `[status] 5rem [due] 7rem [list] 8rem`) and every row's cells line up. A cell goes
 *   to a named track with `grid-column` (`<span slot="meta" style="grid-column: due">`), else to
 *   the next one; a cell's overflow ends in an ellipsis. Slotted cells replace the built-in
 *   visible meta (without them, the built-in meta shows on the same line as the title); the meta
 *   properties still make the title's description, so mark the cells `aria-hidden="true"` when
 *   they repeat it. The actions appear on hover and while focus is inside the row (always on
 *   touch screens without hover), over the meta cells; they stay in the Tab order.
 * - **Selected** (`selected`): a highlighted background with an accent bar, for the row whose
 *   details are open. Styling only: a `listitem` takes no `aria-selected`, so mark the current
 *   item in words where it matters (the detail pane's heading names it).
 *
 * @fires pastis-toggle - The user toggled completion, detail { done } (the new value). Cancelable:
 *   `preventDefault()` keeps `done` unchanged.
 * @fires pastis-open - The user activated the title
 * @slot actions - Buttons for the row (Rename, Delete), after the title. Compact: shown on hover
 *   and focus-within
 * @slot meta - Compact density only: the cells of the aligned meta columns
 * @csspart row - The row container
 * @csspart toggle - The completion toggle (the 44 × 44 px target)
 * @csspart circle - The visible circle inside the toggle
 * @csspart title - The title button
 * @csspart meta - The meta line
 * @csspart actions - The wrapper of the actions slot
 * @csspart columns - Compact density: the grid of meta cells
 * @cssprop --pastis-task-row-columns - Compact density: the meta cells' grid tracks
 *   (`grid-template-columns`), set on the list so rows align. Default: one auto track per cell
 * @cssprop --pastis-task-row-column-gap - Compact density: the gap between meta cells (default `--space-md`)
 */
export class PastisTaskRow extends LitElement {
  static properties = {
    /** The task's title text (attribute `task-title`; not the global `title` tooltip). */
    taskTitle: { type: String, attribute: 'task-title' },
    /** Completed: the circle is filled with a check and the title is struck through. */
    done: { type: Boolean, reflect: true },
    /** Accessible name of the toggle (default “Complete <title>”). */
    toggleLabel: { type: String, attribute: 'toggle-label' },
    /** Due date and time, formatted by the app (e.g. “Today 14:00”). */
    due: { type: String },
    /** Overdue: the due date shows in the error colour with the `alert` icon. */
    overdue: { type: Boolean, reflect: true },
    /** Repeats: shows the `repeat` icon (“Repeats” for screen readers). */
    repeats: { type: Boolean, reflect: true },
    /** Flagged: shows the `flag` icon (“Flagged” for screen readers). */
    flagged: { type: Boolean, reflect: true },
    /** Priority 0 (none) to 3: shown as `!`, `!!`, `!!!` (“Priority low/medium/high”). */
    priority: { type: Number, reflect: true },
    /** Subtask progress, formatted by the app (e.g. “2/5”). */
    subtasks: { type: String },
    /** Tags, shown as small chips. As an attribute, a JSON array. */
    tags: { type: Array },
    /** A subtask: indented one level. */
    indent: { type: Boolean, reflect: true },
    /** Disables the toggle and the title. */
    disabled: { type: Boolean, reflect: true },
    /**
     * Shows a reorder handle (part `handle`) at the end of the row, for `<pastis-sortable>`:
     * drag it, tap it to pick the row up, or use the arrow keys on it.
     */
    reorderable: { type: Boolean, reflect: true },
    /** The handle's accessible name (default “Reorder <title>”). */
    reorderLabel: { type: String, attribute: 'reorder-label' },
    /** `compact`: one line with aligned meta columns and hover actions (desktop lists). Unset: the default row. */
    density: { type: String, reflect: true },
    /** The selected row (its details are open): highlighted background. Styling only, no `aria-selected`. */
    selected: { type: Boolean, reflect: true },
    _hasMeta: { state: true },
    _hasActions: { state: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }

    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--space-xs, 4px);
      padding-block: var(--space-xs, 4px);
      padding-inline-end: var(--space-sm, 8px);
      border-bottom: var(--border-width, 1px) solid var(--border-subtle, #221c17);
      font-family: var(--font-family-body, sans-serif);
      color: var(--text-primary, #f4eee3);
    }

    :host([indent]) .row { padding-inline-start: var(--space-xl, 32px); }

    /* ── Toggle: a 44 × 44 px target around a 20 px circle ── */
    .toggle {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: var(--radius-full, 9999px);
      background: none;
      color: inherit;
      cursor: pointer;
    }

    /* ── Reorder handle (with <pastis-sortable>): 44 × 44 px, never scrolls the page on touch ── */
    .handle {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: var(--radius-md, 6px);
      background: none;
      color: var(--text-tertiary, #a39b90);
      cursor: grab;
      touch-action: none;
    }

    .handle:hover:not(:disabled) { color: var(--text-primary, #f4eee3); }

    .handle:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -2px;
    }

    .handle:disabled { cursor: not-allowed; opacity: 0.4; }

    :host([data-picked]) .handle {
      color: var(--action-primary-text, #0d0d0d);
      background: var(--action-primary, #fcba28);
    }

    .circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(var(--space-md, 16px) + var(--space-xs, 4px));
      height: calc(var(--space-md, 16px) + var(--space-xs, 4px));
      border: calc(var(--border-width, 1px) * 2) solid var(--text-tertiary, #a39b90);
      border-radius: var(--radius-full, 9999px);
      color: var(--action-primary-text, #0d0d0d);
      transition: background var(--transition-fast, 120ms ease), border-color var(--transition-fast, 120ms ease);
    }

    .circle pastis-icon { --pastis-icon-size: calc(var(--space-sm, 8px) * 1.5); }

    .toggle:hover .circle { border-color: var(--action-primary, #fcba28); }

    :host([done]) .circle {
      background: var(--action-primary, #fcba28);
      border-color: var(--action-primary, #fcba28);
    }

    .toggle:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -2px;
    }

    /* ── Title and meta ── */
    .body {
      position: relative;
      flex: 1;
      min-width: 0;
      min-height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-block: var(--space-xs, 4px);
    }

    .title {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: var(--radius-xs, 2px);
      background: none;
      font: inherit;
      font-size: var(--font-size-body, 16px);
      line-height: var(--line-height-h4, 1.3);
      text-align: start;
      text-transform: none;
      color: var(--text-primary, #f4eee3);
      cursor: pointer;
    }

    /* The whole body (title and meta) is the title's click target */
    .title::after {
      content: '';
      position: absolute;
      inset: 0;
    }

    .title:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .title-text {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      overflow: hidden;
      overflow-wrap: anywhere;
    }

    :host([done]) .title { color: var(--text-tertiary, #a39b90); }
    :host([done]) .title-text { text-decoration: line-through; }

    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-xs, 4px) var(--space-sm, 8px);
      font-size: var(--font-size-caption, 12px);
      line-height: var(--line-height-caption, 1.4);
      color: var(--text-tertiary, #a39b90);
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs, 4px);
    }

    .meta-item.overdue { color: var(--text-error, #f45f6b); }
    .meta-item.flagged,
    .meta-item.priority { color: var(--text-accent, #fcba28); }
    .meta-item.priority { font-weight: var(--font-weight-bold, 700); }
    .meta-item.tags { flex-wrap: wrap; }

    .tags pastis-tag::part(tag) {
      text-transform: none;
      letter-spacing: normal;
    }

    /* ── Actions ── */
    .actions {
      flex: none;
      display: flex;
      align-items: center;
      align-self: center;
      gap: var(--space-xs, 4px);
    }

    /* ── Disabled ── */
    button:disabled { cursor: not-allowed; }
    :host([disabled]) .title { color: var(--text-disabled, #4a4139); }
    :host([disabled]) .circle { border-color: var(--text-disabled, #4a4139); }
    :host([disabled][done]) .circle { background: var(--text-disabled, #4a4139); }
    :host([disabled]) .toggle:hover .circle { border-color: var(--text-disabled, #4a4139); }

    /* ── Selected ── */
    :host([selected]) .row {
      background: var(--bg-elevated, #251f1a);
      box-shadow: inset calc(var(--border-width, 1px) * 2) 0 0 var(--action-primary, #fcba28);
    }

    /* ── Compact density: one line, aligned meta columns, hover actions ── */
    .row.compact {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-auto-columns: auto;
      align-items: center;
      gap: 0 var(--space-sm, 8px);
      padding-block: 0;
    }
    .row.compact:hover { background: var(--bg-card, #1b1612); }
    :host([selected]) .row.compact,
    :host([selected]) .row.compact:hover { background: var(--bg-elevated, #251f1a); }

    .compact .toggle,
    .compact .handle {
      width: var(--space-xl, 32px);
      height: var(--space-xl, 32px);
    }
    .compact .circle {
      width: var(--space-md, 16px);
      height: var(--space-md, 16px);
    }

    .compact .body {
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: var(--space-sm, 8px);
      min-height: var(--space-xl, 32px);
      padding-block: 0;
    }
    .compact .title {
      flex: 0 1 auto;
      width: auto;
      min-width: 0;
      font-size: var(--font-size-body-sm, 14px);
      line-height: var(--line-height-body-sm, 1.5);
    }
    .compact .title-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .compact .meta {
      flex: none;
      flex-wrap: nowrap;
      white-space: nowrap;
    }
    .compact .meta.slotted { display: none; }

    .trail { display: grid; align-items: center; min-width: 0; }
    .trail > * { grid-area: 1 / 1; }

    .columns {
      display: grid;
      grid-template-columns: var(--pastis-task-row-columns, none);
      grid-auto-flow: column;
      grid-auto-columns: auto;
      align-items: center;
      column-gap: var(--pastis-task-row-column-gap, var(--space-md, 16px));
      min-width: 0;
      font-size: var(--font-size-caption, 12px);
      line-height: var(--line-height-caption, 1.4);
      color: var(--text-tertiary, #a39b90);
    }
    ::slotted([slot="meta"]) {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .compact .actions {
      justify-self: end;
      opacity: 0;
      pointer-events: none;
    }
    :host(:hover) .compact .actions,
    :host(:focus-within) .compact .actions {
      opacity: 1;
      pointer-events: auto;
    }
    :host(:hover) .compact.with-actions .columns,
    :host(:focus-within) .compact.with-actions .columns { visibility: hidden; }

    @media (hover: none) {
      .compact .actions { opacity: 1; pointer-events: auto; }
      .compact.with-actions .columns { visibility: hidden; }
    }

    @media (forced-colors: active) {
      :host([done]) .circle { background: CanvasText; border-color: CanvasText; color: Canvas; }
      :host([selected]) .row { outline: 2px solid Highlight; outline-offset: -2px; }
    }
  `;

  constructor() {
    super();
    this.taskTitle = '';
    this.done = false;
    this.overdue = false;
    this.repeats = false;
    this.flagged = false;
    this.priority = 0;
    this.tags = [];
    this.indent = false;
    this.disabled = false;
    this.reorderable = false;
    this.selected = false;
    this._hasMeta = false;
    this._hasActions = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  /** The meta line's items in display order: the visible part and the text read for it. */
  _metaItems() {
    const items = [];
    if (this.due || this.overdue) {
      items.push({
        text: this.overdue ? (this.due ? `Overdue: ${this.due}` : 'Overdue') : this.due,
        view: html`<span class="meta-item due ${this.overdue ? 'overdue' : ''}">
          <pastis-icon name=${this.overdue ? 'alert' : 'clock'} size="sm"></pastis-icon>
          <span>${this.due || 'Overdue'}</span>
        </span>`,
      });
    }
    if (this.repeats) {
      items.push({
        text: 'Repeats',
        view: html`<span class="meta-item repeats"><pastis-icon name="repeat" size="sm"></pastis-icon></span>`,
      });
    }
    if (this.flagged) {
      items.push({
        text: 'Flagged',
        view: html`<span class="meta-item flagged"><pastis-icon name="flag" size="sm"></pastis-icon></span>`,
      });
    }
    const priority = Math.trunc(Number(this.priority));
    if (priority >= 1 && priority <= 3) {
      items.push({
        text: `Priority ${PRIORITY_NAMES[priority]}`,
        view: html`<span class="meta-item priority">${'!'.repeat(priority)}</span>`,
      });
    }
    if (this.subtasks) {
      items.push({
        text: `Subtasks ${this.subtasks}`,
        view: html`<span class="meta-item subtasks">
          <pastis-icon name="subtasks" size="sm"></pastis-icon><span>${this.subtasks}</span>
        </span>`,
      });
    }
    const tags = Array.isArray(this.tags) ? this.tags.filter(Boolean).map(String) : [];
    if (tags.length) {
      items.push({
        text: `Tags: ${tags.join(', ')}`,
        view: html`<span class="meta-item tags">
          ${tags.map(tag => html`<pastis-tag size="sm">${tag}</pastis-tag>`)}
        </span>`,
      });
    }
    return items;
  }

  render() {
    if (this.density === 'compact') return this._renderCompact();
    const meta = this._metaItems();
    const hasTitle = Boolean(String(this.taskTitle ?? '').trim());
    const name = hasTitle ? this.taskTitle : UNTITLED;
    return html`
      <div class="row" part="row">
        <button
          class="toggle"
          part="toggle"
          type="button"
          role="checkbox"
          aria-checked=${this.done ? 'true' : 'false'}
          aria-label=${this.toggleLabel || `Complete ${name}`}
          ?disabled=${this.disabled}
          @click=${this._onToggle}
          @keydown=${this._onToggleKeydown}
        >
          <span class="circle" part="circle">
            ${this.done ? html`<pastis-icon name="check"></pastis-icon>` : nothing}
          </span>
        </button>
        <div class="body">
          <button
            class="title"
            part="title"
            type="button"
            aria-label=${hasTitle ? nothing : UNTITLED}
            aria-describedby=${meta.length ? 'description' : nothing}
            ?disabled=${this.disabled}
            @click=${this._onOpen}
          ><span class="title-text">${this.taskTitle}</span></button>
          ${meta.length ? html`
            <div class="meta" part="meta" aria-hidden="true">${meta.map(item => item.view)}</div>
            <span id="description" hidden>${meta.map(item => item.text).join(', ')}</span>
          ` : nothing}
        </div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
        ${this.reorderable ? html`
          <button
            class="handle"
            part="handle"
            type="button"
            aria-label=${this.reorderLabel || `Reorder ${name}`}
            ?disabled=${this.disabled}
          ><pastis-icon name="grip"></pastis-icon></button>
        ` : nothing}
      </div>
    `;
  }

  /** Compact density: one line, the meta slot's cells in aligned columns, actions on hover. */
  _renderCompact() {
    const meta = this._metaItems();
    const hasTitle = Boolean(String(this.taskTitle ?? '').trim());
    const name = hasTitle ? this.taskTitle : UNTITLED;
    return html`
      <div class="row compact ${this._hasActions ? 'with-actions' : ''}" part="row">
        <button
          class="toggle"
          part="toggle"
          type="button"
          role="checkbox"
          aria-checked=${this.done ? 'true' : 'false'}
          aria-label=${this.toggleLabel || `Complete ${name}`}
          ?disabled=${this.disabled}
          @click=${this._onToggle}
          @keydown=${this._onToggleKeydown}
        >
          <span class="circle" part="circle">
            ${this.done ? html`<pastis-icon name="check"></pastis-icon>` : nothing}
          </span>
        </button>
        <div class="body">
          <button
            class="title"
            part="title"
            type="button"
            aria-label=${hasTitle ? nothing : UNTITLED}
            aria-describedby=${meta.length ? 'description' : nothing}
            ?disabled=${this.disabled}
            @click=${this._onOpen}
          ><span class="title-text">${this.taskTitle}</span></button>
          ${meta.length ? html`
            <div class="meta ${this._hasMeta ? 'slotted' : ''}" part="meta" aria-hidden="true">${meta.map(item => item.view)}</div>
            <span id="description" hidden>${meta.map(item => item.text).join(', ')}</span>
          ` : nothing}
        </div>
        <div class="trail">
          <div class="columns" part="columns"><slot name="meta" @slotchange=${this._onMetaSlotChange}></slot></div>
          <div class="actions" part="actions"><slot name="actions" @slotchange=${this._onActionsSlotChange}></slot></div>
        </div>
        ${this.reorderable ? html`
          <button
            class="handle"
            part="handle"
            type="button"
            aria-label=${this.reorderLabel || `Reorder ${name}`}
            ?disabled=${this.disabled}
          ><pastis-icon name="grip"></pastis-icon></button>
        ` : nothing}
      </div>
    `;
  }

  _onMetaSlotChange(e) {
    this._hasMeta = e.target.assignedElements().length > 0;
  }

  _onActionsSlotChange(e) {
    this._hasActions = e.target.assignedElements().length > 0;
  }

  // A checkbox toggles with Space only; a native button would also click on Enter
  _onToggleKeydown(e) {
    if (e.key === 'Enter') e.preventDefault();
  }

  _onToggle() {
    if (this.disabled) return;
    const done = !this.done;
    const event = new CustomEvent('pastis-toggle', {
      detail: { done },
      bubbles: true, composed: true, cancelable: true,
    });
    if (this.dispatchEvent(event)) this.done = done;
  }

  _onOpen() {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent('pastis-open', { bubbles: true, composed: true }));
  }
}

customElements.define('pastis-task-row', PastisTaskRow);

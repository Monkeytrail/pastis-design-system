import { LitElement, html, css, nothing } from 'lit';

let nextId = 0;

const FREQS = [
  ['', 'Never'],
  ['daily', 'Daily'],
  ['weekly', 'Weekly'],
  ['monthly', 'Monthly'],
  ['yearly', 'Yearly'],
];
const UNITS = { daily: ['day', 'days'], weekly: ['week', 'weeks'], monthly: ['month', 'months'], yearly: ['year', 'years'] };
const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const MAX_INTERVAL = 99;

/** A value with every field present and in range; `null` stays `null`. */
function normalise(value) {
  if (!value || !UNITS[value.freq]) return null;
  const interval = Math.min(MAX_INTERVAL, Math.max(1, Math.trunc(Number(value.interval)) || 1));
  const byDay = WEEKDAYS.filter(d => Array.isArray(value.byDay) && value.byDay.includes(d));
  return {
    freq: value.freq,
    interval,
    byDay,
    mode: value.mode === 'completion' ? 'completion' : 'schedule',
    until: typeof value.until === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.until) ? value.until : null,
  };
}

/**
 * Recurrence picker: how a task repeats. A frequency (Never, Daily, Weekly, Monthly, Yearly),
 * “every n”, the weekdays (weekly, on schedule), whether the next one counts from the schedule
 * or from completion, and an end (never, or a date).
 *
 * - **Value:** `null` (does not repeat) or `{ freq, interval, byDay, mode, until }`:
 *   `freq` `daily|weekly|monthly|yearly`, `interval` 1–99, `byDay` weekday codes
 *   (`MO`…`SU`, Monday first; empty means the due's own weekday), `mode` `schedule|completion`,
 *   `until` `YYYY-MM-DD` or `null`. The app turns it into an RRULE; the picker does no date maths.
 * - **Events:** `pastis-change` with `detail { value }` whenever the user changes something
 *   (the interval on commit). The picker shows its own change at once; set `value` to override.
 * - **Accessible:** each part is a native radio or checkbox group in a fieldset with a legend, so
 *   arrow keys move within a group. The frequency group is named by `label`.
 *
 * @fires pastis-change - On every change, detail { value }
 * @csspart group - Each group of choices
 */
export class PastisRecurrencePicker extends LitElement {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    /** The frequency group's name (default “Repeat”). */
    label: { type: String },
    /** `null` or `{ freq, interval, byDay, mode, until }`. As an attribute, JSON. */
    value: { type: Object },
    /** Weekday names for Monday to Sunday (default Mon…Sun). As an attribute, a JSON array. */
    weekdayLabels: { type: Array, attribute: 'weekday-labels' },
    /** Helper text below the picker (e.g. a summary, or why it is disabled). */
    helper: { type: String },
    /** Disables every control. */
    disabled: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }

    .picker {
      display: flex;
      flex-direction: column;
      gap: var(--space-md, 16px);
      font-family: var(--font-family-mono, monospace);
    }

    fieldset {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-sm, 8px);
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;
    }

    legend {
      width: 100%;
      padding: 0;
      margin-bottom: var(--space-sm, 8px);
      font-size: var(--font-size-micro, 11px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-transform: uppercase;
      color: var(--text-primary, #f4eee3);
    }

    .choice { position: relative; display: inline-flex; }

    /* The native control stays in the tree (1 px clip), the label is the visible chip */
    .choice input {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: 0;
      opacity: 0;
      clip-path: inset(50%);
    }

    .choice span {
      display: inline-flex;
      align-items: center;
      min-height: var(--space-xl, 32px);
      padding: 0 calc(var(--space-sm, 8px) * 1.5);
      border: var(--border-width, 1px) solid var(--border-default, #3a322b);
      border-radius: var(--radius-full, 9999px);
      background: var(--bg-card, #1b1612);
      color: var(--text-secondary, #e6dfd2);
      font-size: var(--font-size-caption, 12px);
      font-weight: var(--font-weight-bold, 700);
      white-space: nowrap;
      cursor: pointer;
      transition: border-color var(--transition-fast, 120ms ease);
    }

    .choice span:hover { border-color: var(--action-primary, #fcba28); }

    .choice input:checked + span {
      background: var(--action-primary, #fcba28);
      border-color: var(--action-primary, #fcba28);
      color: var(--action-primary-text, #0d0d0d);
    }

    .choice input:focus-visible + span {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .choice input:disabled + span { opacity: 0.4; cursor: not-allowed; }

    .every {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm, 8px);
      font-size: var(--font-size-body-sm, 14px);
      color: var(--text-secondary, #e6dfd2);
    }

    input[type='number'], input[type='date'] {
      box-sizing: border-box;
      min-height: var(--space-xl, 32px);
      padding: 0 var(--space-sm, 8px);
      font: inherit;
      font-size: var(--font-size-body-sm, 14px);
      font-weight: var(--font-weight-bold, 700);
      color: var(--text-secondary, #e6dfd2);
      background: var(--bg-primary, #110d0a);
      border: var(--border-width, 1px) solid var(--border-default, #3a322b);
      border-radius: var(--radius-md, 6px);
      color-scheme: var(--color-scheme, dark);
    }

    input[type='number'] { width: 4.5em; }

    input[type='number']:focus-visible, input[type='date']:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    input:disabled { opacity: 0.4; cursor: not-allowed; }

    .helper {
      margin: 0;
      font-size: var(--font-size-micro, 11px);
      line-height: var(--line-height-caption, 1.4);
      color: var(--text-tertiary, #a39b90);
    }

    /* 44 px targets on touch screens */
    @media (pointer: coarse) {
      .choice span, input[type='number'], input[type='date'] {
        min-height: calc(var(--space-2xl, 48px) - var(--space-xs, 4px));
      }
    }

    @media (forced-colors: active) {
      .choice input:checked + span { background: Highlight; color: HighlightText; border-color: Highlight; }
    }
  `;

  constructor() {
    super();
    this.value = null;
    this.disabled = false;
    this._id = `pastis-recurrence-${++nextId}`;
  }

  _labels() {
    const labels = Array.isArray(this.weekdayLabels) && this.weekdayLabels.length === 7
      ? this.weekdayLabels
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels;
  }

  /** A radio or checkbox chip. */
  _choice({ type, name, checked, label, onChange, value = '' }) {
    return html`
      <label class="choice">
        <input
          type=${type}
          name=${name}
          .value=${value}
          .checked=${checked}
          ?disabled=${this.disabled}
          @change=${onChange}
        /><span>${label}</span>
      </label>
    `;
  }

  render() {
    const id = this._id;
    const value = normalise(this.value);
    const freq = value?.freq ?? '';
    const units = value ? UNITS[value.freq] : null;
    const weekdayLabels = this._labels();
    return html`
      <div class="picker">
        <!-- aria-label on each fieldset: Chrome would name it by the uppercased legend -->
        <fieldset part="group" aria-label=${this.label || 'Repeat'}>
          <legend>${this.label || 'Repeat'}</legend>
          ${FREQS.map(([code, name]) => this._choice({
            type: 'radio',
            name: `${id}-freq`,
            value: code,
            checked: freq === code,
            label: name,
            onChange: () => this._setFreq(code),
          }))}
        </fieldset>
        ${value ? html`
          <div class="every">
            <label for="${id}-interval">Every</label>
            <input
              id="${id}-interval"
              type="number"
              min="1"
              max="${MAX_INTERVAL}"
              inputmode="numeric"
              .value=${String(value.interval)}
              aria-describedby="${id}-unit"
              ?disabled=${this.disabled}
              @change=${this._onInterval}
            />
            <span id="${id}-unit">${value.interval === 1 ? units[0] : units[1]}</span>
          </div>
          <fieldset part="group" aria-label="Next one counts from">
            <legend>Next one counts from</legend>
            ${this._choice({ type: 'radio', name: `${id}-mode`, value: 'schedule', checked: value.mode === 'schedule', label: 'The schedule', onChange: () => this._update({ mode: 'schedule' }) })}
            ${this._choice({ type: 'radio', name: `${id}-mode`, value: 'completion', checked: value.mode === 'completion', label: 'Completion', onChange: () => this._update({ mode: 'completion' }) })}
          </fieldset>
          ${value.freq === 'weekly' && value.mode === 'schedule' ? html`
            <fieldset part="group" aria-label="On">
              <legend>On</legend>
              ${WEEKDAYS.map((code, i) => this._choice({
                type: 'checkbox',
                name: `${id}-day`,
                value: code,
                checked: value.byDay.includes(code),
                label: weekdayLabels[i],
                onChange: (e) => this._toggleDay(code, e.target.checked),
              }))}
            </fieldset>
          ` : nothing}
          <fieldset part="group" aria-label="Ends">
            <legend>Ends</legend>
            ${this._choice({ type: 'radio', name: `${id}-end`, value: 'never', checked: value.until === null, label: 'Never', onChange: () => this._update({ until: null }) })}
            ${this._choice({ type: 'radio', name: `${id}-end`, value: 'on', checked: value.until !== null, label: 'On a date', onChange: () => this._endOn() })}
            ${value.until !== null ? html`
              <input
                type="date"
                aria-label="End date"
                .value=${value.until}
                ?disabled=${this.disabled}
                @change=${this._onUntil}
              />
            ` : nothing}
          </fieldset>
        ` : nothing}
        ${this.helper ? html`<p class="helper">${this.helper}</p>` : nothing}
      </div>
    `;
  }

  _emit(value) {
    this.value = value;
    this.dispatchEvent(new CustomEvent('pastis-change', {
      detail: { value }, bubbles: true, composed: true,
    }));
  }

  _update(change) {
    const current = normalise(this.value);
    if (!current) return;
    this._emit(normalise({ ...current, ...change }));
  }

  _setFreq(code) {
    if (!code) {
      this._emit(null);
      return;
    }
    const current = normalise(this.value);
    this._emit(normalise({
      interval: 1, byDay: [], mode: 'schedule', until: null,
      ...current,
      freq: code,
      // Weekdays only mean something for weekly
      ...(code === 'weekly' ? {} : { byDay: [] }),
    }));
  }

  _onInterval(e) {
    const interval = Math.min(MAX_INTERVAL, Math.max(1, Math.trunc(Number(e.target.value)) || 1));
    e.target.value = String(interval);
    this._update({ interval });
  }

  _toggleDay(code, checked) {
    const current = normalise(this.value);
    if (!current) return;
    const byDay = checked ? [...current.byDay, code] : current.byDay.filter(d => d !== code);
    this._update({ byDay });
  }

  /** “On a date” starts with the date four weeks from today, in the browser's calendar. */
  _endOn() {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    const until = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this._update({ until });
  }

  _onUntil(e) {
    // An emptied date field is not an end: keep the last one
    if (!e.target.value) {
      e.target.value = normalise(this.value)?.until ?? '';
      return;
    }
    this._update({ until: e.target.value });
  }
}

customElements.define('pastis-recurrence-picker', PastisRecurrencePicker);

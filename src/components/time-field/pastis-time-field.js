import { PastisDateTimeFieldBase } from '../date-field/pastis-date-time-field-base.js';

/**
 * Time field: a native `<input type="time">` (the platform's own picker) with a label, helper
 * and error text, quick-pick chips and a clear button. Everything works as in
 * `<pastis-date-field>`; only the value differs.
 *
 * - **Value:** `HH:MM` on a 24-hour clock (`HH:MM:SS` when `step` allows seconds), or `''` for no
 *   time. An invalid value becomes `''`. `min` and `max` take the same format. How the time is
 *   shown (12 or 24 hour) follows the browser's locale; the value is always 24-hour.
 * - **Chips:** e.g. `[{ label: '09:00', value: '09:00' }, …]`.
 *
 * @fires pastis-input - On every edit, chip click or clear, detail { value }
 * @fires pastis-change - On commit, chip click or clear, detail { value }
 * @csspart input - The native <input type="time">
 * @csspart clear - The clear button
 * @csspart chips - The chips' group
 * @csspart chip - Each chip button
 * @cssprop --color-scheme - Colour scheme of the native picker (`dark` or `light`; a theme token)
 */
export class PastisTimeField extends PastisDateTimeFieldBase {
  static inputType = 'time';

  static properties = {
    ...PastisDateTimeFieldBase.properties,
    /** Step in seconds (the native input's `step`), e.g. `900` for quarter hours. Default 60. */
    step: { type: Number },
  };

  _inputAttributes() {
    return { step: this.step };
  }
}

customElements.define('pastis-time-field', PastisTimeField);

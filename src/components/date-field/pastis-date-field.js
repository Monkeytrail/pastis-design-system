import { PastisDateTimeFieldBase } from './pastis-date-time-field-base.js';

/**
 * Date field: a native `<input type="date">` (the platform's own picker, iOS's wheel included)
 * with a label, helper and error text, quick-pick chips and a clear button.
 *
 * - **Value:** `YYYY-MM-DD`, or `''` for no date. An invalid value becomes `''`, as on the native
 *   input. `min` and `max` take the same format.
 * - **Form-associated:** the value is part of the owning form's data under `name`; it takes part
 *   in validation (`required`, `min`, `max`, a partly typed date), resets with the form, is
 *   disabled by a disabled `<fieldset>` and restored by the browser. Enter in the input submits
 *   the form, through its default button when it has one.
 * - **Chips:** `chips` is an array of `{ label, value }` shown as buttons below the field
 *   (`value` a date, or `''` for “No date”). The app computes the dates. The chip matching the
 *   value is pressed (`aria-pressed`). Clicking a chip sets the value and fires `pastis-input`
 *   and `pastis-change`; clicking the pressed chip does nothing.
 * - **Clear:** unless `required`, a clear button (“Clear <label>”) empties a field with a value
 *   and fires both events; focus moves to the input.
 *
 * @fires pastis-input - On every edit, chip click or clear, detail { value }
 * @fires pastis-change - On commit, chip click or clear, detail { value }
 * @csspart input - The native <input type="date">
 * @csspart clear - The clear button
 * @csspart chips - The chips' group
 * @csspart chip - Each chip button
 * @cssprop --color-scheme - Colour scheme of the native picker (`dark` or `light`; a theme token)
 */
export class PastisDateField extends PastisDateTimeFieldBase {
  static inputType = 'date';
}

customElements.define('pastis-date-field', PastisDateField);

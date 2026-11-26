import { expect } from 'storybook/test';
import './pastis-date-field.js';
import '../button/pastis-button.js';

/** Escapes text for a double-quoted attribute. */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** `YYYY-MM-DD` of a local date. */
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const today = new Date();

/** The app computes the chips' dates; next week is next Monday (never today). */
const dueChips = [
  { label: 'Today', value: iso(today) },
  { label: 'Tomorrow', value: iso(addDays(today, 1)) },
  { label: 'Next week', value: iso(addDays(today, ((8 - today.getDay()) % 7) || 7)) },
  { label: 'No date', value: '' },
];

/** Renders one field from args; chips are set as a property. */
function field(args) {
  const wrap = document.createElement('div');
  wrap.style.maxWidth = '360px';
  wrap.innerHTML = `
    <pastis-date-field
      label="${esc(args.label ?? '')}"
      ${args.value ? `value="${esc(args.value)}"` : ''}
      ${args.min ? `min="${esc(args.min)}"` : ''}
      ${args.max ? `max="${esc(args.max)}"` : ''}
      ${args.helper ? `helper="${esc(args.helper)}"` : ''}
      ${args.error ? `error="${esc(args.error)}"` : ''}
      ${args.name ? `name="${esc(args.name)}"` : ''}
      ${args.required ? 'required' : ''}
      ${args.disabled ? 'disabled' : ''}
    ></pastis-date-field>`;
  wrap.querySelector('pastis-date-field').chips = Array.isArray(args.chips) ? args.chips : [];
  return wrap;
}

const panel = (theme, content) => `
  <section data-theme="${theme}" aria-label="${theme === 'dark' ? 'Dark' : 'Light'} theme" style="background:var(--bg-primary);color:var(--text-primary);padding:16px;flex:1 1 320px;min-width:0">
    ${content}
  </section>`;

/**
 * Date field wrapping a native `<input type="date">`, so phones show their own picker.
 * Form-associated; value `YYYY-MM-DD` or empty.
 *
 * `chips` (an array of `{ label, value }`) adds quick picks below the field; the app computes
 * their dates. Unless `required`, a clear button empties the field.
 */
export default {
  title: 'Basics/DateField',
  component: 'pastis-date-field',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text', description: '`YYYY-MM-DD`, or empty' },
    min: { control: 'text' },
    max: { control: 'text' },
    helper: { control: 'text' },
    error: { control: 'text' },
    name: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    chips: { control: 'object' },
  },
  args: {
    label: 'Due date',
    value: '',
    min: '',
    max: '',
    helper: '',
    error: '',
    name: '',
    required: false,
    disabled: false,
    chips: [],
  },
  render: field,
};

export const Default = {};

export const WithValue = { args: { value: iso(today) } };

/** Today, Tomorrow, Next week and No date: the pressed chip matches the value. */
export const WithChips = {
  args: { chips: dueChips, value: iso(addDays(today, 1)) },
  play: async ({ canvasElement, step }) => {
    const el = canvasElement.querySelector('pastis-date-field');
    const chip = (label) => [...el.shadowRoot.querySelectorAll('.chip')].find(c => c.textContent.trim() === label);
    await step('Next week sets the value and is pressed', async () => {
      chip('Next week').click();
      await el.updateComplete;
      await expect(el.value).toBe(dueChips[2].value);
      await expect(chip('Next week').getAttribute('aria-pressed')).toBe('true');
    });
    await step('No date empties it', async () => {
      chip('No date').click();
      await el.updateComplete;
      await expect(el.value).toBe('');
    });
  },
};

export const WithHelper = {
  args: { helper: 'The day it should be done by', chips: dueChips },
};

export const WithError = {
  args: { value: iso(addDays(today, -1)), error: 'The due date can’t be before the start date' },
};

/** Required: no clear button and no “No date” chip; the form blocks an empty value. */
export const Required = {
  args: { label: 'Start date', required: true, chips: dueChips.slice(0, 3) },
};

/** `min` and `max` limit the picker and make out-of-range values invalid. */
export const MinMax = {
  args: { label: 'Holiday starts', min: iso(today), max: iso(addDays(today, 90)), helper: 'Within the next three months' },
};

export const Disabled = { args: { value: iso(today), disabled: true, chips: dueChips } };

/** In a form: the value is submitted under `name`, and the form resets it. */
export const InAForm = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.maxWidth = '360px';
    wrap.innerHTML = `
      <form style="display:flex;flex-direction:column;gap:16px">
        <pastis-date-field label="Due date" name="due"></pastis-date-field>
        <div style="display:flex;gap:8px">
          <pastis-button type="submit">Save</pastis-button>
          <pastis-button type="reset" variant="ghost">Reset</pastis-button>
        </div>
        <output aria-live="polite" style="font-family:var(--font-family-mono);color:var(--text-primary)"></output>
      </form>`;
    const form = wrap.querySelector('form');
    form.querySelector('pastis-date-field').chips = dueChips;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.querySelector('output').textContent = `due = "${new FormData(form).get('due')}"`;
    });
    return wrap;
  },
};

/** The same field in the dark and the light theme. */
export const BothThemes = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-wrap:wrap';
    wrap.innerHTML = panel('dark', '<pastis-date-field label="Due date"></pastis-date-field>')
      + panel('light', '<pastis-date-field label="Due date"></pastis-date-field>');
    for (const el of wrap.querySelectorAll('pastis-date-field')) {
      el.chips = dueChips;
      el.value = dueChips[0].value;
    }
    return wrap;
  },
};

/** At phone width the chips wrap. */
export const PhoneWidth = {
  args: { chips: dueChips, value: dueChips[0].value },
  render: (args) => {
    const wrap = field(args);
    wrap.style.maxWidth = '';
    wrap.style.width = '320px';
    return wrap;
  },
};

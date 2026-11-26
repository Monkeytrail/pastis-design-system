import { expect } from 'storybook/test';
import './pastis-time-field.js';
import '../date-field/pastis-date-field.js';

/** Escapes text for a double-quoted attribute. */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const timeChips = [
  { label: '09:00', value: '09:00' },
  { label: '12:00', value: '12:00' },
  { label: '18:00', value: '18:00' },
];

/** Renders one field from args; chips are set as a property. */
function field(args) {
  const wrap = document.createElement('div');
  wrap.style.maxWidth = '360px';
  wrap.innerHTML = `
    <pastis-time-field
      label="${esc(args.label ?? '')}"
      ${args.value ? `value="${esc(args.value)}"` : ''}
      ${args.min ? `min="${esc(args.min)}"` : ''}
      ${args.max ? `max="${esc(args.max)}"` : ''}
      ${args.step ? `step="${esc(args.step)}"` : ''}
      ${args.helper ? `helper="${esc(args.helper)}"` : ''}
      ${args.error ? `error="${esc(args.error)}"` : ''}
      ${args.name ? `name="${esc(args.name)}"` : ''}
      ${args.required ? 'required' : ''}
      ${args.disabled ? 'disabled' : ''}
    ></pastis-time-field>`;
  wrap.querySelector('pastis-time-field').chips = Array.isArray(args.chips) ? args.chips : [];
  return wrap;
}

const panel = (theme, content) => `
  <section data-theme="${theme}" aria-label="${theme === 'dark' ? 'Dark' : 'Light'} theme" style="background:var(--bg-primary);color:var(--text-primary);padding:16px;flex:1 1 320px;min-width:0">
    ${content}
  </section>`;

/**
 * Time field wrapping a native `<input type="time">`. Form-associated; value `HH:MM` (24-hour)
 * or empty. Works like the date field: chips, clear button, label, helper and error.
 */
export default {
  title: 'Basics/TimeField',
  component: 'pastis-time-field',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text', description: '`HH:MM` (24-hour), or empty' },
    min: { control: 'text' },
    max: { control: 'text' },
    step: { control: 'number', description: 'Seconds (900 = quarter hours)' },
    helper: { control: 'text' },
    error: { control: 'text' },
    name: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    chips: { control: 'object' },
  },
  args: {
    label: 'Time',
    value: '',
    min: '',
    max: '',
    step: undefined,
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

export const WithValue = { args: { value: '14:30' } };

/** Morning, noon and evening picks; the pressed chip matches the value. */
export const WithChips = {
  args: { chips: timeChips, value: '09:00' },
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('pastis-time-field');
    const chip = [...el.shadowRoot.querySelectorAll('.chip')].find(c => c.textContent.trim() === '18:00');
    chip.click();
    await el.updateComplete;
    await expect(el.value).toBe('18:00');
    await expect(chip.getAttribute('aria-pressed')).toBe('true');
  },
};

/** Quarter hours: `step="900"`; other minutes are invalid. */
export const QuarterHours = { args: { label: 'Meeting starts', step: 900, value: '10:15', helper: 'On the quarter hour' } };

export const WithError = {
  args: { label: 'Reminder', value: '23:30', max: '22:00', error: 'Pick a time before 22:00' },
};

export const Required = { args: { label: 'Pick-up time', required: true, chips: timeChips } };

export const Disabled = { args: { value: '09:00', disabled: true, chips: timeChips } };

/** With a date field, as in an item's Due section. */
export const DateAndTime = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'max-width:360px;display:flex;flex-direction:column;gap:24px';
    wrap.innerHTML = `
      <pastis-date-field label="Due date" value="2026-11-27"></pastis-date-field>
      <pastis-time-field label="Time" value="14:00"></pastis-time-field>`;
    wrap.querySelector('pastis-time-field').chips = timeChips;
    return wrap;
  },
};

/** The same field in the dark and the light theme. */
export const BothThemes = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-wrap:wrap';
    wrap.innerHTML = panel('dark', '<pastis-time-field label="Time" value="12:00"></pastis-time-field>')
      + panel('light', '<pastis-time-field label="Time" value="12:00"></pastis-time-field>');
    for (const el of wrap.querySelectorAll('pastis-time-field')) el.chips = timeChips;
    return wrap;
  },
};

/** At phone width. */
export const PhoneWidth = {
  args: { chips: timeChips, value: '18:00' },
  render: (args) => {
    const wrap = field(args);
    wrap.style.maxWidth = '';
    wrap.style.width = '320px';
    return wrap;
  },
};

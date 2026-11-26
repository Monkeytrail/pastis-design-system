import { expect } from 'storybook/test';
import './pastis-recurrence-picker.js';

/** Renders one picker from args; the value is set as a property. */
function picker(args) {
  const wrap = document.createElement('div');
  wrap.style.maxWidth = '480px';
  const el = document.createElement('pastis-recurrence-picker');
  if (args.label) el.label = args.label;
  if (args.helper) el.helper = args.helper;
  el.disabled = !!args.disabled;
  el.value = args.value ?? null;
  wrap.append(el);
  return wrap;
}

const panel = (theme) => `
  <section data-theme="${theme}" aria-label="${theme === 'dark' ? 'Dark' : 'Light'} theme" style="background:var(--bg-primary);color:var(--text-primary);padding:16px;flex:1 1 320px;min-width:0;max-width:375px"></section>`;

const bins = { freq: 'weekly', interval: 1, byDay: ['MO', 'TH'], mode: 'schedule', until: null };

/**
 * How a task repeats: a frequency, “every n”, weekdays (weekly), whether the next one counts
 * from the schedule or from completion, and an end. The value is `null` or
 * `{ freq, interval, byDay, mode, until }`; the app turns it into an RRULE.
 */
export default {
  title: 'Basics/RecurrencePicker',
  component: 'pastis-recurrence-picker',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    label: { control: 'text' },
    helper: { control: 'text' },
    disabled: { control: 'boolean' },
    value: { control: 'object' },
  },
  args: { label: 'Repeat', helper: '', disabled: false, value: null },
  render: picker,
};

export const Default = {};

/** Bins: every week on Monday and Thursday. */
export const Weekly = {
  args: { value: bins, helper: 'Every week on Mon, Thu' },
  play: async ({ canvasElement, step }) => {
    const el = canvasElement.querySelector('pastis-recurrence-picker');
    const values = [];
    el.addEventListener('pastis-change', e => values.push(e.detail.value));
    await step('Saturday is added', async () => {
      const sat = [...el.shadowRoot.querySelectorAll('label.choice')].find(l => l.textContent.trim() === 'Sat');
      sat.click();
      await expect(values.at(-1).byDay).toEqual(['MO', 'TH', 'SA']);
    });
  },
};

export const AfterCompletion = {
  args: { value: { freq: 'monthly', interval: 3, byDay: [], mode: 'completion', until: null }, helper: 'Every 3 months after completion' },
};

export const Ending = {
  args: { value: { freq: 'daily', interval: 1, byDay: [], mode: 'schedule', until: '2027-12-31' } },
};

export const Disabled = { args: { disabled: true, helper: 'Set a due date to repeat' } };

/** Dark and light side by side, at phone width each. */
export const BothThemes = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexWrap = 'wrap';
    wrap.innerHTML = panel('dark') + panel('light');
    for (const [i, section] of [...wrap.querySelectorAll('section')].entries()) {
      section.append(picker({ label: i === 0 ? 'Repeat (dark)' : 'Repeat (light)', value: bins }));
    }
    return wrap;
  },
};

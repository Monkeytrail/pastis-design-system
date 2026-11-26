import { describe, it, expect, afterEach } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-recurrence-picker.js';

async function axNodes() {
  const session = cdp();
  await session.send('Accessibility.enable');
  const { frameTree } = await session.send('Page.getFrameTree');
  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
  return nodes.filter(n => !n.ignored);
}

const WEEKLY = { freq: 'weekly', interval: 1, byDay: ['MO', 'TH'], mode: 'schedule', until: null };

async function mountPicker(value = null, attrs = '', wrap = s => s) {
  const container = document.createElement('div');
  container.innerHTML = wrap(`<pastis-recurrence-picker ${attrs}></pastis-recurrence-picker>`);
  document.body.appendChild(container);
  const picker = container.querySelector('pastis-recurrence-picker');
  picker.value = value;
  await picker.updateComplete;
  const values = [];
  picker.addEventListener('pastis-change', e => values.push(e.detail.value));
  const root = picker.shadowRoot;
  /** The chip (label) with this text in the group with this legend. */
  const choice = (legend, text) => {
    const group = [...root.querySelectorAll('fieldset')].find(f => f.querySelector('legend').textContent.trim() === legend);
    return [...(group?.querySelectorAll('label.choice') ?? [])].find(l => l.textContent.trim() === text);
  };
  return { container, picker, values, root, choice };
}

describe('pastis-recurrence-picker', () => {
  let container;
  afterEach(() => container?.remove());

  it('starts at Never, with only the frequency group', async () => {
    const m = await mountPicker();
    container = m.container;
    expect(m.choice('Repeat', 'Never').querySelector('input').checked).toBe(true);
    expect(m.root.querySelectorAll('fieldset')).toHaveLength(1);
    expect(m.root.querySelector('input[type=number]')).toBeNull();
  });

  it('choosing a frequency gives a whole value; Never gives null', async () => {
    const m = await mountPicker();
    container = m.container;
    await userEvent.click(m.choice('Repeat', 'Weekly'));
    expect(m.values.at(-1)).toEqual({ freq: 'weekly', interval: 1, byDay: [], mode: 'schedule', until: null });
    await userEvent.click(m.choice('Repeat', 'Monthly'));
    expect(m.values.at(-1)).toEqual({ freq: 'monthly', interval: 1, byDay: [], mode: 'schedule', until: null });
    await userEvent.click(m.choice('Repeat', 'Never'));
    expect(m.values.at(-1)).toBeNull();
  });

  it('weekdays show for weekly on schedule only, Monday first, and toggle', async () => {
    const m = await mountPicker(WEEKLY);
    container = m.container;
    const days = [...m.root.querySelectorAll('fieldset')].find(f => f.querySelector('legend').textContent === 'On');
    expect([...days.querySelectorAll('label')].map(l => l.textContent.trim())).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect([...days.querySelectorAll('input')].filter(i => i.checked).map(i => i.value)).toEqual(['MO', 'TH']);
    await userEvent.click(m.choice('On', 'Sat'));
    expect(m.values.at(-1).byDay).toEqual(['MO', 'TH', 'SA']);
    await userEvent.click(m.choice('On', 'Mon'));
    expect(m.values.at(-1).byDay).toEqual(['TH', 'SA']);
    await userEvent.click(m.choice('Next one counts from', 'Completion'));
    expect(m.values.at(-1).mode).toBe('completion');
    expect(m.choice('On', 'Mon')).toBeUndefined();
  });

  it('the interval commits on change, clamped to 1–99, and names its unit', async () => {
    const m = await mountPicker({ ...WEEKLY, byDay: [] });
    container = m.container;
    const input = m.root.querySelector('input[type=number]');
    expect(m.root.getElementById(input.getAttribute('aria-describedby')).textContent).toBe('week');
    await userEvent.fill(input, '3');
    input.dispatchEvent(new Event('change'));
    expect(m.values.at(-1).interval).toBe(3);
    await m.picker.updateComplete;
    expect(m.root.getElementById(input.getAttribute('aria-describedby')).textContent).toBe('weeks');
    await userEvent.fill(input, '250');
    input.dispatchEvent(new Event('change'));
    expect(m.values.at(-1).interval).toBe(99);
    expect(input.value).toBe('99');
  });

  it('ends never or on a date; an emptied date keeps the last one', async () => {
    const m = await mountPicker({ ...WEEKLY, until: null });
    container = m.container;
    await userEvent.click(m.choice('Ends', 'On a date'));
    expect(m.values.at(-1).until).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await m.picker.updateComplete;
    const date = m.root.querySelector('input[type=date]');
    date.value = '2027-12-31';
    date.dispatchEvent(new Event('change'));
    expect(m.values.at(-1).until).toBe('2027-12-31');
    date.value = '';
    date.dispatchEvent(new Event('change'));
    expect(date.value).toBe('2027-12-31');
    await userEvent.click(m.choice('Ends', 'Never'));
    expect(m.values.at(-1).until).toBeNull();
  });

  it('arrow keys move within the frequency group', async () => {
    const m = await mountPicker();
    container = m.container;
    m.choice('Repeat', 'Never').querySelector('input').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(m.values.at(-1)?.freq).toBe('daily');
    await userEvent.keyboard('{ArrowRight}');
    expect(m.values.at(-1)?.freq).toBe('weekly');
  });

  it('normalises a value it is given', async () => {
    const m = await mountPicker({ freq: 'daily', interval: '0', byDay: ['XX'], mode: 'odd', until: 'soon' });
    container = m.container;
    expect(m.root.querySelector('input[type=number]').value).toBe('1');
    expect(m.choice('Next one counts from', 'The schedule').querySelector('input').checked).toBe(true);
    expect(m.choice('Ends', 'Never').querySelector('input').checked).toBe(true);
  });

  it('disabled: every control', async () => {
    const m = await mountPicker(WEEKLY, 'disabled helper="Set a due date first"');
    container = m.container;
    expect([...m.root.querySelectorAll('input')].every(i => i.disabled)).toBe(true);
    expect(m.root.querySelector('.helper').textContent).toBe('Set a due date first');
  });

  it('Chrome: the groups are named by their legends, the choices are radios and checkboxes', async () => {
    const m = await mountPicker(WEEKLY, 'label="Repeat"');
    container = m.container;
    const nodes = await axNodes();
    const groups = nodes.filter(n => n.role?.value === 'group').map(n => n.name?.value);
    expect(groups).toEqual(['Repeat', 'Next one counts from', 'On', 'Ends']);
    expect(nodes.filter(n => n.role?.value === 'radio').map(n => n.name.value)).toEqual([
      'Never', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'The schedule', 'Completion', 'Never', 'On a date',
    ]);
    expect(nodes.filter(n => n.role?.value === 'checkbox').map(n => n.name.value)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    const every = nodes.find(n => n.role?.value === 'spinbutton');
    expect(every?.name.value).toBe('Every');
    expect(every?.description?.value).toBe('week');
  });

  it.each([
    ['never', null],
    ['weekly', WEEKLY],
    ['ending', { ...WEEKLY, until: '2027-12-31' }],
  ])('axe (all rules) is clean: %s, in both themes', async (_name, value) => {
    for (const [theme, bg] of [['dark', '#110d0a'], ['light', '#f4f1ea']]) {
      const m = await mountPicker(value, '', s => `<main data-theme="${theme}" style="background:${bg};color:var(--text-primary)"><h1>Bins</h1>${s}</main>`);
      container = m.container;
      const results = await axe.run(container);
      expect(results.violations, theme).toEqual([]);
      container.remove();
    }
  });
});

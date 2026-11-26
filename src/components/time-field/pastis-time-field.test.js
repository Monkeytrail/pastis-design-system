import { describe, it, expect, afterEach, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-time-field.js';
import '../button/pastis-button.js';

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  await new Promise(requestAnimationFrame);
  return container;
}

const tick = () => new Promise(r => setTimeout(r));

/** Every accessibility-tree node (Chrome's own) of the test page. */
async function axNodes() {
  const session = cdp();
  await session.send('Accessibility.enable');
  const { frameTree } = await session.send('Page.getFrameTree');
  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
  return nodes.filter(n => !n.ignored);
}

const CHIPS = [
  { label: '09:00', value: '09:00' },
  { label: '12:00', value: '12:00' },
  { label: '18:00', value: '18:00' },
];

async function mountWithChips(attrs = '', wrap = (s) => s) {
  const container = await mount(wrap(`<pastis-time-field label="Time" ${attrs}></pastis-time-field>`));
  const field = container.querySelector('pastis-time-field');
  field.chips = CHIPS;
  await field.updateComplete;
  return container;
}

describe('pastis-time-field', () => {
  let container;
  const field = () => container.querySelector('pastis-time-field');
  const input = () => field().shadowRoot.querySelector('input');
  const clear = () => field().shadowRoot.querySelector('.clear');
  const chips = () => [...field().shadowRoot.querySelectorAll('.chip')];
  const chip = (label) => chips().find(c => c.textContent.trim() === label);

  afterEach(() => container?.remove());

  it('wraps a native time input, value HH:MM', async () => {
    container = await mount('<pastis-time-field label="Time" value="14:30"></pastis-time-field>');
    expect(input().type).toBe('time');
    expect(input().value).toBe('14:30');
    expect(field().value).toBe('14:30');
    expect(field().disabled).toBe(false);
    expect(field().required).toBe(false);
    expect(field().step).toBeUndefined();
    expect(input().hasAttribute('step')).toBe(false);
  });

  it('an invalid value becomes empty', async () => {
    container = await mount('<pastis-time-field label="Time" value="25:00"></pastis-time-field>');
    expect(field().value).toBe('');
    field().value = '2pm';
    await field().updateComplete;
    expect(field().value).toBe('');
  });

  it('step reaches the native input and its rules apply', async () => {
    container = await mount('<form><pastis-time-field label="Time" step="900" value="09:10"></pastis-time-field></form>');
    expect(input().step).toBe('900');
    expect(field().validity.stepMismatch).toBe(true);
    field().value = '09:15';
    await field().updateComplete;
    expect(field().validity.valid).toBe(true);
  });

  it('typing a time sets the 24-hour value and fires both events', async () => {
    container = await mount('<pastis-time-field label="Time"></pastis-time-field>');
    const handler = vi.fn();
    field().addEventListener('pastis-input', handler);
    field().addEventListener('pastis-change', handler);
    input().focus();
    // The test browser's locale is en-US: hours, minutes, AM/PM
    await userEvent.keyboard('0215P');
    expect(field().value).toBe('14:15');
    expect(handler.mock.calls.at(-1)[0].detail).toEqual({ value: '14:15' });
    expect(handler.mock.calls.map(([e]) => e.type)).toContain('pastis-change');
  });

  it('chips: the matching one is pressed; a click sets the value and fires both events', async () => {
    container = await mountWithChips('value="12:00"');
    const group = field().shadowRoot.querySelector('.chips');
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Time');
    expect(chip('12:00').getAttribute('aria-pressed')).toBe('true');
    const handler = vi.fn();
    field().addEventListener('pastis-input', handler);
    field().addEventListener('pastis-change', handler);
    await userEvent.click(chip('18:00'));
    await field().updateComplete;
    expect(field().value).toBe('18:00');
    expect(input().value).toBe('18:00');
    expect(chip('18:00').getAttribute('aria-pressed')).toBe('true');
    expect(chip('12:00').getAttribute('aria-pressed')).toBe('false');
    expect(handler.mock.calls.map(([e]) => [e.type, e.detail])).toEqual([
      ['pastis-input', { value: '18:00' }],
      ['pastis-change', { value: '18:00' }],
    ]);
  });

  it('the clear button ("Clear Time") empties it and focuses the input', async () => {
    container = await mount('<pastis-time-field label="Time" value="09:00"></pastis-time-field>');
    await expect.element(page.getByRole('button', { name: 'Clear Time', exact: true })).toBeInTheDocument();
    const handler = vi.fn();
    field().addEventListener('pastis-change', handler);
    await userEvent.click(clear());
    await field().updateComplete;
    expect(field().value).toBe('');
    expect(handler.mock.calls[0][0].detail).toEqual({ value: '' });
    expect(field().shadowRoot.activeElement).toBe(input());
  });

  it('is form-associated: form data, required, reset and a disabled fieldset', async () => {
    container = await mount(`
      <form>
        <fieldset>
          <pastis-time-field label="Time" name="time" value="09:00" required></pastis-time-field>
        </fieldset>
        <pastis-button type="submit">Save</pastis-button>
      </form>`);
    const form = container.querySelector('form');
    expect(new FormData(form).get('time')).toBe('09:00');
    field().value = '';
    await field().updateComplete;
    expect(field().validity.valueMissing).toBe(true);
    expect(form.checkValidity()).toBe(false);
    form.reset();
    await field().updateComplete;
    expect(field().value).toBe('09:00');
    expect(field().validity.valid).toBe(true);
    container.querySelector('fieldset').disabled = true;
    await field().updateComplete;
    expect(input().disabled).toBe(true);
    expect(new FormData(form).has('time')).toBe(false);
  });

  it('Enter in the input submits the form', async () => {
    container = await mount('<form><pastis-time-field label="Time" name="time" value="09:00"></pastis-time-field></form>');
    const form = container.querySelector('form');
    const submits = [];
    form.addEventListener('submit', (e) => { e.preventDefault(); submits.push(new FormData(form)); });
    input().focus();
    await userEvent.keyboard('{Enter}');
    await tick();
    expect(submits).toHaveLength(1);
    expect(submits[0].get('time')).toBe('09:00');
  });

  it('Chrome names the input and the chips group "Time"', async () => {
    container = await mountWithChips('value="09:00"');
    const nodes = await axNodes();
    expect(nodes.find(n => n.role?.value === 'InputTime')?.name.value).toBe('Time');
    expect(nodes.filter(n => n.role?.value === 'group' && n.name?.value === 'Time')).toHaveLength(1);
    // Chrome's own "Show time picker" button inside the native input is not ours
    const buttons = nodes.filter(n => n.role?.value === 'button' && n.name.value !== 'Show time picker').map(n => n.name.value);
    expect(buttons).toEqual(['Clear Time', '09:00', '12:00', '18:00']);
  });

  it.each([
    ['empty', ''],
    ['with a value', 'value="09:00"'],
    ['required with an error', 'required error="Pick a time"'],
    ['disabled', 'value="09:00" disabled'],
  ])('axe (all rules) is clean: %s, in both themes', async (_name, attrs) => {
    for (const [theme, bg] of [['dark', '#110d0a'], ['light', '#f4f1ea']]) {
      container = await mountWithChips(attrs, s => `<main data-theme="${theme}" style="background:${bg};color:var(--text-primary)"><h1>Buy oat milk</h1>${s}</main>`);
      const results = await axe.run(container);
      expect(results.violations, theme).toEqual([]);
      container.remove();
    }
  });
});

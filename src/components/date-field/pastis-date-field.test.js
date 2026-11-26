import { describe, it, expect, afterEach, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-date-field.js';
import '../button/pastis-button.js';

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  // Nested Pastis elements (the clear button's icon) inside the shadow roots
  await new Promise(requestAnimationFrame);
  return container;
}

/** Collects the FormData of every submit of `form`, preventing navigation. */
function captureSubmits(form) {
  const submits = [];
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submits.push({ data: new FormData(form, e.submitter), submitter: e.submitter });
  });
  return submits;
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
  { label: 'Today', value: '2026-11-25' },
  { label: 'Tomorrow', value: '2026-11-26' },
  { label: 'Next week', value: '2026-11-30' },
  { label: 'No date', value: '' },
];

/** A date field with the usual chips (set as a property). */
async function mountWithChips(attrs = '', wrap = (s) => s) {
  const container = await mount(wrap(`<pastis-date-field label="Due date" ${attrs}></pastis-date-field>`));
  const field = container.querySelector('pastis-date-field');
  field.chips = CHIPS;
  await field.updateComplete;
  return container;
}

describe('pastis-date-field', () => {
  let container;
  const field = () => container.querySelector('pastis-date-field');
  const input = () => field().shadowRoot.querySelector('input');
  const clear = () => field().shadowRoot.querySelector('.clear');
  const chips = () => [...field().shadowRoot.querySelectorAll('.chip')];
  const chip = (label) => chips().find(c => c.textContent.trim() === label);

  afterEach(() => container?.remove());

  // ─── Default render ───────────────────────────────────────────────────────

  it('has correct default property values', async () => {
    container = await mount('<pastis-date-field label="Due date"></pastis-date-field>');
    expect(field().value).toBe('');
    expect(field().disabled).toBe(false);
    expect(field().required).toBe(false);
    expect(field().chips).toEqual([]);
    expect(field().constructor.formAssociated).toBe(true);
  });

  it('wraps a native date input labelled by the label', async () => {
    container = await mount('<pastis-date-field label="Due date" value="2026-11-25"></pastis-date-field>');
    expect(input().type).toBe('date');
    expect(input().value).toBe('2026-11-25');
    expect(field().shadowRoot.querySelector('label').getAttribute('for')).toBe(input().id);
    expect(field().shadowRoot.querySelector('.chips')).toBeNull();
  });

  it('min and max reach the native input', async () => {
    container = await mount('<pastis-date-field label="Due date" min="2026-01-01" max="2026-12-31"></pastis-date-field>');
    expect(input().min).toBe('2026-01-01');
    expect(input().max).toBe('2026-12-31');
  });

  it('an invalid value becomes empty, as on the native input', async () => {
    container = await mount('<pastis-date-field label="Due date" value="tomorrow"></pastis-date-field>');
    expect(field().value).toBe('');
    field().value = '2026-02-30';
    await field().updateComplete;
    expect(field().value).toBe('');
    field().value = '2026-02-28';
    await field().updateComplete;
    expect(field().value).toBe('2026-02-28');
    expect(field().getAttribute('value')).toBe('2026-02-28');
  });

  it('focus() and a click on the label focus the native input', async () => {
    container = await mountWithChips('value="2026-11-25"');
    field().focus();
    expect(field().shadowRoot.activeElement).toBe(input());
    input().blur();
    field().shadowRoot.querySelector('label').click();
    expect(field().shadowRoot.activeElement).toBe(input());
  });

  // ─── Typing ───────────────────────────────────────────────────────────────

  it('typing a date sets the value and fires pastis-input and pastis-change', async () => {
    container = await mount('<pastis-date-field label="Due date"></pastis-date-field>');
    const inputs = vi.fn();
    const changes = vi.fn();
    field().addEventListener('pastis-input', inputs);
    field().addEventListener('pastis-change', changes);
    input().focus();
    // The test browser's locale is en-US: month, day, year
    await userEvent.keyboard('11252026');
    expect(field().value).toBe('2026-11-25');
    expect(inputs).toHaveBeenCalled();
    expect(inputs.mock.calls.at(-1)[0].detail).toEqual({ value: '2026-11-25' });
    expect(changes.mock.calls.at(-1)[0].detail).toEqual({ value: '2026-11-25' });
  });

  it('pastis-input and pastis-change bubble and are composed', async () => {
    container = await mountWithChips();
    const events = [];
    document.body.addEventListener('pastis-input', e => events.push(e), { once: true });
    document.body.addEventListener('pastis-change', e => events.push(e), { once: true });
    chip('Today').click();
    expect(events.map(e => e.type)).toEqual(['pastis-input', 'pastis-change']);
    for (const e of events) {
      expect(e.bubbles).toBe(true);
      expect(e.composed).toBe(true);
    }
  });

  // ─── Chips ────────────────────────────────────────────────────────────────

  it('renders the chips as buttons in a group named by the label', async () => {
    container = await mountWithChips();
    const group = field().shadowRoot.querySelector('.chips');
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Due date');
    expect(chips().map(c => c.textContent.trim())).toEqual(['Today', 'Tomorrow', 'Next week', 'No date']);
    expect(chips().every(c => c.type === 'button')).toBe(true);
  });

  it('the chip matching the value is pressed ("No date" while empty)', async () => {
    container = await mountWithChips();
    const pressed = () => chips().filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.textContent.trim());
    expect(pressed()).toEqual(['No date']);
    field().value = '2026-11-26';
    await field().updateComplete;
    expect(pressed()).toEqual(['Tomorrow']);
    field().value = '2026-12-24';
    await field().updateComplete;
    expect(pressed()).toEqual([]);
    expect(chips().every(c => c.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('clicking a chip sets the value and fires pastis-input and pastis-change once each', async () => {
    container = await mountWithChips();
    const handler = vi.fn();
    field().addEventListener('pastis-input', handler);
    field().addEventListener('pastis-change', handler);
    await userEvent.click(chip('Next week'));
    await field().updateComplete;
    expect(field().value).toBe('2026-11-30');
    expect(input().value).toBe('2026-11-30');
    expect(chip('Next week').getAttribute('aria-pressed')).toBe('true');
    expect(handler.mock.calls.map(([e]) => [e.type, e.detail])).toEqual([
      ['pastis-input', { value: '2026-11-30' }],
      ['pastis-change', { value: '2026-11-30' }],
    ]);
    // "No date" empties it
    await userEvent.click(chip('No date'));
    await field().updateComplete;
    expect(field().value).toBe('');
    expect(input().value).toBe('');
    expect(handler.mock.calls.at(-1)[0].detail).toEqual({ value: '' });
  });

  it('clicking the pressed chip changes nothing and fires nothing', async () => {
    container = await mountWithChips('value="2026-11-25"');
    const handler = vi.fn();
    field().addEventListener('pastis-input', handler);
    field().addEventListener('pastis-change', handler);
    await userEvent.click(chip('Today'));
    expect(handler).not.toHaveBeenCalled();
    expect(field().value).toBe('2026-11-25');
  });

  it('chips work from the keyboard (Enter and Space) and never submit the form', async () => {
    container = await mountWithChips('name="due"', s => `<form>${s}<pastis-button type="submit">Save</pastis-button></form>`);
    const submits = captureSubmits(container.querySelector('form'));
    chip('Tomorrow').focus();
    await userEvent.keyboard('{Enter}');
    await field().updateComplete;
    expect(field().value).toBe('2026-11-26');
    chip('Today').focus();
    await userEvent.keyboard(' ');
    await field().updateComplete;
    expect(field().value).toBe('2026-11-25');
    await tick();
    expect(submits).toHaveLength(0);
  });

  it('chips as a JSON attribute', async () => {
    container = await mount(`<pastis-date-field label="Due date" chips='[{"label":"Today","value":"2026-11-25"}]'></pastis-date-field>`);
    expect(chips().map(c => c.textContent.trim())).toEqual(['Today']);
  });

  it('a chip with a value outside min/max still sets it and makes the field invalid', async () => {
    container = await mountWithChips('min="2026-11-26"');
    await userEvent.click(chip('Today'));
    await field().updateComplete;
    expect(field().validity.rangeUnderflow).toBe(true);
  });

  // ─── Clear button ─────────────────────────────────────────────────────────

  it('the clear button is named "Clear <label>" and shows only when there is a value', async () => {
    container = await mount('<pastis-date-field label="Due date"></pastis-date-field>');
    expect(clear()).toBeNull();
    field().value = '2026-11-25';
    await field().updateComplete;
    expect(clear().type).toBe('button');
    await expect.element(page.getByRole('button', { name: 'Clear Due date', exact: true })).toBeInTheDocument();
    expect(clear().querySelector('pastis-icon').name).toBe('close');
  });

  it('clearing empties the field, fires both events and moves focus to the input', async () => {
    container = await mount('<form><pastis-date-field label="Due date" name="due" value="2026-11-25"></pastis-date-field></form>');
    const handler = vi.fn();
    field().addEventListener('pastis-input', handler);
    field().addEventListener('pastis-change', handler);
    await userEvent.click(clear());
    await field().updateComplete;
    expect(field().value).toBe('');
    expect(input().value).toBe('');
    expect(new FormData(container.querySelector('form')).get('due')).toBe('');
    expect(handler.mock.calls.map(([e]) => [e.type, e.detail])).toEqual([
      ['pastis-input', { value: '' }],
      ['pastis-change', { value: '' }],
    ]);
    expect(clear()).toBeNull();
    expect(field().shadowRoot.activeElement).toBe(input());
  });

  it('the clear button works from the keyboard', async () => {
    container = await mount('<pastis-date-field label="Due date" value="2026-11-25"></pastis-date-field>');
    clear().focus();
    await userEvent.keyboard('{Enter}');
    await field().updateComplete;
    expect(field().value).toBe('');
  });

  it('no clear button when required or disabled', async () => {
    container = await mount('<pastis-date-field label="Due date" value="2026-11-25" required></pastis-date-field>');
    expect(clear()).toBeNull();
    field().required = false;
    field().disabled = true;
    await field().updateComplete;
    expect(clear()).toBeNull();
    field().disabled = false;
    await field().updateComplete;
    expect(clear()).not.toBeNull();
  });

  // ─── Keyboard ─────────────────────────────────────────────────────────────

  it('Tab order: input, clear button, then the chips', async () => {
    container = await mountWithChips('value="2026-11-25"', s => `<button>Before</button>${s}<button>After</button>`);
    container.querySelector('button').focus();
    await userEvent.tab();
    expect(field().shadowRoot.activeElement).toBe(input());
    // The date input has segments (month, day, year), each a Tab stop in Chrome
    while (field().shadowRoot.activeElement === input()) await userEvent.tab();
    expect(field().shadowRoot.activeElement).toBe(clear());
    for (const label of ['Today', 'Tomorrow', 'Next week', 'No date']) {
      await userEvent.tab();
      expect(field().shadowRoot.activeElement).toBe(chip(label));
    }
    await userEvent.tab();
    expect(document.activeElement.textContent).toBe('After');
  });

  it('focus is visible with the focus token, in both themes', async () => {
    for (const [theme, colour] of [['dark', 'rgb(252, 186, 40)'], ['light', 'rgb(138, 82, 0)']]) {
      container = await mountWithChips('value="2026-11-25"', s => `<div data-theme="${theme}"><button>Before</button>${s}</div>`);
      container.querySelector('button').focus();
      await userEvent.tab();
      expect(getComputedStyle(input()).outlineStyle, theme).toBe('solid');
      expect(getComputedStyle(input()).outlineColor, theme).toBe(colour);
      for (const el of [clear(), chip('Today')]) {
        while (field().shadowRoot.activeElement !== el) await userEvent.tab();
        expect(getComputedStyle(el).outlineStyle, theme).toBe('solid');
        expect(getComputedStyle(el).outlineColor, theme).toBe(colour);
      }
      container.remove();
    }
  });

  it('targets are at least 24 × 24 px, and 44 px tall on coarse pointers', async () => {
    container = await mountWithChips('value="2026-11-25"');
    for (const el of [clear(), ...chips()]) {
      const rect = el.getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(24);
      expect(rect.height).toBeGreaterThanOrEqual(24);
    }
    const session = cdp();
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    try {
      expect(matchMedia('(pointer: coarse)').matches).toBe(true);
      for (const el of [clear(), ...chips()]) {
        const rect = el.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(44);
        expect(rect.width).toBeGreaterThanOrEqual(44);
      }
    } finally {
      await session.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    }
  });

  // ─── Helper, error, required marker, theme ────────────────────────────────

  it('helper and error describe the input; the error is an alert in --text-error', async () => {
    container = await mount('<pastis-date-field label="Due date" helper="When it should be done"></pastis-date-field>');
    await expect.element(page.getByLabelText('Due date')).toHaveAccessibleDescription('When it should be done');
    expect(input().getAttribute('aria-invalid')).toBe('false');
    field().error = 'Pick a date after the start date';
    await field().updateComplete;
    await expect.element(page.getByLabelText('Due date')).toHaveAccessibleDescription('Pick a date after the start date');
    expect(input().getAttribute('aria-invalid')).toBe('true');
    const error = field().shadowRoot.querySelector('.error-text');
    expect(error.getAttribute('role')).toBe('alert');
    expect(getComputedStyle(error).color).toBe('rgb(244, 95, 107)');
  });

  it('the native picker follows the theme (color-scheme)', async () => {
    container = await mount(`
      <div data-theme="dark"><pastis-date-field label="Start date"></pastis-date-field></div>
      <div data-theme="light"><pastis-date-field label="End date"></pastis-date-field></div>`);
    const [dark, light] = [...container.querySelectorAll('pastis-date-field')].map(f => f.shadowRoot.querySelector('input'));
    expect(getComputedStyle(dark).colorScheme).toBe('dark');
    expect(getComputedStyle(light).colorScheme).toBe('light');
  });

  // ─── Disabled ─────────────────────────────────────────────────────────────

  it('disabled: input and chips are disabled; a chip click does nothing', async () => {
    container = await mountWithChips('disabled');
    expect(input().disabled).toBe(true);
    expect(chips().every(c => c.disabled)).toBe(true);
    const handler = vi.fn();
    field().addEventListener('pastis-change', handler);
    chip('Today').click();
    expect(handler).not.toHaveBeenCalled();
    expect(field().value).toBe('');
    field().disabled = false;
    await field().updateComplete;
    expect(input().disabled).toBe(false);
    expect(chips().some(c => c.disabled)).toBe(false);
  });

  // ─── Accessibility tree ───────────────────────────────────────────────────

  it('Chrome names the input and the chips group by the label, required as a state', async () => {
    container = await mountWithChips('value="2026-11-25"');
    let nodes = await axNodes();
    const date = nodes.find(n => n.role?.value === 'Date');
    expect(date?.name.value).toBe('Due date');
    const group = nodes.filter(n => n.role?.value === 'group' && n.name?.value === 'Due date');
    expect(group).toHaveLength(1);
    // Chrome's own "Show date picker" button inside the native input is not ours
    const buttons = nodes.filter(n => n.role?.value === 'button' && n.name.value !== 'Show date picker').map(n => n.name.value);
    expect(buttons).toEqual(['Clear Due date', 'Today', 'Tomorrow', 'Next week', 'No date']);
    const today = nodes.find(n => n.role?.value === 'button' && n.name.value === 'Today');
    expect(today.properties.find(p => p.name === 'pressed')?.value.value).toBe('true');

    field().required = true;
    await field().updateComplete;
    nodes = await axNodes();
    const required = nodes.find(n => n.role?.value === 'Date');
    expect(required.name.value).toBe('Due date');
    // Exposed as a native required date input is (Chrome leaves `required` off date inputs)
    const native = document.createElement('input');
    Object.assign(native, { type: 'date', required: true, ariaLabel: 'Native' });
    container.appendChild(native);
    const reference = (await axNodes()).find(n => n.role?.value === 'Date' && n.name.value === 'Native');
    const states = (node) => node.properties.map(p => p.name).sort();
    expect(states(required)).toEqual(states(reference));
    expect(input().required).toBe(true);
  });

  it.each([
    ['empty', ''],
    ['with a value and chips', 'value="2026-11-25"'],
    ['required', 'required'],
    ['with helper', 'helper="When it should be done"'],
    ['with an error', 'value="2026-11-24" error="The due date is in the past"'],
    ['disabled', 'value="2026-11-25" disabled'],
  ])('axe (all rules) is clean: %s, in both themes', async (_name, attrs) => {
    for (const [theme, bg] of [['dark', '#110d0a'], ['light', '#f4f1ea']]) {
      container = await mountWithChips(attrs, s => `<main data-theme="${theme}" style="background:${bg};color:var(--text-primary)"><h1>Buy oat milk</h1>${s}</main>`);
      const results = await axe.run(container);
      expect(results.violations, theme).toEqual([]);
      container.remove();
    }
  });
});

// ─── Forms ──────────────────────────────────────────────────────────────────

describe('pastis-date-field in a form', () => {
  let container;
  const field = () => container.querySelector('pastis-date-field');
  const input = () => field().shadowRoot.querySelector('input');
  afterEach(() => container?.remove());

  it('submits its value under its name (empty as "")', async () => {
    container = await mount(`
      <form>
        <pastis-date-field label="Due date" name="due"></pastis-date-field>
        <pastis-button type="submit">Save</pastis-button>
      </form>`);
    const form = container.querySelector('form');
    const submits = captureSubmits(form);
    expect(field().form).toBe(form);
    container.querySelector('pastis-button').click();
    expect(submits[0].data.get('due')).toBe('');
    field().value = '2026-11-25';
    await field().updateComplete;
    container.querySelector('pastis-button').click();
    expect(submits[1].data.get('due')).toBe('2026-11-25');
  });

  it('form.reset() restores the initial value (after a chip and after typing)', async () => {
    container = await mount('<form><pastis-date-field label="Due date" name="due" value="2026-11-25"></pastis-date-field></form>');
    field().chips = [{ label: 'Tomorrow', value: '2026-11-26' }];
    await field().updateComplete;
    field().shadowRoot.querySelector('.chip').click();
    await field().updateComplete;
    expect(field().value).toBe('2026-11-26');
    container.querySelector('form').reset();
    await field().updateComplete;
    expect(field().value).toBe('2026-11-25');
    expect(input().value).toBe('2026-11-25');
    expect(new FormData(container.querySelector('form')).get('due')).toBe('2026-11-25');
  });

  it('form.reset() also clears a partly typed date', async () => {
    container = await mount('<form><pastis-date-field label="Due date" name="due"></pastis-date-field></form>');
    input().focus();
    await userEvent.keyboard('11');
    expect(field().validity.badInput).toBe(true);
    container.querySelector('form').reset();
    await field().updateComplete;
    expect(field().validity.valid).toBe(true);
  });

  it('required: invalid while empty, blocks submission, valid once set', async () => {
    container = await mount(`
      <form>
        <pastis-date-field label="Due date" name="due" required></pastis-date-field>
        <pastis-button type="submit">Save</pastis-button>
      </form>`);
    const submits = captureSubmits(container.querySelector('form'));
    const invalid = vi.fn();
    field().addEventListener('invalid', invalid);
    expect(field().validity.valueMissing).toBe(true);
    expect(field().checkValidity()).toBe(false);
    expect(field().matches(':invalid')).toBe(true);
    expect(field().shadowRoot.querySelector('.required-dot').getAttribute('aria-hidden')).toBe('true');
    container.querySelector('pastis-button').click();
    expect(submits).toHaveLength(0);
    expect(invalid).toHaveBeenCalled();
    field().value = '2026-11-25';
    await field().updateComplete;
    expect(field().validity.valid).toBe(true);
    container.querySelector('pastis-button').click();
    expect(submits).toHaveLength(1);
  });

  it('min and max make an out-of-range value invalid', async () => {
    container = await mount('<form><pastis-date-field label="Due date" min="2026-11-01" max="2026-11-30" value="2026-12-01"></pastis-date-field></form>');
    expect(field().validity.rangeOverflow).toBe(true);
    expect(field().validationMessage).not.toBe('');
    field().value = '2026-10-31';
    await field().updateComplete;
    expect(field().validity.rangeUnderflow).toBe(true);
    field().value = '2026-11-15';
    await field().updateComplete;
    expect(field().validity.valid).toBe(true);
  });

  it('a partly typed date is invalid (badInput)', async () => {
    container = await mount('<form><pastis-date-field label="Due date"></pastis-date-field></form>');
    input().focus();
    await userEvent.keyboard('11');
    expect(field().value).toBe('');
    expect(field().validity.badInput).toBe(true);
    expect(field().checkValidity()).toBe(false);
  });

  it('Enter in the input submits the form through its default button', async () => {
    container = await mount(`
      <form>
        <pastis-date-field label="Due date" name="due" value="2026-11-25"></pastis-date-field>
        <pastis-button type="submit" name="intent" value="save">Save</pastis-button>
      </form>`);
    const submits = captureSubmits(container.querySelector('form'));
    input().focus();
    await userEvent.keyboard('{Enter}');
    await tick();
    expect(submits).toHaveLength(1);
    expect(submits[0].data.get('due')).toBe('2026-11-25');
    expect(submits[0].data.get('intent')).toBe('save');
  });

  it('Enter does not submit when a listener prevents its default', async () => {
    container = await mount('<form><pastis-date-field label="Due date" value="2026-11-25"></pastis-date-field></form>');
    const submits = captureSubmits(container.querySelector('form'));
    field().addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    input().focus();
    await userEvent.keyboard('{Enter}');
    await tick();
    expect(submits).toHaveLength(0);
  });

  it('a disabled fieldset disables it and leaves it out of the form data', async () => {
    container = await mount('<form><fieldset disabled><pastis-date-field label="Due date" name="due" value="2026-11-25"></pastis-date-field></fieldset></form>');
    field().chips = [{ label: 'Today', value: '2026-11-25' }];
    await field().updateComplete;
    expect(field().matches(':disabled')).toBe(true);
    expect(input().disabled).toBe(true);
    expect(field().shadowRoot.querySelector('.chip').disabled).toBe(true);
    expect(field().shadowRoot.querySelector('.clear')).toBeNull();
    expect(new FormData(container.querySelector('form')).has('due')).toBe(false);
    container.querySelector('fieldset').disabled = false;
    await field().updateComplete;
    expect(input().disabled).toBe(false);
    expect(new FormData(container.querySelector('form')).get('due')).toBe('2026-11-25');
  });

  it('re-enabled after disabled, the input is enabled again', async () => {
    container = await mount('<form><pastis-date-field label="Due date" disabled></pastis-date-field></form>');
    expect(input().disabled).toBe(true);
    field().removeAttribute('disabled');
    await field().updateComplete;
    expect(input().disabled).toBe(false);
  });

  it('formStateRestoreCallback restores the value', async () => {
    container = await mount('<form><pastis-date-field label="Due date" name="due"></pastis-date-field></form>');
    field().formStateRestoreCallback('2026-11-25', 'restore');
    await field().updateComplete;
    expect(field().value).toBe('2026-11-25');
    expect(new FormData(container.querySelector('form')).get('due')).toBe('2026-11-25');
  });
});

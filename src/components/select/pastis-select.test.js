import { describe, it, expect, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import './pastis-select.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };
const LISTS = [
  { value: 'l1', label: 'Groceries' },
  { value: 'l2', label: 'Hardware' },
  { value: 'l3', label: 'Archived', disabled: true },
];

async function mount(markup, setup = () => {}) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  const el = container.querySelector('pastis-select');
  setup(el);
  await el.updateComplete;
  return { container, el, select: () => el.shadowRoot.querySelector('select') };
}

describe('pastis-select', () => {
  let container;
  afterEach(() => container?.remove());

  it('renders a native select with the options, showing the value', async () => {
    const m = await mount('<pastis-select label="List"></pastis-select>', el => {
      el.options = LISTS;
      el.value = 'l2';
    });
    container = m.container;
    expect([...m.select().options].map(o => o.textContent.trim())).toEqual(['Groceries', 'Hardware', 'Archived']);
    expect(m.select().value).toBe('l2');
    expect(m.select().options[2].disabled).toBe(true);
    expect(m.el.required).toBe(false);
    expect(m.el.disabled).toBe(false);
  });

  it('is a combobox named by its label as written', async () => {
    const m = await mount('<pastis-select label="Move to list"></pastis-select>', el => { el.options = LISTS; });
    container = m.container;
    await expect.element(page.getByRole('combobox', { name: 'Move to list', exact: true })).toBeInTheDocument();
  });

  it('takes aria-label without a visible label', async () => {
    const m = await mount('<pastis-select aria-label="List"></pastis-select>', el => { el.options = LISTS; });
    container = m.container;
    expect(m.select().getAttribute('aria-label')).toBe('List');
  });

  it('reports a pick with pastis-change', async () => {
    const m = await mount('<pastis-select label="List"></pastis-select>', el => {
      el.options = LISTS;
      el.value = 'l1';
    });
    container = m.container;
    const changes = [];
    m.el.addEventListener('pastis-change', e => changes.push(e.detail));
    await userEvent.selectOptions(m.select(), 'l2');
    expect(changes).toEqual([{ value: 'l2' }]);
    expect(m.el.value).toBe('l2');
  });

  it('follows a value set from outside', async () => {
    const m = await mount('<pastis-select label="List"></pastis-select>', el => { el.options = LISTS; });
    container = m.container;
    m.el.value = 'l2';
    await m.el.updateComplete;
    expect(m.select().value).toBe('l2');
  });

  it('takes part in a form: value, required, reset and a disabled fieldset', async () => {
    const m = await mount(`
      <form><fieldset><pastis-select label="List" name="list" required></pastis-select></fieldset></form>`, el => {
      el.options = [{ value: '', label: 'Choose a list' }, ...LISTS];
    });
    container = m.container;
    const form = container.querySelector('form');
    expect(m.el.checkValidity()).toBe(false);
    await userEvent.selectOptions(m.select(), 'l1');
    await m.el.updateComplete;
    expect(new FormData(form).get('list')).toBe('l1');
    expect(m.el.checkValidity()).toBe(true);
    form.reset();
    await m.el.updateComplete;
    expect(m.el.value).toBe('');
    container.querySelector('fieldset').disabled = true;
    await m.el.updateComplete;
    expect(m.select().disabled).toBe(true);
  });

  it('describes the field with its helper, or its error instead', async () => {
    const m = await mount('<pastis-select label="List" helper="Where the item lives"></pastis-select>', el => { el.options = LISTS; });
    container = m.container;
    const box = page.getByRole('combobox', { name: 'List' });
    await expect.element(box).toHaveAccessibleDescription('Where the item lives');
    m.el.error = 'Choose a list';
    await m.el.updateComplete;
    await expect.element(box).toHaveAccessibleDescription('Choose a list');
    expect(m.select().getAttribute('aria-invalid')).toBe('true');
  });

  it('disabled: no choosing', async () => {
    const m = await mount('<pastis-select label="List" disabled></pastis-select>', el => { el.options = LISTS; });
    container = m.container;
    expect(m.select().disabled).toBe(true);
  });

  it('is at least 44 px high and has no axe violations', async () => {
    document.body.style.background = '#0d0d0d';
    const m = await mount('<pastis-select label="List" helper="Where the item lives"></pastis-select>', el => { el.options = LISTS; });
    container = m.container;
    expect(m.select().getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    expect((await axe.run(container, AXE)).violations.map(v => v.id)).toEqual([]);
    document.body.style.background = '';
  });
});

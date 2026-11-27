import { describe, it, expect, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import './pastis-segmented-control.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };
const PRIORITY = [
  { value: '0', label: 'None' },
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'High' },
];

async function mount(attrs = '', value = '0') {
  const container = document.createElement('div');
  container.innerHTML = `<pastis-segmented-control label="Priority" ${attrs}></pastis-segmented-control>`;
  document.body.appendChild(container);
  const el = container.querySelector('pastis-segmented-control');
  el.options = PRIORITY;
  el.value = value;
  await el.updateComplete;
  const changes = [];
  el.addEventListener('pastis-change', e => changes.push(e.detail.value));
  const segment = (name) => el.shadowRoot.querySelector(`button:nth-child(${PRIORITY.findIndex(o => o.label === name) + 1})`);
  return { container, el, changes, segment };
}

describe('pastis-segmented-control', () => {
  let container;
  afterEach(() => container?.remove());

  it('is a radio group named by its label, the value checked', async () => {
    const m = await mount();
    container = m.container;
    await expect.element(page.getByRole('radiogroup', { name: 'Priority' })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: 'None' })).toHaveAttribute('aria-checked', 'true');
    await expect.element(page.getByRole('radio', { name: 'High' })).toHaveAttribute('aria-checked', 'false');
    expect(m.el.disabled).toBe(false);
    expect(m.el.labelHidden).toBe(false);
  });

  it('chooses with a click and says so', async () => {
    const m = await mount();
    container = m.container;
    await userEvent.click(m.segment('High'));
    expect(m.changes).toEqual(['3']);
    expect(m.el.value).toBe('3');
  });

  it('keeps its value when the change is cancelled (controlled)', async () => {
    const m = await mount();
    container = m.container;
    m.el.addEventListener('pastis-change', e => e.preventDefault());
    await userEvent.click(m.segment('High'));
    await m.el.updateComplete;
    expect(m.el.value).toBe('0');
    expect(m.segment('High').getAttribute('aria-checked')).toBe('false');
  });

  it('Tab reaches only the chosen segment; arrows, Home and End move and choose, wrapping', async () => {
    const m = await mount('', '1');
    container = m.container;
    expect([...m.el.shadowRoot.querySelectorAll('button')].map(b => b.tabIndex)).toEqual([-1, 0, -1, -1]);
    m.el.focus();
    expect(m.el.shadowRoot.activeElement).toBe(m.segment('Low'));
    await userEvent.keyboard('{ArrowRight}');
    expect(m.el.value).toBe('2');
    expect(m.el.shadowRoot.activeElement).toBe(m.segment('Medium'));
    await userEvent.keyboard('{End}');
    expect(m.el.value).toBe('3');
    await userEvent.keyboard('{ArrowRight}');
    expect(m.el.value).toBe('0');
    await userEvent.keyboard('{ArrowLeft}');
    await userEvent.keyboard('{Home}');
    expect(m.changes).toEqual(['2', '3', '0', '3', '0']);
  });

  it('label-hidden keeps the name but not the visible label', async () => {
    const m = await mount('label-hidden');
    container = m.container;
    expect(m.el.shadowRoot.querySelector('.label').getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await expect.element(page.getByRole('radiogroup', { name: 'Priority' })).toBeInTheDocument();
  });

  it('disabled: no choosing', async () => {
    const m = await mount('disabled');
    container = m.container;
    expect(m.segment('High').disabled).toBe(true);
    m.el.shadowRoot.querySelector('.group').dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(m.changes).toEqual([]);
  });

  it('segments are at least 44 px; no axe violations, plain and focused', async () => {
    document.body.style.background = '#0d0d0d';
    const m = await mount();
    container = m.container;
    expect(m.segment('Low').getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    expect((await axe.run(container, AXE)).violations.map(v => v.id)).toEqual([]);
    m.el.focus();
    expect((await axe.run(container, AXE)).violations.map(v => v.id)).toEqual([]);
    document.body.style.background = '';
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import './pastis-filter-chip.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };

describe('pastis-filter-chip', () => {
  let el;
  const chip = () => el.shadowRoot.querySelector('.chip');

  beforeEach(async () => {
    document.body.style.background = '#0d0d0d';
    el = document.createElement('pastis-filter-chip');
    el.label = 'groceries';
    el.value = 't1';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
    document.body.style.background = '';
  });

  it('is a toggle button named by its label, not pressed by default', async () => {
    await expect.element(page.getByRole('button', { name: 'groceries' })).toHaveAttribute('aria-pressed', 'false');
    expect(el.labelCase).toBe('upper');
  });

  it('shows its label in capitals by default and as written with label-case="none"', async () => {
    expect(getComputedStyle(chip()).textTransform).toBe('uppercase');
    el.labelCase = 'none';
    await el.updateComplete;
    expect(el.getAttribute('label-case')).toBe('none');
    expect(getComputedStyle(chip()).textTransform).toBe('none');
  });

  it('toggles with a click and reports the new state', async () => {
    const toggles = [];
    el.addEventListener('pastis-toggle', e => toggles.push(e.detail));
    await userEvent.click(chip());
    expect(el.selected).toBe(true);
    expect(toggles).toEqual([{ selected: true, value: 't1' }]);
  });

  it('keeps its state when the toggle is cancelled (controlled)', async () => {
    el.addEventListener('pastis-toggle', e => e.preventDefault());
    await userEvent.click(chip());
    await el.updateComplete;
    expect(el.selected).toBe(false);
    expect(chip().getAttribute('aria-pressed')).toBe('false');
  });

  it('offers removal with a named button', async () => {
    el.removable = true;
    await el.updateComplete;
    const removed = [];
    el.addEventListener('pastis-remove', e => removed.push(e.detail));
    await userEvent.click(el.shadowRoot.querySelector('.remove'));
    expect(removed).toEqual([{ value: 't1' }]);
    await expect.element(page.getByRole('button', { name: 'Remove groceries' })).toBeInTheDocument();
  });

  it('does nothing while disabled', async () => {
    el.disabled = true;
    await el.updateComplete;
    expect(chip().disabled).toBe(true);
  });

  it('has no axe violations, plain and selected, also hovered', async () => {
    await userEvent.hover(chip());
    expect((await axe.run(el, AXE)).violations.map(v => [v.id, v.nodes.map(n => n.failureSummary)])).toEqual([]);
    el.selected = true;
    await el.updateComplete;
    // Its colours transition (120 ms): measure the settled state.
    await new Promise(resolve => setTimeout(resolve, 200));
    expect((await axe.run(el, AXE)).violations.map(v => [v.id, v.nodes.map(n => n.failureSummary)])).toEqual([]);
  });
});

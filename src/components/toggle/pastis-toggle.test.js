import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import './pastis-toggle.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };

describe('pastis-toggle', () => {
  let el;
  const input = () => el.shadowRoot.querySelector('input');

  beforeEach(async () => {
    document.body.style.background = '#0d0d0d';
    el = document.createElement('pastis-toggle');
    el.label = 'Reminders';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
    document.body.style.background = '';
  });

  it('renders a switch named by its label, off by default', async () => {
    expect(el.checked).toBe(false);
    expect(el.disabled).toBe(false);
    await expect.element(page.getByRole('switch', { name: 'Reminders' })).toBeInTheDocument();
  });

  it('turns on with a click and says so', async () => {
    const changes = [];
    el.addEventListener('pastis-change', e => changes.push(e.detail));
    await userEvent.click(el.shadowRoot.querySelector('label'));
    expect(el.checked).toBe(true);
    expect(changes).toEqual([{ checked: true }]);
  });

  it('stays as it was when the change is cancelled (controlled)', async () => {
    el.addEventListener('pastis-change', e => e.preventDefault());
    await userEvent.click(el.shadowRoot.querySelector('label'));
    await el.updateComplete;
    expect(el.checked).toBe(false);
    expect(input().checked).toBe(false);
  });

  it('turns with Space from the keyboard', async () => {
    input().focus();
    await userEvent.keyboard(' ');
    expect(el.checked).toBe(true);
  });

  it('does nothing while disabled', async () => {
    el.disabled = true;
    await el.updateComplete;
    expect(input().disabled).toBe(true);
  });

  it('has no axe violations, off and on', async () => {
    expect((await axe.run(el, AXE)).violations).toEqual([]);
    el.checked = true;
    await el.updateComplete;
    expect((await axe.run(el, AXE)).violations).toEqual([]);
  });
});

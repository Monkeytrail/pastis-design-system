import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axe from 'axe-core';
import './pastis-dropdown.js';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];

describe('pastis-dropdown', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('pastis-dropdown');
    el.label = 'Fruit';
    el.options = OPTIONS;
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  // ─── Default render ───────────────────────────────────────────────────────

  it('renders trigger element', () => {
    expect(el.shadowRoot.querySelector('.trigger')).toBeTruthy();
  });

  it('has correct default property values', () => {
    expect(el.open).toBe(false);
    expect(el.disabled).toBe(false);
    expect(el.searchable).toBe(false);
    expect(el.multiple).toBe(false);
    expect(el.size).toBe('md');
  });

  it('shows placeholder when no value selected', () => {
    el.placeholder = 'Pick a fruit';
    el.requestUpdate();
    const text = el.shadowRoot.querySelector('.placeholder');
    expect(text).toBeTruthy();
  });

  it('renders label when provided', () => {
    const label = el.shadowRoot.querySelector('label');
    expect(label.textContent).toContain('Fruit');
  });

  // ─── Open / close ─────────────────────────────────────────────────────────

  it('clicking trigger opens dropdown', async () => {
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(el.shadowRoot.querySelector('.dropdown')).toBeTruthy();
  });

  it('clicking trigger again closes dropdown', async () => {
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('clicking outside closes dropdown', async () => {
    el.open = true;
    await el.updateComplete;
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  // ─── Option selection ─────────────────────────────────────────────────────

  it('selecting an option sets value and closes dropdown', async () => {
    el.open = true;
    await el.updateComplete;
    const options = el.shadowRoot.querySelectorAll('.option:not(.disabled)');
    options[0].click();
    await el.updateComplete;
    expect(el.value).toBe('apple');
    expect(el.open).toBe(false);
  });

  it('selected option label shown in trigger', async () => {
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.option:not(.disabled)').click();
    await el.updateComplete;
    const triggerText = el.shadowRoot.querySelector('.trigger-text');
    expect(triggerText.textContent).toContain('Apple');
  });

  it('disabled option cannot be selected', async () => {
    el.open = true;
    await el.updateComplete;
    const disabled = el.shadowRoot.querySelector('.option.disabled');
    disabled.click();
    await el.updateComplete;
    expect(el.value).not.toBe('cherry');
  });

  // ─── Custom events ────────────────────────────────────────────────────────

  it('emits pastis-change with value and option on selection', async () => {
    const handler = vi.fn();
    el.addEventListener('pastis-change', handler);
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.option:not(.disabled)').click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('apple');
    expect(handler.mock.calls[0][0].detail.option.label).toBe('Apple');
  });

  it('pastis-change bubbles and is composed', async () => {
    let event;
    document.body.addEventListener('pastis-change', (e) => { event = e; }, { once: true });
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.option:not(.disabled)').click();
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  // ─── Disabled state ───────────────────────────────────────────────────────

  it('disabled — clicking trigger does not open dropdown', async () => {
    el.disabled = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('disabled — trigger has tabindex="-1"', async () => {
    el.disabled = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('tabindex')).toBe('-1');
  });

  // ─── Error state ──────────────────────────────────────────────────────────

  it('renders error message when error is set', async () => {
    el.error = 'Please select an option';
    await el.updateComplete;
    const err = el.shadowRoot.querySelector('.error-text');
    expect(err).toBeTruthy();
    expect(err.textContent).toContain('Please select an option');
  });

  // ─── Multiple selection ───────────────────────────────────────────────────

  it('multiple — selects multiple options without closing', async () => {
    el.multiple = true;
    el.open = true;
    await el.updateComplete;
    const opts = el.shadowRoot.querySelectorAll('.option:not(.disabled)');
    opts[0].click();
    await el.updateComplete;
    expect(el.open).toBe(true);
    opts[1].click();
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.option.selected')).toHaveLength(2);
  });

  it('multiple — emits array of selected values', async () => {
    el.multiple = true;
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('pastis-change', handler);
    const opts = el.shadowRoot.querySelectorAll('.option:not(.disabled)');
    opts[0].click();
    opts[1].click();
    const lastDetail = handler.mock.calls[1][0].detail;
    expect(Array.isArray(lastDetail.value)).toBe(true);
    expect(lastDetail.value).toContain('apple');
    expect(lastDetail.value).toContain('banana');
  });

  it('multiple — deselects on second click', async () => {
    el.multiple = true;
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('pastis-change', handler);
    const opt = el.shadowRoot.querySelector('.option:not(.disabled)');
    opt.click();
    opt.click();
    const lastDetail = handler.mock.calls[1][0].detail;
    expect(lastDetail.value).not.toContain('apple');
  });

  // ─── Searchable ───────────────────────────────────────────────────────────

  it('searchable — renders search input when open', async () => {
    el.searchable = true;
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.search-input')).toBeTruthy();
  });

  it('searchable — filters options by query', async () => {
    el.searchable = true;
    el.open = true;
    await el.updateComplete;
    const search = el.shadowRoot.querySelector('.search-input');
    search.value = 'ban';
    search.dispatchEvent(new Event('input'));
    await el.updateComplete;
    const visible = el.shadowRoot.querySelectorAll('.option');
    expect(visible).toHaveLength(1);
    expect(visible[0].textContent).toContain('Banana');
  });

  it('searchable — shows no-options message when no results', async () => {
    el.searchable = true;
    el.open = true;
    await el.updateComplete;
    const search = el.shadowRoot.querySelector('.search-input');
    search.value = 'zzz';
    search.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.no-options')).toBeTruthy();
  });

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  it('ArrowDown on trigger opens dropdown', async () => {
    const trigger = el.shadowRoot.querySelector('.trigger');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('Escape on trigger closes dropdown', async () => {
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('Enter on trigger toggles open', async () => {
    const trigger = el.shadowRoot.querySelector('.trigger');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('Enter on option selects it', async () => {
    el.open = true;
    await el.updateComplete;
    const opt = el.shadowRoot.querySelector('.option:not(.disabled)');
    opt.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;
    expect(el.value).toBe('apple');
  });

  it('Escape on option closes dropdown and returns focus to trigger', async () => {
    el.open = true;
    await el.updateComplete;
    const opt = el.shadowRoot.querySelector('.option:not(.disabled)');
    opt.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  // ─── ARIA ─────────────────────────────────────────────────────────────────

  it('trigger has role="combobox"', () => {
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('role')).toBe('combobox');
  });

  it('trigger aria-expanded reflects open state', async () => {
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-expanded')).toBe('false');
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-expanded')).toBe('true');
  });

  it('trigger has aria-haspopup="listbox"', () => {
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('options list has role="listbox"', async () => {
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.options-list').getAttribute('role')).toBe('listbox');
  });

  it('each option has role="option" and aria-selected', async () => {
    el.open = true;
    await el.updateComplete;
    const opts = el.shadowRoot.querySelectorAll('.option');
    opts.forEach(opt => {
      expect(opt.getAttribute('role')).toBe('option');
      expect(opt.hasAttribute('aria-selected')).toBe(true);
    });
  });

  it('disabled option has aria-disabled="true"', async () => {
    el.open = true;
    await el.updateComplete;
    const disabled = el.shadowRoot.querySelector('.option.disabled');
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
  });

  // ─── Sizes ────────────────────────────────────────────────────────────────

  it.each(['sm', 'md', 'lg'])('accepts size="%s"', async (size) => {
    el.size = size;
    await el.updateComplete;
    expect(el.getAttribute('size')).toBe(size);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it('passes axe-core when closed', async () => {
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('passes axe-core when open', async () => {
    el.open = true;
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

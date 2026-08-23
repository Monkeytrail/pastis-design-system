import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axe from 'axe-core';
import './pastis-button.js';

describe('pastis-button', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('pastis-button');
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  // ─── Default render ───────────────────────────────────────────────────────

  it('renders a <button> element in shadow DOM', async () => {
    const btn = el.shadowRoot.querySelector('button');
    expect(btn).toBeTruthy();
  });

  it('has correct default property values', () => {
    expect(el.variant).toBe('primary');
    expect(el.size).toBe('md');
    expect(el.disabled).toBe(false);
    expect(el.loading).toBe(false);
  });

  it('reflects variant and size to attributes', () => {
    expect(el.getAttribute('variant')).toBe('primary');
    expect(el.getAttribute('size')).toBe('md');
  });

  // ─── Boolean props ────────────────────────────────────────────────────────

  it('disabled — sets [disabled] attribute on host and native button', async () => {
    el.disabled = true;
    await el.updateComplete;
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.shadowRoot.querySelector('button').disabled).toBe(true);
  });

  it('loading — sets aria-busy and renders spinner', async () => {
    el.loading = true;
    await el.updateComplete;
    const btn = el.shadowRoot.querySelector('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(el.shadowRoot.querySelector('.spinner')).toBeTruthy();
  });

  it('loading — disables the native button while loading', async () => {
    el.loading = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('button').disabled).toBe(true);
  });

  it('spinner is aria-hidden', async () => {
    el.loading = true;
    await el.updateComplete;
    const spinner = el.shadowRoot.querySelector('.spinner');
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
  });

  // ─── Variants ─────────────────────────────────────────────────────────────

  it.each(['primary', 'secondary', 'ghost', 'destructive'])(
    'accepts variant="%s"',
    async (variant) => {
      el.variant = variant;
      await el.updateComplete;
      expect(el.getAttribute('variant')).toBe(variant);
    }
  );

  // ─── Slots ────────────────────────────────────────────────────────────────

  it('projects slotted text content', async () => {
    el.textContent = 'Click me';
    await el.updateComplete;
    expect(el.textContent).toBe('Click me');
  });

  // ─── Custom events ────────────────────────────────────────────────────────

  it('emits pastis-click on click', async () => {
    const handler = vi.fn();
    el.addEventListener('pastis-click', handler);
    el.shadowRoot.querySelector('button').click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does NOT emit pastis-click when disabled', async () => {
    el.disabled = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('pastis-click', handler);
    el.shadowRoot.querySelector('button').click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT emit pastis-click when loading', async () => {
    el.loading = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('pastis-click', handler);
    el.shadowRoot.querySelector('button').click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('pastis-click bubbles and is composed', async () => {
    let event;
    document.body.addEventListener('pastis-click', (e) => { event = e; }, { once: true });
    el.shadowRoot.querySelector('button').click();
    expect(event).toBeTruthy();
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  // ─── Focus ────────────────────────────────────────────────────────────────

  it('button is focusable', async () => {
    const btn = el.shadowRoot.querySelector('button');
    btn.focus();
    expect(el.shadowRoot.activeElement).toBe(btn);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it('passes axe-core with labelled slot content', async () => {
    el.textContent = 'Submit';
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

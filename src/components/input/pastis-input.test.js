import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axe from 'axe-core';
import './pastis-input.js';

describe('pastis-input', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('pastis-input');
    el.label = 'Email';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  // ─── Default render ───────────────────────────────────────────────────────

  it('renders a native <input> element', () => {
    expect(el.shadowRoot.querySelector('input')).toBeTruthy();
  });

  it('has correct default property values', () => {
    expect(el.type).toBe('text');
    expect(el.value).toBe('');
    expect(el.disabled).toBe(false);
    expect(el.readonly).toBe(false);
    expect(el.required).toBe(false);
    expect(el.size).toBe('md');
  });

  it('renders label when provided', () => {
    const label = el.shadowRoot.querySelector('label');
    expect(label).toBeTruthy();
    expect(label.textContent).toContain('Email');
  });

  it('label is associated with input via for/id', () => {
    const label = el.shadowRoot.querySelector('label');
    const input = el.shadowRoot.querySelector('input');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  // ─── Boolean props ────────────────────────────────────────────────────────

  it('disabled — native input is disabled', async () => {
    el.disabled = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').disabled).toBe(true);
  });

  it('readonly — native input has readonly attribute', async () => {
    el.readonly = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').readOnly).toBe(true);
  });

  it('required — native input is required', async () => {
    el.required = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').required).toBe(true);
  });

  it('required — renders required indicator and sr-only text', async () => {
    el.required = true;
    await el.updateComplete;
    const dot = el.shadowRoot.querySelector('.required-dot');
    const sr = el.shadowRoot.querySelector('.sr-only');
    expect(dot).toBeTruthy();
    expect(sr.textContent).toContain('required');
  });

  it('required dot is aria-hidden', async () => {
    el.required = true;
    await el.updateComplete;
    const dot = el.shadowRoot.querySelector('.required-dot');
    expect(dot.getAttribute('aria-hidden')).toBe('true');
  });

  // ─── Error state ──────────────────────────────────────────────────────────

  it('error — sets aria-invalid on input', async () => {
    el.error = 'This field is required';
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('error — renders error message with role="alert"', async () => {
    el.error = 'Invalid email';
    await el.updateComplete;
    const msg = el.shadowRoot.querySelector('.error-text');
    expect(msg).toBeTruthy();
    expect(msg.textContent).toContain('Invalid email');
    expect(msg.getAttribute('role')).toBe('alert');
  });

  it('error — input aria-describedby points to error element', async () => {
    el.error = 'Bad value';
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-describedby')).toBe('error');
  });

  it('no error — aria-invalid is false', async () => {
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  // ─── Helper text ──────────────────────────────────────────────────────────

  it('helper — renders helper text', async () => {
    el.helper = 'We will never share your email';
    await el.updateComplete;
    const helper = el.shadowRoot.querySelector('.helper-text');
    expect(helper).toBeTruthy();
    expect(helper.textContent).toContain('We will never share your email');
  });

  it('helper — input aria-describedby points to helper element', async () => {
    el.helper = 'Hint text';
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-describedby')).toBe('helper');
  });

  // ─── Icons ────────────────────────────────────────────────────────────────

  it('leadingIcon — renders leading icon and adds has-leading class', async () => {
    el.leadingIcon = '✉';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.leading-icon')).toBeTruthy();
    expect(el.shadowRoot.querySelector('.has-leading')).toBeTruthy();
  });

  it('trailingIcon — renders trailing icon and adds has-trailing class', async () => {
    el.trailingIcon = '✓';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trailing-icon')).toBeTruthy();
    expect(el.shadowRoot.querySelector('.has-trailing')).toBeTruthy();
  });

  it('icons are aria-hidden', async () => {
    el.leadingIcon = '✉';
    el.trailingIcon = '✓';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.leading-icon').getAttribute('aria-hidden')).toBe('true');
    expect(el.shadowRoot.querySelector('.trailing-icon').getAttribute('aria-hidden')).toBe('true');
  });

  // ─── Custom events ────────────────────────────────────────────────────────

  it('emits pastis-input with value on input', async () => {
    const handler = vi.fn();
    el.addEventListener('pastis-input', handler);
    const input = el.shadowRoot.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('hello');
  });

  it('emits pastis-change with value on change', async () => {
    const handler = vi.fn();
    el.addEventListener('pastis-change', handler);
    const input = el.shadowRoot.querySelector('input');
    input.value = 'world';
    input.dispatchEvent(new Event('change'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('world');
  });

  it('pastis-input bubbles and is composed', () => {
    let event;
    document.body.addEventListener('pastis-input', (e) => { event = e; }, { once: true });
    const input = el.shadowRoot.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  // ─── Sizes ────────────────────────────────────────────────────────────────

  it.each(['sm', 'md', 'lg'])('accepts size="%s"', async (size) => {
    el.size = size;
    await el.updateComplete;
    expect(el.getAttribute('size')).toBe(size);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it('passes axe-core in default state', async () => {
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('passes axe-core in error state', async () => {
    el.error = 'Required field';
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('passes axe-core when required', async () => {
    el.required = true;
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

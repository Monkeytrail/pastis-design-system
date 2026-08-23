import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axe from 'axe-core';
import './pastis-modal.js';

describe('pastis-modal', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('pastis-modal');
    el.title = 'Confirm action';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(async () => {
    // Always close cleanly so body overflow is restored
    el.open = false;
    await el.updateComplete;
    el.remove();
    document.body.style.overflow = '';
  });

  // ─── Default render ───────────────────────────────────────────────────────

  it('renders nothing when closed', () => {
    expect(el.shadowRoot.querySelector('.backdrop')).toBeNull();
  });

  it('has correct default property values', () => {
    expect(el.open).toBe(false);
    expect(el.closable).toBe(true);
    expect(el.persistent).toBe(false);
    expect(el.size).toBe('md');
  });

  // ─── Open / close ─────────────────────────────────────────────────────────

  it('renders backdrop and dialog when open=true', async () => {
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.backdrop')).toBeTruthy();
    expect(el.shadowRoot.querySelector('.dialog')).toBeTruthy();
  });

  it('close() sets open to false and emits pastis-close', async () => {
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('pastis-close', handler);
    el.close();
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('pastis-close bubbles and is composed', async () => {
    el.open = true;
    await el.updateComplete;
    let event;
    document.body.addEventListener('pastis-close', (e) => { event = e; }, { once: true });
    el.close();
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  // ─── Close button ─────────────────────────────────────────────────────────

  it('renders close button when closable=true', async () => {
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.close-btn')).toBeTruthy();
  });

  it('close button has aria-label', async () => {
    el.open = true;
    await el.updateComplete;
    const btn = el.shadowRoot.querySelector('.close-btn');
    expect(btn.getAttribute('aria-label')).toBeTruthy();
  });

  it('does not render close button when closable=false', async () => {
    el.closable = false;
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.close-btn')).toBeNull();
  });

  it('clicking close button closes the modal', async () => {
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.close-btn').click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  // ─── Backdrop click ───────────────────────────────────────────────────────

  it('clicking backdrop closes modal when not persistent', async () => {
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.backdrop').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('clicking backdrop does NOT close modal when persistent=true', async () => {
    el.persistent = true;
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.backdrop').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  it('Escape closes modal when not persistent', async () => {
    el.open = true;
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('Escape does NOT close modal when persistent=true', async () => {
    el.persistent = true;
    el.open = true;
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  // ─── Body scroll lock ─────────────────────────────────────────────────────

  it('locks body overflow when opened', async () => {
    el.open = true;
    await el.updateComplete;
    // Wait for requestAnimationFrame
    await new Promise(r => requestAnimationFrame(r));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', async () => {
    el.open = true;
    await el.updateComplete;
    el.open = false;
    await el.updateComplete;
    expect(document.body.style.overflow).toBe('');
  });

  // ─── Slots ────────────────────────────────────────────────────────────────

  it('projects default slot content into modal body', async () => {
    el.open = true;
    const p = document.createElement('p');
    p.textContent = 'Modal body content';
    el.appendChild(p);
    await el.updateComplete;
    expect(el.querySelector('p').textContent).toBe('Modal body content');
  });

  it('projects footer slot content', async () => {
    el.open = true;
    const footer = document.createElement('div');
    footer.slot = 'footer';
    footer.textContent = 'Footer actions';
    el.appendChild(footer);
    await el.updateComplete;
    expect(el.querySelector('[slot="footer"]').textContent).toBe('Footer actions');
  });

  // ─── ARIA ─────────────────────────────────────────────────────────────────

  it('backdrop has role="dialog" and aria-modal="true"', async () => {
    el.open = true;
    await el.updateComplete;
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    expect(backdrop.getAttribute('role')).toBe('dialog');
    expect(backdrop.getAttribute('aria-modal')).toBe('true');
  });

  it('backdrop has aria-label from title', async () => {
    el.open = true;
    await el.updateComplete;
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    expect(backdrop.getAttribute('aria-label')).toBe('Confirm action');
  });

  // ─── Sizes ────────────────────────────────────────────────────────────────

  it.each(['sm', 'md', 'lg', 'xl', 'full'])('accepts size="%s"', async (size) => {
    el.size = size;
    el.open = true;
    await el.updateComplete;
    expect(el.getAttribute('size')).toBe(size);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it('passes axe-core when open', async () => {
    el.open = true;
    el.innerHTML = '<p>Modal content</p>';
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

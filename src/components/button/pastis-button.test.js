import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
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

describe('pastis-button with href', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('pastis-button');
    el.href = 'https://example.com';
    el.target = '_blank';
    el.textContent = 'Open';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  it('renders a link instead of a button', () => {
    const link = el.shadowRoot.querySelector('a');
    expect(link).toBeTruthy();
    expect(el.shadowRoot.querySelector('button')).toBeNull();
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  it('adds rel="noopener noreferrer" for target="_blank"', () => {
    const link = el.shadowRoot.querySelector('a');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('removes href and sets aria-disabled when disabled', async () => {
    el.disabled = true;
    await el.updateComplete;
    const link = el.shadowRoot.querySelector('a');
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBe('true');
  });

  it('stays a button when copy is set', async () => {
    el.copy = 'hello';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('button')).toBeTruthy();
    expect(el.shadowRoot.querySelector('a')).toBeNull();
  });

  it('passes axe-core', async () => {
    const results = await axe.run(el);
    expect(results.violations).toEqual([]);
  });
});

// ─── Forms ──────────────────────────────────────────────────────────────────

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  return container;
}

function captureSubmits(form) {
  const submits = [];
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submits.push({ data: new FormData(form, e.submitter), submitter: e.submitter });
  });
  return submits;
}

const settingsForm = (buttons) => `
  <form>
    <input name="title" value="Groceries" required>
    ${buttons}
  </form>`;

describe('pastis-button in a form', () => {
  let container;
  afterEach(() => container?.remove());

  it('is form-associated', async () => {
    container = await mount(settingsForm('<pastis-button>Cancel</pastis-button>'));
    expect(customElements.get('pastis-button').formAssociated).toBe(true);
    expect(container.querySelector('pastis-button').form).toBe(container.querySelector('form'));
  });

  it('defaults to type="button" and does not submit', async () => {
    container = await mount(settingsForm('<pastis-button>Cancel</pastis-button>'));
    const submits = captureSubmits(container.querySelector('form'));
    const button = container.querySelector('pastis-button');
    expect(button.type).toBe('button');
    button.shadowRoot.querySelector('button').click();
    expect(submits).toHaveLength(0);
  });

  it('type="submit" submits the form once, with its name/value as submitter', async () => {
    container = await mount(settingsForm('<pastis-button type="submit" name="intent" value="save">Save</pastis-button>'));
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelector('pastis-button').shadowRoot.querySelector('button').click();
    expect(submits).toHaveLength(1);
    expect(submits[0].data.get('title')).toBe('Groceries');
    expect(submits[0].data.get('intent')).toBe('save');
    // The stand-in submitter is gone again
    expect(container.querySelectorAll('form button')).toHaveLength(0);
  });

  it('the submitter tells two submit buttons apart', async () => {
    container = await mount(settingsForm(`
      <pastis-button type="submit" name="intent" value="save">Save</pastis-button>
      <pastis-button type="submit" name="intent" value="archive">Archive</pastis-button>`));
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelectorAll('pastis-button')[1].click();
    expect(submits[0].data.get('intent')).toBe('archive');
  });

  it('type="submit" runs validation first', async () => {
    container = await mount(settingsForm('<pastis-button type="submit">Save</pastis-button>'));
    const form = container.querySelector('form');
    const submits = captureSubmits(form);
    form.querySelector('input').value = '';
    container.querySelector('pastis-button').click();
    expect(submits).toHaveLength(0);
  });

  it('activating with the keyboard submits', async () => {
    container = await mount(settingsForm('<pastis-button type="submit">Save</pastis-button>'));
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelector('pastis-button').focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(submits).toHaveLength(2);
  });

  it('type="reset" resets the form', async () => {
    container = await mount(settingsForm('<pastis-button type="reset">Reset</pastis-button>'));
    const input = container.querySelector('input');
    input.value = 'Hardware store';
    const onReset = vi.fn();
    container.querySelector('form').addEventListener('reset', onReset);
    container.querySelector('pastis-button').click();
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('Groceries');
  });

  it('disabled or loading submit buttons do not submit', async () => {
    container = await mount(settingsForm(`
      <pastis-button type="submit" disabled>Save</pastis-button>
      <pastis-button type="submit" loading>Saving</pastis-button>`));
    const submits = captureSubmits(container.querySelector('form'));
    for (const b of container.querySelectorAll('pastis-button')) b.shadowRoot.querySelector('button').click();
    expect(submits).toHaveLength(0);
  });

  it('a disabled fieldset disables it', async () => {
    container = await mount(`<form><fieldset disabled><pastis-button type="submit">Save</pastis-button></fieldset></form>`);
    const button = container.querySelector('pastis-button');
    const submits = captureSubmits(container.querySelector('form'));
    await button.updateComplete;
    expect(button.matches(':disabled')).toBe(true);
    expect(button.shadowRoot.querySelector('button').disabled).toBe(true);
    button.shadowRoot.querySelector('button').click();
    expect(submits).toHaveLength(0);
    container.querySelector('fieldset').disabled = false;
    await button.updateComplete;
    expect(button.shadowRoot.querySelector('button').disabled).toBe(false);
  });

  it('a link (href) never submits', async () => {
    container = await mount(settingsForm('<pastis-button type="submit" href="#help">Help</pastis-button>'));
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelector('pastis-button').shadowRoot.querySelector('a').click();
    expect(submits).toHaveLength(0);
  });

  it('the inner <button> is never a native submit button', async () => {
    container = await mount(settingsForm('<pastis-button>Cancel</pastis-button>'));
    expect(container.querySelector('pastis-button').shadowRoot.querySelector('button').type).toBe('button');
  });
});

describe('pastis-button focus and click', () => {
  let container;
  afterEach(() => container?.remove());

  it('focus() on the host focuses the inner button', async () => {
    container = await mount('<pastis-button>Save</pastis-button>');
    const button = container.querySelector('pastis-button');
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.shadowRoot.activeElement).toBe(button.shadowRoot.querySelector('button'));
  });

  it('click() on the host activates it (pastis-click)', async () => {
    container = await mount('<pastis-button>Save</pastis-button>');
    const handler = vi.fn();
    container.addEventListener('pastis-click', handler);
    container.querySelector('pastis-button').click();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('pastis-button ARIA passthrough', () => {
  let container;
  afterEach(() => container?.remove());

  it('aria-label names the inner button', async () => {
    container = await mount('<pastis-button variant="ghost" aria-label="Rename Groceries">✎</pastis-button>');
    const inner = container.querySelector('pastis-button').shadowRoot.querySelector('button');
    expect(inner.getAttribute('aria-label')).toBe('Rename Groceries');
    await expect.element(page.getByRole('button', { name: 'Rename Groceries' })).toBeInTheDocument();
  });

  it('aria-pressed reaches the inner button and its state', async () => {
    container = await mount('<pastis-button aria-pressed="true">Open</pastis-button><pastis-button aria-pressed="false">Done</pastis-button>');
    const [open, done] = container.querySelectorAll('pastis-button');
    expect(open.shadowRoot.querySelector('button').getAttribute('aria-pressed')).toBe('true');
    await expect.element(page.getByRole('button', { name: 'Open', pressed: true })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Done', pressed: false })).toBeInTheDocument();
    open.setAttribute('aria-pressed', 'false');
    await open.updateComplete;
    await expect.element(page.getByRole('button', { name: 'Open', pressed: false })).toBeInTheDocument();
    open.removeAttribute('aria-pressed');
    await open.updateComplete;
    expect(open.shadowRoot.querySelector('button').hasAttribute('aria-pressed')).toBe(false);
    expect(done).toBeTruthy();
  });

  it('aria-expanded, aria-haspopup and aria-current reach the inner button', async () => {
    container = await mount('<pastis-button aria-expanded="false" aria-haspopup="menu" aria-current="page">Lists</pastis-button>');
    const inner = container.querySelector('pastis-button').shadowRoot.querySelector('button');
    expect(inner.getAttribute('aria-expanded')).toBe('false');
    expect(inner.getAttribute('aria-haspopup')).toBe('menu');
    expect(inner.getAttribute('aria-current')).toBe('page');
    await expect.element(page.getByRole('button', { name: 'Lists', expanded: false })).toBeInTheDocument();
  });

  it('aria-labelledby and aria-describedby resolve across the shadow boundary', async () => {
    container = await mount(`
      <h3 id="list-name">Groceries</h3>
      <p id="delete-hint">Deletes the list and its 12 items</p>
      <pastis-button variant="destructive" aria-labelledby="list-name" aria-describedby="delete-hint">✕</pastis-button>`);
    await expect.element(page.getByRole('button', { name: 'Groceries' })).toBeInTheDocument();
    // Chrome's own accessibility tree (the test page runs in an iframe of the runner)
    const session = cdp();
    await session.send('Accessibility.enable');
    const { frameTree } = await session.send('Page.getFrameTree');
    const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
    const buttons = nodes.filter(n => !n.ignored && n.role?.value === 'button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].name.value).toBe('Groceries');
    expect(buttons[0].description.value).toBe('Deletes the list and its 12 items');
  });

  it('aria-controls references the controlled element', async () => {
    container = await mount('<pastis-button aria-controls="menu" aria-expanded="true">Menu</pastis-button><ul id="menu"><li>Lists</li></ul>');
    const inner = container.querySelector('pastis-button').shadowRoot.querySelector('button');
    if ('ariaControlsElements' in inner) {
      expect(inner.ariaControlsElements).toEqual([container.querySelector('#menu')]);
    }
  });

  it('works on the link form too', async () => {
    container = await mount('<pastis-button href="/lists" aria-label="All lists" aria-current="page">☰</pastis-button>');
    const link = container.querySelector('pastis-button').shadowRoot.querySelector('a');
    expect(link.getAttribute('aria-label')).toBe('All lists');
    expect(link.getAttribute('aria-current')).toBe('page');
    await expect.element(page.getByRole('link', { name: 'All lists' })).toBeInTheDocument();
  });

  it('the host exposes no second button role', async () => {
    container = await mount('<pastis-button aria-label="Rename Groceries" aria-pressed="false">✎</pastis-button>');
    expect(container.querySelector('pastis-button').hasAttribute('role')).toBe(false);
    expect(page.getByRole('button', { name: 'Rename Groceries' }).elements()).toHaveLength(1);
  });

  it('passes axe with forwarded ARIA', async () => {
    container = await mount(`
      <pastis-button variant="ghost" aria-label="Rename Groceries">✎</pastis-button>
      <pastis-button aria-pressed="true">Open</pastis-button>
      <pastis-button aria-expanded="false" aria-haspopup="menu" aria-controls="m">More</pastis-button>
      <ul id="m" hidden><li>Archive</li></ul>`);
    const results = await axe.run(container, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

// ─── Review fixes ───────────────────────────────────────────────────────────

describe('pastis-button activation is the click default action', () => {
  let container;
  afterEach(() => container?.remove());

  it('a host click listener calling preventDefault stops submit', async () => {
    container = await mount(settingsForm('<pastis-button type="submit">Save</pastis-button>'));
    const submits = captureSubmits(container.querySelector('form'));
    const button = container.querySelector('pastis-button');
    button.addEventListener('click', e => e.preventDefault());
    button.click();
    await new Promise(r => setTimeout(r));
    expect(submits).toHaveLength(0);
  });

  it('a document click listener calling preventDefault stops reset', async () => {
    container = await mount(settingsForm('<pastis-button type="reset">Reset</pastis-button>'));
    const input = container.querySelector('input');
    input.value = 'Hardware store';
    const prevent = e => e.preventDefault();
    document.addEventListener('click', prevent);
    container.querySelector('pastis-button').click();
    document.removeEventListener('click', prevent);
    await new Promise(r => setTimeout(r));
    expect(input.value).toBe('Hardware store');
  });

  it('listeners see the click before the form is submitted', async () => {
    container = await mount(settingsForm('<pastis-button type="submit">Save</pastis-button>'));
    const order = [];
    container.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); order.push('submit'); });
    document.addEventListener('click', () => order.push('document click'), { once: true });
    container.querySelector('pastis-button').click();
    expect(order).toEqual(['document click', 'submit']);
  });

  it('stopPropagation does not cancel submission (only preventDefault does)', async () => {
    container = await mount(settingsForm('<pastis-button type="submit">Save</pastis-button>'));
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelector('pastis-button').addEventListener('click', e => e.stopPropagation());
    container.querySelector('pastis-button').click();
    await new Promise(r => setTimeout(r));
    expect(submits).toHaveLength(1);
  });

  it('a real mouse click submits once', async () => {
    container = await mount(settingsForm('<pastis-button type="submit" name="intent" value="save">Save</pastis-button>'));
    const submits = captureSubmits(container.querySelector('form'));
    await userEvent.click(container.querySelector('pastis-button'));
    expect(submits).toHaveLength(1);
    expect(submits[0].data.get('intent')).toBe('save');
  });
});

/** Every accessibility-tree node (Chrome's own) of the test page. */
async function axNodes() {
  const session = cdp();
  await session.send('Accessibility.enable');
  const { frameTree } = await session.send('Page.getFrameTree');
  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
  return nodes.filter(n => !n.ignored);
}

describe('pastis-button: ARIA stays on the host (React updates and removes it)', () => {
  let container;
  afterEach(() => container?.remove());

  it('axe (all rules) is clean with every forwarded attribute on hosts', async () => {
    container = await mount(`
      <main>
        <h3 id="name">Weekend groceries</h3>
        <p id="hint">Deletes the list and its 12 items</p>
        <pastis-button aria-label="Rename Weekend groceries">✎</pastis-button>
        <pastis-button aria-labelledby="name" aria-describedby="hint">✕</pastis-button>
        <pastis-button aria-pressed="true">Open</pastis-button>
        <pastis-button aria-expanded="false" aria-haspopup="menu" aria-controls="menu">More</pastis-button>
        <ul id="menu" hidden><li>Archive</li></ul>
        <pastis-button href="/lists" aria-current="page" aria-label="All lists">☰</pastis-button>
      </main>`);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('only the inner button carries a role and state for a given name', async () => {
    container = await mount('<pastis-button aria-label="Rename Weekend groceries" aria-pressed="false">✎</pastis-button>');
    expect(page.getByRole('button', { name: 'Rename Weekend groceries' }).elements()).toHaveLength(1);
    const named = (await axNodes()).filter(n => n.name?.value === 'Rename Weekend groceries');
    const withRole = named.filter(n => n.role.value !== 'generic');
    expect(withRole.map(n => n.role.value)).toEqual(['button']);
    // The host is at most a role-less generic: no state, nothing focusable
    for (const n of named.filter(n => n.role.value === 'generic')) {
      expect((n.properties ?? []).map(p => p.name)).not.toContain('pressed');
      expect((n.properties ?? []).map(p => p.name)).not.toContain('focusable');
    }
  });

  it('updating and removing host attributes updates the inner button (as React does)', async () => {
    container = await mount('<pastis-button aria-label="Rename" aria-expanded="false">✎</pastis-button>');
    const host = container.querySelector('pastis-button');
    const inner = host.shadowRoot.querySelector('button');
    host.setAttribute('aria-label', 'Rename Weekend groceries');
    host.setAttribute('aria-expanded', 'true');
    await host.updateComplete;
    expect(inner.getAttribute('aria-label')).toBe('Rename Weekend groceries');
    expect(inner.getAttribute('aria-expanded')).toBe('true');
    host.removeAttribute('aria-label');
    host.removeAttribute('aria-expanded');
    await host.updateComplete;
    expect(inner.hasAttribute('aria-label')).toBe(false);
    expect(inner.hasAttribute('aria-expanded')).toBe(false);
  });
});

describe('pastis-button axe-core', () => {
  let container;
  afterEach(() => container?.remove());

  it.each([
    ['default', '<pastis-button>Save</pastis-button>'],
    ['each variant', '<pastis-button variant="secondary">Duplicate</pastis-button><pastis-button variant="ghost">Cancel</pastis-button><pastis-button variant="destructive">Delete</pastis-button>'],
    ['link', '<pastis-button href="/lists">All lists</pastis-button>'],
    ['disabled link', '<pastis-button href="/lists" disabled>All lists</pastis-button>'],
    ['disabled', '<pastis-button disabled>Save</pastis-button>'],
    ['loading', '<pastis-button loading>Saving</pastis-button>'],
    ['submit and reset in a form', '<form><pastis-button type="submit">Save</pastis-button><pastis-button type="reset">Reset</pastis-button></form>'],
    ['icon button with aria-label', '<pastis-button variant="ghost" aria-label="Rename Weekend groceries">✎</pastis-button>'],
    ['toggle with aria-pressed', '<pastis-button aria-pressed="true">Open</pastis-button>'],
  ])('passes axe-core (%s)', async (_name, markup) => {
    container = await mount(`<div style="background:#0d0d0d;padding:8px">${markup}</div>`);
    const results = await axe.run(container, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

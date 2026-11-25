import { describe, it, expect, afterEach, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-tab-bar.js';

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  await new Promise(requestAnimationFrame);
  return container;
}

/** Every accessibility-tree node (Chrome's own) of the test page. */
async function axNodes() {
  const session = cdp();
  await session.send('Accessibility.enable');
  const { frameTree } = await session.send('Page.getFrameTree');
  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
  return nodes.filter(n => !n.ignored);
}

const BAR = `
  <pastis-tab-bar label="Main">
    <pastis-tab-bar-item href="#today" icon="today" label="Today" badge="3" badge-label="3 items" current></pastis-tab-bar-item>
    <pastis-tab-bar-item href="#scheduled" icon="calendar" label="Scheduled"></pastis-tab-bar-item>
    <pastis-tab-bar-item href="#lists" icon="list" label="Lists"></pastis-tab-bar-item>
    <pastis-tab-bar-item href="#search" icon="search" label="Search" hidden></pastis-tab-bar-item>
  </pastis-tab-bar>`;

describe('pastis-tab-bar', () => {
  let container;
  const bar = () => container.querySelector('pastis-tab-bar');
  const items = () => [...container.querySelectorAll('pastis-tab-bar-item')];
  const link = (item) => item.shadowRoot.querySelector('a');

  afterEach(() => {
    container?.remove();
    // Links followed during a test only change the hash
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });

  // ─── Landmark and links ───────────────────────────────────────────────────

  it('is a navigation landmark named by label', async () => {
    container = await mount(BAR);
    await expect.element(page.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    const navs = (await axNodes()).filter(n => n.role?.value === 'navigation');
    expect(navs).toHaveLength(1);
    expect(navs[0].name.value).toBe('Main');
  });

  it('each visible item is a link with its href, icon and label', async () => {
    container = await mount(BAR);
    const [today, scheduled, lists] = items();
    expect(link(scheduled).getAttribute('href')).toBe('#scheduled');
    expect(scheduled.shadowRoot.querySelector('pastis-icon').name).toBe('calendar');
    expect(scheduled.shadowRoot.querySelector('pastis-icon').size).toBe('lg');
    expect(scheduled.shadowRoot.querySelector('.label').textContent).toBe('Scheduled');
    await expect.element(page.getByRole('link', { name: 'Scheduled', exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('link', { name: 'Lists', exact: true })).toBeInTheDocument();
    expect(link(today).getAttribute('href')).toBe('#today');
    expect(link(lists).getAttribute('href')).toBe('#lists');
  });

  it('the current item has aria-current="page"; the others none', async () => {
    container = await mount(BAR);
    const [today, scheduled] = items();
    expect(link(today).getAttribute('aria-current')).toBe('page');
    expect(link(scheduled).hasAttribute('aria-current')).toBe(false);
    scheduled.current = true;
    today.current = false;
    await scheduled.updateComplete;
    await today.updateComplete;
    expect(link(scheduled).getAttribute('aria-current')).toBe('page');
    expect(link(today).hasAttribute('aria-current')).toBe(false);
    expect(scheduled.hasAttribute('current')).toBe(true);
  });

  it('Chrome: three links, named with the badge meaning', async () => {
    container = await mount(BAR);
    const links = (await axNodes()).filter(n => n.role?.value === 'link');
    expect(links.map(l => l.name.value)).toEqual(['Today, 3 items', 'Scheduled', 'Lists']);
    // Chrome's tree has no aria-current property; it is asserted on the links above
  });

  it('the current item uses the accent colour; the others the tertiary text colour', async () => {
    container = await mount(BAR);
    const [today, scheduled] = items();
    expect(getComputedStyle(link(today)).color).toBe('rgb(252, 186, 40)'); // --text-accent, dark
    expect(getComputedStyle(link(scheduled)).color).toBe('rgb(163, 155, 144)'); // --text-tertiary, dark
  });

  // ─── Badge ────────────────────────────────────────────────────────────────

  it('the badge is visible and its meaning is in the link name', async () => {
    container = await mount(BAR);
    const [today] = items();
    const badge = today.shadowRoot.querySelector('.badge');
    expect(badge.textContent).toBe('3');
    expect(badge.checkVisibility()).toBe(true);
    expect(badge.getAttribute('aria-hidden')).toBe('true');
    await expect.element(page.getByRole('link', { name: 'Today, 3 items', exact: true })).toBeInTheDocument();
  });

  it('without badge-label the badge itself is added to the name', async () => {
    container = await mount('<pastis-tab-bar label="Main"><pastis-tab-bar-item href="#today" icon="today" label="Today" badge="12"></pastis-tab-bar-item></pastis-tab-bar>');
    await expect.element(page.getByRole('link', { name: 'Today, 12', exact: true })).toBeInTheDocument();
  });

  it('no badge when empty; 0 (a number property) is shown', async () => {
    container = await mount('<pastis-tab-bar label="Main"><pastis-tab-bar-item href="#today" icon="today" label="Today"></pastis-tab-bar-item></pastis-tab-bar>');
    const [today] = items();
    expect(today.shadowRoot.querySelector('.badge')).toBeNull();
    await expect.element(page.getByRole('link', { name: 'Today', exact: true })).toBeInTheDocument();
    today.badge = 0;
    await today.updateComplete;
    expect(today.shadowRoot.querySelector('.badge').textContent).toBe('0');
    today.badge = '';
    await today.updateComplete;
    expect(today.shadowRoot.querySelector('.badge')).toBeNull();
  });

  // ─── pastis-navigate ──────────────────────────────────────────────────────

  it('a click fires pastis-navigate (bubbles, composed, cancelable) with the href', async () => {
    container = await mount(BAR);
    const [, scheduled] = items();
    let event;
    document.body.addEventListener('pastis-navigate', (e) => { event = e; e.preventDefault(); }, { once: true });
    await userEvent.click(link(scheduled));
    expect(event.detail).toEqual({ href: '#scheduled' });
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.cancelable).toBe(true);
    expect(event.target).toBe(scheduled);
  });

  it('cancelling pastis-navigate stops the link from being followed', async () => {
    container = await mount(BAR);
    const [, scheduled] = items();
    container.addEventListener('pastis-navigate', (e) => e.preventDefault());
    let clickPrevented;
    container.addEventListener('click', (e) => { clickPrevented = e.defaultPrevented; });
    await userEvent.click(link(scheduled));
    expect(clickPrevented).toBe(true);
    expect(location.hash).toBe('');
  });

  it('an uncancelled click follows the link', async () => {
    container = await mount(BAR);
    const [, , lists] = items();
    const handler = vi.fn();
    container.addEventListener('pastis-navigate', handler);
    await userEvent.click(link(lists));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(location.hash).toBe('#lists');
  });

  it('Enter on a focused link fires pastis-navigate', async () => {
    container = await mount(BAR);
    const [, scheduled] = items();
    const handler = vi.fn(e => e.preventDefault());
    container.addEventListener('pastis-navigate', handler);
    link(scheduled).focus();
    await userEvent.keyboard('{Enter}');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.href).toBe('#scheduled');
  });

  it('a click with a modifier key (new tab) does not fire pastis-navigate', async () => {
    container = await mount(BAR);
    const [, scheduled] = items();
    const handler = vi.fn();
    container.addEventListener('pastis-navigate', handler);
    // Synthetic, so the browser does not open a tab; the default is prevented to stay on the page
    const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, ctrlKey: true });
    container.addEventListener('click', (e) => e.preventDefault(), { once: true });
    link(scheduled).dispatchEvent(click);
    expect(handler).not.toHaveBeenCalled();
  });

  // ─── Without href ─────────────────────────────────────────────────────────

  it('an item without href warns once and stays a focusable link that Enter activates', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    container = await mount(`<button>Before</button><pastis-tab-bar label="Main">
      <pastis-tab-bar-item icon="inbox" label="Inbox"></pastis-tab-bar-item></pastis-tab-bar>`);
    const [inbox] = items();
    inbox.badge = 2;
    await inbox.updateComplete;
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('Inbox');
    const a = link(inbox);
    expect(a.hasAttribute('href')).toBe(false);
    expect(a.getAttribute('role')).toBe('link');
    expect(a.getAttribute('tabindex')).toBe('0');
    await expect.element(page.getByRole('link', { name: 'Inbox, 2', exact: true })).toBeInTheDocument();
    const handler = vi.fn();
    container.addEventListener('pastis-navigate', handler);
    container.querySelector('button').focus();
    await userEvent.tab();
    expect(inbox.shadowRoot.activeElement).toBe(a);
    await userEvent.keyboard('{Enter}');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ href: undefined });
    // Adding an href makes it a native link again
    inbox.href = '#inbox';
    await inbox.updateComplete;
    expect(a.getAttribute('href')).toBe('#inbox');
    expect(a.hasAttribute('role')).toBe(false);
    expect(a.hasAttribute('tabindex')).toBe(false);
    warn.mockRestore();
  });

  it('items with an href do not warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    container = await mount(BAR);
    expect(warn.mock.calls.filter(c => String(c[0]).startsWith('pastis-tab-bar-item'))).toHaveLength(0);
    warn.mockRestore();
  });

  // ─── hidden ───────────────────────────────────────────────────────────────

  it('hidden items are not rendered, not in the accessibility tree and not focusable', async () => {
    container = await mount(BAR);
    const search = items()[3];
    expect(search.checkVisibility()).toBe(false);
    expect(search.getBoundingClientRect().width).toBe(0);
    expect(page.getByRole('link', { name: 'Search' }).elements()).toHaveLength(0);
    const links = (await axNodes()).filter(n => n.role?.value === 'link');
    expect(links.map(l => l.name.value)).not.toContain('Search');
    search.hidden = false;
    await search.updateComplete;
    expect(search.checkVisibility()).toBe(true);
    await expect.element(page.getByRole('link', { name: 'Search' })).toBeInTheDocument();
  });

  // ─── Keyboard ─────────────────────────────────────────────────────────────

  it('Tab moves through the visible items in order, skipping hidden ones', async () => {
    container = await mount(`<button>Before</button>${BAR}<button>After</button>`);
    const [today, scheduled, lists] = items();
    container.querySelector('button').focus();
    await userEvent.tab();
    expect(today.shadowRoot.activeElement).toBe(link(today));
    await userEvent.tab();
    expect(scheduled.shadowRoot.activeElement).toBe(link(scheduled));
    await userEvent.tab();
    expect(lists.shadowRoot.activeElement).toBe(link(lists));
    await userEvent.tab();
    expect(document.activeElement.textContent).toBe('After');
    // Focus is visible (Pastis focus token)
    await userEvent.tab({ shift: true });
    expect(getComputedStyle(link(lists)).outlineStyle).toBe('solid');
    expect(getComputedStyle(link(lists)).outlineColor).toBe('rgb(252, 186, 40)');
  });

  // ─── Layout ───────────────────────────────────────────────────────────────

  it('is fixed to the bottom, full width, items share the width evenly', async () => {
    container = await mount(BAR);
    const style = getComputedStyle(bar());
    expect(style.position).toBe('fixed');
    const rect = bar().getBoundingClientRect();
    expect(rect.bottom).toBe(window.innerHeight);
    expect(rect.left).toBe(0);
    expect(rect.width).toBe(document.documentElement.clientWidth);
    const widths = items().slice(0, 3).map(i => i.getBoundingClientRect().width);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  });

  it('items put the icon above the label and are targets of at least 44 × 44 px', async () => {
    container = await mount(BAR);
    for (const item of items().slice(0, 3)) {
      const rect = link(item).getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
      const icon = item.shadowRoot.querySelector('pastis-icon').getBoundingClientRect();
      const label = item.shadowRoot.querySelector('.label').getBoundingClientRect();
      expect(icon.bottom).toBeLessThanOrEqual(label.top + 1);
    }
  });

  it('its height is --pastis-tab-bar-height, with safe-area padding at the bottom', async () => {
    container = await mount(BAR);
    const nav = bar().shadowRoot.querySelector('nav');
    // No safe area in a desktop browser: env() resolves to 0, the token to 56 px
    expect(nav.getBoundingClientRect().height).toBe(56);
    expect(getComputedStyle(nav).paddingBottom).toBe('0px');
    const sheet = [...bar().shadowRoot.adoptedStyleSheets].flatMap(s => [...s.cssRules]).map(r => r.cssText).join('\n');
    expect(sheet).toContain('padding-bottom: env(safe-area-inset-bottom, 0px)');
    expect(sheet).toContain('var(--pastis-tab-bar-height');
    // Physical insets on physical sides (also right in RTL)
    expect(sheet).toContain('padding-left: max(var(--space-xs, 4px), env(safe-area-inset-left, 0px))');
    expect(sheet).toContain('padding-right: max(var(--space-xs, 4px), env(safe-area-inset-right, 0px))');
    bar().style.setProperty('--pastis-tab-bar-height', '72px');
    expect(nav.getBoundingClientRect().height).toBe(72);
  });

  it('the page can pad its content with --pastis-tab-bar-height', async () => {
    container = await mount(`<div style="padding-bottom: var(--pastis-tab-bar-height)"></div>${BAR}`);
    expect(getComputedStyle(container.firstElementChild).paddingBottom).toBe('56px');
  });

  it('background and border come from the tokens', async () => {
    container = await mount(BAR);
    const nav = getComputedStyle(bar().shadowRoot.querySelector('nav'));
    expect(nav.backgroundColor).toBe('rgb(22, 17, 13)'); // --bg-secondary, dark
    expect(nav.borderTopColor).toBe('rgb(58, 50, 43)'); // --border-default, dark
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it.each(['dark', 'light'])('axe (all rules) is clean (%s theme)', async (theme) => {
    container = await mount(`<div data-theme="${theme}"><main style="background:var(--bg-primary);color:var(--text-primary)"><h1>Today</h1></main>${BAR}</div>`);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

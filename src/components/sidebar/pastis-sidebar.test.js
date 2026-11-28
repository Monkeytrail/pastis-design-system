import { describe, it, expect, afterEach, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-sidebar.js';
import '../button/pastis-button.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  await new Promise(requestAnimationFrame);
  return container;
}

const sidebar = (extra = '') => `
  <nav aria-label="Sidebar" style="height:480px;width:260px">
    <pastis-sidebar label="Views and lists">
      <pastis-button slot="header" size="sm">Add item</pastis-button>
      <pastis-sidebar-item href="/today" icon="today" label="Today" count="3" count-label="3 items due" current></pastis-sidebar-item>
      <pastis-sidebar-item href="/scheduled" icon="calendar" label="Scheduled" count="0"></pastis-sidebar-item>
      <pastis-sidebar-item href="/all" icon="layers" label="All"></pastis-sidebar-item>
      <pastis-sidebar-section label="Personal">
        <pastis-sidebar-item href="/lists/1" icon="list" label="Groceries" count="4"></pastis-sidebar-item>
        <pastis-sidebar-item href="/lists/2" icon="board" label="House projects"></pastis-sidebar-item>
      </pastis-sidebar-section>
      ${extra}
      <span slot="footer">Synced</span>
    </pastis-sidebar>
  </nav>`;

describe('pastis-sidebar', () => {
  let container;
  afterEach(() => {
    container?.remove();
    vi.restoreAllMocks();
  });

  it('is a named list of items and sections, with header and footer outside it', async () => {
    container = await mount(sidebar());
    const list = page.getByRole('list', { name: 'Views and lists' });
    await expect.element(list).toBeInTheDocument();
    // Three items and one section at the top level; two items in the section's own list
    const top = container.querySelector('pastis-sidebar').shadowRoot.querySelector('[role="list"]');
    const assigned = top.querySelector('slot').assignedElements();
    expect(assigned.map(n => n.getAttribute('role'))).toEqual(['listitem', 'listitem', 'listitem', 'listitem']);
    await expect.element(page.getByRole('list', { name: 'Personal' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
    expect(container.querySelector('[slot="footer"]').assignedSlot.name).toBe('footer');
  });

  it('hides empty header and footer areas', async () => {
    container = await mount('<pastis-sidebar label="Lists"><pastis-sidebar-item href="/a" label="All"></pastis-sidebar-item></pastis-sidebar>');
    const root = container.querySelector('pastis-sidebar').shadowRoot;
    expect(getComputedStyle(root.querySelector('.header')).display).toBe('none');
    expect(getComputedStyle(root.querySelector('.footer')).display).toBe('none');
  });

  it('the list scrolls on its own; header and footer stay in view', async () => {
    const many = Array.from({ length: 30 }, (_, i) => `<pastis-sidebar-item href="/lists/${i}" label="List ${i + 1}"></pastis-sidebar-item>`).join('');
    container = await mount(sidebar(many));
    const root = container.querySelector('pastis-sidebar').shadowRoot;
    const list = root.querySelector('.list');
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    const footer = root.querySelector('.footer').getBoundingClientRect();
    const nav = container.querySelector('nav').getBoundingClientRect();
    expect(Math.round(footer.bottom)).toBe(Math.round(nav.bottom));
  });

  describe('pastis-sidebar-item', () => {
    const item = (href) => container.querySelector(`pastis-sidebar-item[href="${href}"]`);

    it('is a link named by its label and count label; current is aria-current="page"', async () => {
      container = await mount(sidebar());
      const today = page.getByRole('link', { name: 'Today, 3 items due' });
      await expect.element(today).toHaveAttribute('href', '/today');
      await expect.element(today).toHaveAttribute('aria-current', 'page');
      await expect.element(page.getByRole('link', { name: 'Groceries, 4' })).toBeInTheDocument();
      await expect.element(page.getByRole('link', { name: 'All', exact: true })).not.toHaveAttribute('aria-current');
    });

    it('hides a count of 0 or none', async () => {
      container = await mount(sidebar());
      expect(item('/scheduled').shadowRoot.querySelector('.count')).toBeNull();
      expect(item('/all').shadowRoot.querySelector('.count')).toBeNull();
      await expect.element(page.getByRole('link', { name: 'Scheduled', exact: true })).toBeInTheDocument();
      expect(item('/today').shadowRoot.querySelector('.count').textContent).toBe('3');
    });

    it('current reflects and highlights the row', async () => {
      container = await mount(sidebar());
      const all = item('/all');
      const before = getComputedStyle(all.shadowRoot.querySelector('.wrap')).backgroundColor;
      all.current = true;
      await all.updateComplete;
      expect(all.hasAttribute('current')).toBe(true);
      expect(getComputedStyle(all.shadowRoot.querySelector('.wrap')).backgroundColor).not.toBe(before);
    });

    it('rows are compact (32 px) and the whole row is the link', async () => {
      container = await mount(sidebar());
      const link = item('/all').shadowRoot.querySelector('a');
      const rect = link.getBoundingClientRect();
      expect(rect.height).toBe(32);
      expect(Math.round(rect.width)).toBe(Math.round(item('/all').getBoundingClientRect().width));
    });

    it('a long label stays on one line with an ellipsis', async () => {
      container = await mount(sidebar('<pastis-sidebar-item href="/lists/9" label="A very long list name that does not fit the sidebar at all"></pastis-sidebar-item>'));
      const label = item('/lists/9').shadowRoot.querySelector('.label');
      expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
      expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
      expect(item('/lists/9').shadowRoot.querySelector('a').getBoundingClientRect().height).toBe(32);
    });

    it('fires a cancelable pastis-navigate on a plain click; cancelled, the link is not followed', async () => {
      container = await mount(sidebar('<pastis-sidebar-item href="#elsewhere" label="Elsewhere"></pastis-sidebar-item>'));
      const navigations = [];
      container.addEventListener('pastis-navigate', e => {
        expect(e.bubbles && e.composed && e.cancelable).toBe(true);
        navigations.push(e.detail.href);
        e.preventDefault();
      });
      await userEvent.click(page.getByRole('link', { name: 'Elsewhere' }));
      expect(navigations).toEqual(['#elsewhere']);
      expect(location.hash).toBe('');
    });

    it('modifier clicks skip pastis-navigate', async () => {
      container = await mount(sidebar());
      const link = item('/all').shadowRoot.querySelector('a');
      const navigations = [];
      container.addEventListener('pastis-navigate', e => navigations.push(e));
      // Cancel the native navigation the click would start
      link.addEventListener('click', e => e.preventDefault());
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
      expect(navigations).toHaveLength(0);
    });

    it('focus is visible (Pastis focus token) and Tab moves through the rows', async () => {
      container = await mount(sidebar());
      await userEvent.tab(); // Add item
      await userEvent.tab();
      const link = item('/today').shadowRoot.querySelector('a');
      expect(item('/today').shadowRoot.activeElement).toBe(link);
      expect(getComputedStyle(link).outlineStyle).toBe('solid');
      await userEvent.tab();
      expect(item('/scheduled').shadowRoot.activeElement).toBe(item('/scheduled').shadowRoot.querySelector('a'));
    });

    it('a trailing action sits beside the link', async () => {
      container = await mount(sidebar(`
        <pastis-sidebar-item href="/lists/7" label="Errands">
          <pastis-button slot="trailing" size="sm" variant="ghost" aria-label="More for Errands">…</pastis-button>
        </pastis-sidebar-item>`));
      const more = container.querySelector('[slot="trailing"]');
      expect(more.assignedSlot.name).toBe('trailing');
      await expect.element(page.getByRole('button', { name: 'More for Errands' })).toBeInTheDocument();
      const link = item('/lists/7').shadowRoot.querySelector('a').getBoundingClientRect();
      expect(more.getBoundingClientRect().left).toBeGreaterThanOrEqual(link.right);
    });

    it('without href warns and stays reachable; Enter activates it', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      container = await mount('<pastis-sidebar label="Lists"><pastis-sidebar-item label="Nowhere"></pastis-sidebar-item></pastis-sidebar>');
      expect(warn).toHaveBeenCalled();
      const link = container.querySelector('pastis-sidebar-item').shadowRoot.querySelector('a');
      expect(link.getAttribute('role')).toBe('link');
      expect(link.getAttribute('tabindex')).toBe('0');
      const navigations = [];
      container.addEventListener('pastis-navigate', e => { navigations.push(e.detail.href); e.preventDefault(); });
      link.focus();
      await userEvent.keyboard('{Enter}');
      expect(navigations).toEqual([undefined]);
    });

    it('a marker instead of an icon', async () => {
      container = await mount(sidebar('<pastis-sidebar-item href="/tags/1" marker="#" label="errands"></pastis-sidebar-item>'));
      const lead = item('/tags/1').shadowRoot.querySelector('.lead');
      expect(lead.textContent).toBe('#');
      expect(lead.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('pastis-sidebar-section', () => {
    const section = () => container.querySelector('pastis-sidebar-section');
    const heading = () => section().shadowRoot.querySelector('.heading');

    it('has a heading button with aria-expanded controlling its list', async () => {
      container = await mount(sidebar());
      const button = page.getByRole('button', { name: 'Personal' });
      await expect.element(button).toHaveAttribute('aria-expanded', 'true');
      expect(heading().getAttribute('aria-controls')).toBe('items');
      expect(section().collapsed).toBe(false);
    });

    it('click folds it: pastis-toggle { collapsed: true }, items hidden, aria-expanded false', async () => {
      container = await mount(sidebar());
      const events = [];
      container.addEventListener('pastis-toggle', e => events.push(e));
      await userEvent.click(page.getByRole('button', { name: 'Personal' }));
      expect(events.map(e => e.detail)).toEqual([{ collapsed: true }]);
      expect(events[0].bubbles && events[0].composed && events[0].cancelable).toBe(true);
      await section().updateComplete;
      expect(section().hasAttribute('collapsed')).toBe(true);
      expect(heading().getAttribute('aria-expanded')).toBe('false');
      await expect.element(page.getByRole('link', { name: 'Groceries, 4' })).not.toBeInTheDocument();
      await userEvent.click(page.getByRole('button', { name: 'Personal' }));
      expect(events.at(-1).detail).toEqual({ collapsed: false });
      await expect.element(page.getByRole('link', { name: 'Groceries, 4' })).toBeVisible();
    });

    it('a cancelled pastis-toggle leaves it unchanged (controlled)', async () => {
      container = await mount(sidebar());
      container.addEventListener('pastis-toggle', e => e.preventDefault());
      await userEvent.click(page.getByRole('button', { name: 'Personal' }));
      await section().updateComplete;
      expect(section().collapsed).toBe(false);
      section().collapsed = true;
      await section().updateComplete;
      expect(heading().getAttribute('aria-expanded')).toBe('false');
    });

    it('Enter and Space toggle it from the keyboard', async () => {
      container = await mount(sidebar());
      heading().focus();
      await userEvent.keyboard('{Enter}');
      await section().updateComplete;
      expect(section().collapsed).toBe(true);
      await userEvent.keyboard(' ');
      await section().updateComplete;
      expect(section().collapsed).toBe(false);
    });

    it('the heading is a target of at least 24 px and a trailing action sits beside it', async () => {
      container = await mount(`
        <pastis-sidebar label="Lists">
          <pastis-sidebar-section label="Work">
            <pastis-button slot="trailing" size="sm" variant="ghost" aria-label="Add list to Work">+</pastis-button>
            <pastis-sidebar-item href="/lists/3" label="Backlog"></pastis-sidebar-item>
          </pastis-sidebar-section>
        </pastis-sidebar>`);
      expect(heading().getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
      await expect.element(page.getByRole('button', { name: 'Add list to Work' })).toBeInTheDocument();
      expect(container.querySelector('[slot="trailing"]').assignedSlot.name).toBe('trailing');
    });
  });

  it('has no axe violations in both themes, hovered, with a folded section', async () => {
    for (const theme of ['dark', 'light']) {
      container = await mount(`<div data-theme="${theme}" style="background:var(--bg-primary)">${sidebar(`
        <pastis-sidebar-section label="Tags" collapsed>
          <pastis-sidebar-item href="/tags/1" marker="#" label="errands"></pastis-sidebar-item>
        </pastis-sidebar-section>
        <pastis-sidebar-item href="/trash" icon="trash" label="Trash"></pastis-sidebar-item>
        <pastis-sidebar-item href="/settings" icon="settings" label="Settings"></pastis-sidebar-item>`)}</div>`);
      await userEvent.hover(page.getByRole('link', { name: 'Trash' }));
      await new Promise(resolve => setTimeout(resolve, 200));
      expect((await axe.run(container, AXE)).violations.map(v => v.id), theme).toEqual([]);
      container.remove();
    }
  });
});

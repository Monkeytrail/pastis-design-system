import { expect } from 'storybook/test';
import './pastis-sidebar.js';
import '../button/pastis-button.js';
import '../input/pastis-input.js';

const items = `
  <pastis-sidebar-item href="#today" icon="today" label="Today" count="3" count-label="3 items due" current></pastis-sidebar-item>
  <pastis-sidebar-item href="#scheduled" icon="calendar" label="Scheduled" count="12"></pastis-sidebar-item>
  <pastis-sidebar-item href="#flagged" icon="flag" label="Flagged" count="2"></pastis-sidebar-item>
  <pastis-sidebar-item href="#all" icon="layers" label="All"></pastis-sidebar-item>
  <pastis-sidebar-section label="Personal">
    <pastis-sidebar-item href="#groceries" icon="list" label="Groceries" count="4"></pastis-sidebar-item>
    <pastis-sidebar-item href="#house" icon="list" label="House and garden" count="7"></pastis-sidebar-item>
  </pastis-sidebar-section>
  <pastis-sidebar-section label="Work">
    <pastis-button slot="trailing" size="sm" variant="ghost" aria-label="Add list to Work">+</pastis-button>
    <pastis-sidebar-item href="#platform" icon="board" label="Platform backlog" count="23"></pastis-sidebar-item>
    <pastis-sidebar-item href="#release" icon="list" label="Release checklist for the spring update" count="5"></pastis-sidebar-item>
  </pastis-sidebar-section>
  <pastis-sidebar-section label="Tags" collapsed>
    <pastis-sidebar-item href="#errands" marker="#" label="errands"></pastis-sidebar-item>
    <pastis-sidebar-item href="#calls" marker="#" label="calls"></pastis-sidebar-item>
  </pastis-sidebar-section>
  <pastis-sidebar-item href="#trash" icon="trash" label="Trash"></pastis-sidebar-item>
  <pastis-sidebar-item href="#settings" icon="settings" label="Settings"></pastis-sidebar-item>`;

/** A sidebar in a `nav`, as `<pastis-app-layout>` provides it; links are cancelled like a router would. */
function sidebar({ header = true, footer = true } = {}) {
  const wrap = document.createElement('nav');
  wrap.setAttribute('aria-label', 'Sidebar');
  wrap.style.cssText = 'height:640px;width:260px;border:1px solid var(--border-subtle)';
  wrap.innerHTML = `
    <pastis-sidebar label="Views and lists">
      ${header ? `
        <pastis-input slot="header" size="sm" aria-label="Search" placeholder="Search"></pastis-input>
        <pastis-button slot="header" size="sm">Add item</pastis-button>` : ''}
      ${items}
      ${footer ? '<span slot="footer" style="font-size:var(--font-size-caption);color:var(--text-tertiary)">Synced just now</span>' : ''}
    </pastis-sidebar>`;
  wrap.addEventListener('pastis-navigate', (e) => {
    e.preventDefault();
    for (const item of wrap.querySelectorAll('pastis-sidebar-item')) item.current = item.href === e.detail.href;
  });
  return wrap;
}

/**
 * Sidebar: a desktop app's navigation column. Items are compact link rows with an icon and a
 * count; sections fold. Header and footer stay in view while the list scrolls.
 */
export default {
  title: 'Navigation/Sidebar',
  component: 'pastis-sidebar',
  subcomponents: { SidebarSection: 'pastis-sidebar-section', SidebarItem: 'pastis-sidebar-item' },
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' } },
  render: () => sidebar(),
};

export const Default = {
  play: async ({ canvasElement, step }) => {
    const shadowButton = (label) => [...canvasElement.querySelectorAll('pastis-sidebar-section')]
      .find(s => s.label === label).shadowRoot.querySelector('.heading');
    await step('a section folds and unfolds', async () => {
      const work = shadowButton('Work');
      await expect(work.getAttribute('aria-expanded')).toBe('true');
      work.click();
      await canvasElement.querySelector('pastis-sidebar-section[label="Work"]').updateComplete;
      await expect(work.getAttribute('aria-expanded')).toBe('false');
      work.click();
    });
    await step('a click moves current', async () => {
      const groceries = canvasElement.querySelector('pastis-sidebar-item[href="#groceries"]');
      groceries.shadowRoot.querySelector('a').click();
      await groceries.updateComplete;
      await expect(groceries.hasAttribute('current')).toBe(true);
      await expect(groceries.shadowRoot.querySelector('a').getAttribute('aria-current')).toBe('page');
    });
  },
};

export const ListOnly = { render: () => sidebar({ header: false, footer: false }) };

export const Item = {
  render: () => {
    const wrap = document.createElement('nav');
    wrap.setAttribute('aria-label', 'Example');
    wrap.style.width = '260px';
    wrap.innerHTML = `
      <pastis-sidebar label="Views">
        <pastis-sidebar-item href="#today" icon="today" label="Today" count="3" count-label="3 items due" current></pastis-sidebar-item>
        <pastis-sidebar-item href="#inbox" icon="inbox" label="Inbox" count="0"></pastis-sidebar-item>
        <pastis-sidebar-item href="#errands" marker="#" label="errands">
          <pastis-button slot="trailing" size="sm" variant="ghost" aria-label="More for errands">…</pastis-button>
        </pastis-sidebar-item>
      </pastis-sidebar>`;
    wrap.addEventListener('pastis-navigate', e => e.preventDefault());
    return wrap;
  },
};

export const Empty = {
  render: () => {
    const wrap = document.createElement('nav');
    wrap.setAttribute('aria-label', 'Sidebar');
    wrap.style.cssText = 'height:240px;width:260px';
    wrap.innerHTML = `
      <pastis-sidebar label="Lists">
        <pastis-sidebar-section label="Personal"></pastis-sidebar-section>
      </pastis-sidebar>`;
    return wrap;
  },
};

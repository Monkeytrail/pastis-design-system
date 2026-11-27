import { describe, it, expect, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import './pastis-list-row.js';
import '../button/pastis-button.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  return container;
}

describe('pastis-list-row', () => {
  let container;
  afterEach(() => container?.remove());

  it('a navigation row is a link in a list item, named by link-label, with icon and count', async () => {
    container = await mount(`
      <pastis-list-group role="list" aria-label="Smart lists">
        <pastis-list-row href="/today" icon="today" label="Today" count="3" link-label="Today, 3 open items"></pastis-list-row>
        <pastis-list-row href="/tags/t1" marker="#" label="groceries" count="1"></pastis-list-row>
      </pastis-list-group>`);
    await expect.element(page.getByRole('list', { name: 'Smart lists' })).toBeInTheDocument();
    expect(page.getByRole('listitem').elements()).toHaveLength(2);
    const today = page.getByRole('link', { name: 'Today, 3 open items' });
    await expect.element(today).toHaveAttribute('href', '/today');
    await expect.element(page.getByRole('link', { name: 'groceries 1' })).toBeInTheDocument();
  });

  it('is at least 44 px high', async () => {
    container = await mount('<pastis-list-row href="/all" label="All"></pastis-list-row>');
    const row = container.querySelector('pastis-list-row').shadowRoot.querySelector('.row');
    expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  it('fires a cancelable pastis-navigate on a plain click; cancelled, the link is not followed', async () => {
    container = await mount('<pastis-list-row href="#elsewhere" label="All"></pastis-list-row>');
    const navigations = [];
    container.addEventListener('pastis-navigate', e => {
      navigations.push(e.detail.href);
      e.preventDefault();
    });
    await userEvent.click(page.getByRole('link', { name: 'All' }));
    expect(navigations).toEqual(['#elsewhere']);
    expect(location.hash).toBe('');
  });

  it('a static row shows its meta line and a trailing action', async () => {
    container = await mount(`
      <pastis-list-group role="list" aria-label="Deleted">
        <pastis-list-row label="Milk" meta="in Groceries">
          <pastis-button slot="trailing" size="sm" variant="secondary" aria-label="Restore Milk">Restore</pastis-button>
        </pastis-list-row>
      </pastis-list-group>`);
    const row = container.querySelector('pastis-list-row');
    expect(row.shadowRoot.querySelector('a')).toBeNull();
    expect(row.shadowRoot.querySelector('.meta').textContent).toBe('in Groceries');
    await expect.element(page.getByRole('button', { name: 'Restore Milk' })).toBeInTheDocument();
  });

  it('keeps a role the app gives it', async () => {
    container = await mount('<pastis-list-row role="none" label="Plain"></pastis-list-row>');
    expect(container.querySelector('pastis-list-row').getAttribute('role')).toBe('none');
  });

  it('has no axe violations, links and static rows, hovered', async () => {
    document.body.style.background = '#0d0d0d';
    container = await mount(`
      <pastis-list-group role="list" aria-label="Lists">
        <pastis-list-row href="/lists/1" icon="list" label="Groceries" count="4" link-label="Groceries, 4 open items"></pastis-list-row>
        <pastis-list-row label="Milk" meta="in Groceries">
          <pastis-button slot="trailing" size="sm" variant="secondary" aria-label="Restore Milk">Restore</pastis-button>
        </pastis-list-row>
      </pastis-list-group>`);
    await userEvent.hover(page.getByRole('link', { name: 'Groceries, 4 open items' }));
    await new Promise(resolve => setTimeout(resolve, 200));
    expect((await axe.run(container, AXE)).violations.map(v => v.id)).toEqual([]);
    document.body.style.background = '';
  });
});

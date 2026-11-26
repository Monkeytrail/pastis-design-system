import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-sortable.js';
import '../task-row/pastis-task-row.js';

const TITLES = ['Milk', 'Bread', 'Eggs', 'Rice'];

/** A sortable of task rows with reorder handles; reorders are recorded in `moves`. */
async function mountRows(attrs = '', wrap = s => s) {
  const container = document.createElement('div');
  container.innerHTML = wrap(`
    <pastis-sortable role="list" aria-label="Groceries" ${attrs}>
      ${TITLES.map(t => `<pastis-task-row reorderable task-title="${t}"></pastis-task-row>`).join('')}
    </pastis-sortable>`);
  document.body.appendChild(container);
  const sortable = container.querySelector('pastis-sortable');
  await Promise.all([sortable, ...sortable.children].map(el => el.updateComplete));
  await new Promise(requestAnimationFrame);
  const moves = [];
  sortable.addEventListener('pastis-reorder', e => moves.push(e.detail));
  const rows = [...sortable.children];
  const handle = (i) => rows[i].shadowRoot.querySelector('.handle');
  return { container, sortable, rows, moves, handle };
}

describe('pastis-task-row reorderable', () => {
  let container;
  afterEach(() => container?.remove());

  it('shows a named handle only when reorderable', async () => {
    const m = await mountRows();
    container = m.container;
    expect(m.handle(0).getAttribute('aria-label')).toBe('Reorder Milk');
    m.rows[0].reorderLabel = 'Move Milk';
    m.rows[1].reorderable = false;
    await Promise.all([m.rows[0].updateComplete, m.rows[1].updateComplete]);
    expect(m.handle(0).getAttribute('aria-label')).toBe('Move Milk');
    expect(m.handle(1)).toBeNull();
  });
});

describe('pastis-sortable', () => {
  let container;
  afterEach(() => container?.remove());

  it('Arrow Up and Down on a handle move its row one place', async () => {
    const m = await mountRows();
    container = m.container;
    m.handle(1).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(m.moves).toEqual([{ from: 1, to: 2 }]);
    await userEvent.keyboard('{ArrowUp}');
    expect(m.moves.at(-1)).toEqual({ from: 1, to: 0 });
    // Not past the ends
    m.handle(0).focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(m.moves).toHaveLength(2);
  });

  it('tap to pick up, tap another handle to put it there; the same one puts it back', async () => {
    const m = await mountRows();
    container = m.container;
    await userEvent.click(m.handle(0));
    expect(m.rows[0].hasAttribute('data-picked')).toBe(true);
    await userEvent.click(m.handle(2));
    expect(m.moves).toEqual([{ from: 0, to: 2 }]);
    expect(m.rows[0].hasAttribute('data-picked')).toBe(false);

    await userEvent.click(m.handle(3));
    await userEvent.click(m.handle(3));
    expect(m.moves).toHaveLength(1);
    expect(m.rows[3].hasAttribute('data-picked')).toBe(false);

    await userEvent.click(m.handle(1));
    await userEvent.keyboard('{Escape}');
    expect(m.rows[1].hasAttribute('data-picked')).toBe(false);
  });

  it('dragging a handle moves the row to where it is dropped', async () => {
    const m = await mountRows();
    container = m.container;
    const from = m.handle(0).getBoundingClientRect();
    const target = m.rows[2].getBoundingClientRect();
    const fire = (type, y) => m.handle(0).dispatchEvent(new PointerEvent(type, {
      bubbles: true, composed: true, pointerId: 7, button: 0, clientX: from.left + 5, clientY: y,
    }));
    fire('pointerdown', from.top + 5);
    fire('pointermove', from.top + 20);
    expect(m.rows[0].hasAttribute('data-dragging')).toBe(true);
    expect(m.sortable.shadowRoot.querySelector('.indicator').hidden).toBe(false);
    // Below the middle of Eggs (index 2): Milk lands after it.
    fire('pointermove', target.bottom - 2);
    fire('pointerup', target.bottom - 2);
    expect(m.moves).toEqual([{ from: 0, to: 2 }]);
    expect(m.rows[0].hasAttribute('data-dragging')).toBe(false);
    expect(m.rows[0].style.transform).toBe('');
    // The click after a drag does not pick the row up
    m.handle(0).click();
    expect(m.rows[0].hasAttribute('data-picked')).toBe(false);
  });

  it('a short press is a tap, not a drag', async () => {
    const m = await mountRows();
    container = m.container;
    const r = m.handle(1).getBoundingClientRect();
    const fire = (type, y) => m.handle(1).dispatchEvent(new PointerEvent(type, {
      bubbles: true, composed: true, pointerId: 3, button: 0, clientY: y,
    }));
    fire('pointerdown', r.top + 5);
    fire('pointermove', r.top + 7);
    fire('pointerup', r.top + 7);
    expect(m.moves).toEqual([]);
    expect(m.rows[1].hasAttribute('data-dragging')).toBe(false);
  });

  it('takes any element with data-sortable-handle as a handle', async () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <pastis-sortable role="list" aria-label="Places">
        <div role="listitem"><a href="#a">A</a><button data-sortable-handle aria-label="Reorder A">≡</button></div>
        <div role="listitem"><a href="#b">B</a><button data-sortable-handle aria-label="Reorder B">≡</button></div>
      </pastis-sortable>`;
    document.body.appendChild(wrap);
    container = wrap;
    const sortable = wrap.querySelector('pastis-sortable');
    await sortable.updateComplete;
    const moves = [];
    sortable.addEventListener('pastis-reorder', e => moves.push(e.detail));
    wrap.querySelectorAll('button')[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(moves).toEqual([{ from: 0, to: 1 }]);
    // Not a handle: nothing happens
    wrap.querySelector('a').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(moves).toHaveLength(1);
  });

  it('disabled: no reorder of any kind', async () => {
    const m = await mountRows('disabled');
    container = m.container;
    m.handle(1).focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(m.handle(1));
    expect(m.moves).toEqual([]);
    expect(m.rows[1].hasAttribute('data-picked')).toBe(false);
  });

  it('axe (all rules) is clean in both themes, with a row picked up', async () => {
    for (const [theme, bg] of [['dark', '#110d0a'], ['light', '#f4f1ea']]) {
      const m = await mountRows('', s => `<main data-theme="${theme}" style="background:${bg};color:var(--text-primary)"><h1>Groceries</h1>${s}</main>`);
      container = m.container;
      await userEvent.click(m.handle(1));
      const results = await axe.run(container);
      expect(results.violations, theme).toEqual([]);
      container.remove();
    }
  });
});

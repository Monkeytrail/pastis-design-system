import { describe, it, expect, afterEach } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-kanban-board.js';
import '../task-row/pastis-task-row.js';

const BOARD = {
  todo: ['Milk', 'Bread'],
  doing: ['Eggs'],
  done: [],
};

async function mountBoard(attrs = '', wrap = s => s) {
  const container = document.createElement('div');
  container.innerHTML = wrap(`
    <pastis-kanban-board ${attrs}>
      ${Object.entries(BOARD).map(([value, titles]) => `
        <pastis-kanban-column value="${value}" label="${value === 'todo' ? 'To do' : value[0].toUpperCase() + value.slice(1)}">
          ${titles.map(t => `<pastis-task-row reorderable task-title="${t}"></pastis-task-row>`).join('')}
        </pastis-kanban-column>`).join('')}
    </pastis-kanban-board>`);
  document.body.appendChild(container);
  const board = container.querySelector('pastis-kanban-board');
  const all = [board, ...board.querySelectorAll('*')];
  await Promise.all(all.map(el => el.updateComplete).filter(Boolean));
  await new Promise(requestAnimationFrame);
  const moves = [];
  board.addEventListener('pastis-kanban-move', e => moves.push(e.detail));
  const column = (value) => board.querySelector(`pastis-kanban-column[value="${value}"]`);
  const card = (title) => [...board.querySelectorAll('pastis-task-row')].find(r => r.taskTitle === title);
  const handle = (title) => card(title).shadowRoot.querySelector('.handle');
  return { container, board, moves, column, card, handle };
}

describe('pastis-kanban-board', () => {
  let container;
  afterEach(() => container?.remove());

  it('columns show their name and count, and name their list', async () => {
    const m = await mountBoard();
    container = m.container;
    const todo = m.column('todo');
    expect(todo.shadowRoot.querySelector('h3').textContent.replace(/\s+/g, ' ').trim()).toBe('To do 2');
    expect(todo.shadowRoot.querySelector('[role="list"]').getAttribute('aria-label')).toBe('To do, 2 items');
    expect(m.column('done').shadowRoot.querySelector('[role="list"]').getAttribute('aria-label')).toBe('Done, 0 items');
  });

  it('arrow keys move within a column and to the end of the next one', async () => {
    const m = await mountBoard();
    container = m.container;
    m.handle('Milk').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(m.moves.at(-1)).toEqual({ from: { column: 'todo', index: 0 }, to: { column: 'todo', index: 1 } });
    await userEvent.keyboard('{ArrowRight}');
    expect(m.moves.at(-1)).toEqual({ from: { column: 'todo', index: 0 }, to: { column: 'doing', index: 1 } });
    await userEvent.keyboard('{ArrowLeft}');
    expect(m.moves).toHaveLength(2);
  });

  it('tap to pick up, then Move here (a column end) or another card (its place)', async () => {
    const m = await mountBoard();
    container = m.container;
    await userEvent.click(m.handle('Bread'));
    expect(m.card('Bread').hasAttribute('data-picked')).toBe(true);
    expect(m.column('todo').dropTarget).toBe(false);
    expect(m.column('done').dropTarget).toBe(true);
    await userEvent.click(m.column('done').shadowRoot.querySelector('.move'));
    expect(m.moves.at(-1)).toEqual({ from: { column: 'todo', index: 1 }, to: { column: 'done', index: 0 } });
    expect(m.column('done').dropTarget).toBe(false);

    await userEvent.click(m.handle('Eggs'));
    await userEvent.click(m.handle('Milk'));
    expect(m.moves.at(-1)).toEqual({ from: { column: 'doing', index: 0 }, to: { column: 'todo', index: 0 } });

    await userEvent.click(m.handle('Milk'));
    await userEvent.keyboard('{Escape}');
    expect(m.card('Milk').hasAttribute('data-picked')).toBe(false);
    expect(m.moves).toHaveLength(2);
  });

  it('dragging a card onto another column moves it to the place under the pointer', async () => {
    const m = await mountBoard();
    container = m.container;
    const from = m.handle('Milk').getBoundingClientRect();
    const target = m.card('Eggs').getBoundingClientRect();
    const fire = (type, x, y) => m.handle('Milk').dispatchEvent(new PointerEvent(type, {
      bubbles: true, composed: true, pointerId: 9, button: 0, clientX: x, clientY: y,
    }));
    fire('pointerdown', from.left + 5, from.top + 5);
    fire('pointermove', from.left + 25, from.top + 5);
    expect(m.card('Milk').hasAttribute('data-dragging')).toBe(true);
    // Below the middle of Eggs, in Doing.
    fire('pointermove', target.left + 20, target.bottom - 2);
    expect(m.column('doing').over).toBe(true);
    fire('pointerup', target.left + 20, target.bottom - 2);
    expect(m.moves).toEqual([{ from: { column: 'todo', index: 0 }, to: { column: 'doing', index: 1 } }]);
    expect(m.column('doing').over).toBe(false);
    m.handle('Milk').click();
    expect(m.card('Milk').hasAttribute('data-picked')).toBe(false);
  });

  it('disabled: nothing moves', async () => {
    const m = await mountBoard('disabled');
    container = m.container;
    m.handle('Milk').focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.click(m.handle('Milk'));
    expect(m.moves).toEqual([]);
  });

  it('Chrome: each column is a list of its cards, named with its count', async () => {
    const m = await mountBoard();
    container = m.container;
    const session = cdp();
    await session.send('Accessibility.enable');
    const { frameTree } = await session.send('Page.getFrameTree');
    const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
    const lists = nodes.filter(n => !n.ignored && n.role?.value === 'list').map(n => n.name?.value);
    expect(lists).toEqual(['To do, 2 items', 'Doing, 1 item', 'Done, 0 items']);
  });

  it('axe (all rules) is clean in both themes, with a card picked up', async () => {
    for (const [theme, bg] of [['dark', '#110d0a'], ['light', '#f4f1ea']]) {
      const m = await mountBoard('', s => `<main data-theme="${theme}" style="background:${bg};color:var(--text-primary)"><h1>Backlog</h1><h2>Board</h2>${s}</main>`);
      container = m.container;
      await userEvent.click(m.handle('Milk'));
      const results = await axe.run(container);
      expect(results.violations, theme).toEqual([]);
      container.remove();
    }
  });
});

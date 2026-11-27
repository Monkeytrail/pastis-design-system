import { expect } from 'storybook/test';
import './pastis-kanban-board.js';
import '../task-row/pastis-task-row.js';

const columns = [
  ['inbox', 'Inbox', ['Triage crash report']],
  ['todo', 'To do', ['Write release notes', 'Update screenshots']],
  ['doing', 'Doing', ['Ship 2.0']],
  ['verify', 'Verify', []],
  ['done', 'Done', ['Fix login']],
];

/** A board whose story moves the cards itself, as an app would on `pastis-kanban-move`. */
function board({ disabled = false } = {}) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <pastis-kanban-board ${disabled ? 'disabled' : ''}>
      ${columns.map(([value, label, titles]) => `
        <pastis-kanban-column value="${value}" label="${label}">
          ${titles.map(t => `<pastis-task-row reorderable task-title="${t}"></pastis-task-row>`).join('')}
        </pastis-kanban-column>`).join('')}
    </pastis-kanban-board>`;
  const el = wrap.querySelector('pastis-kanban-board');
  el.addEventListener('pastis-kanban-move', (e) => {
    const { from, to } = e.detail;
    const source = el.querySelector(`pastis-kanban-column[value="${from.column}"]`);
    const target = el.querySelector(`pastis-kanban-column[value="${to.column}"]`);
    const card = source.children[from.index];
    const rest = [...target.children].filter(c => c !== card);
    target.insertBefore(card, rest[to.index] ?? null);
  });
  return wrap;
}

/**
 * Kanban board: status columns of cards. Drag a card's handle to another place; or tap it, then
 * tap another card or a column's "Move here"; or use the arrow keys on the handle.
 */
export default {
  title: 'Basics/KanbanBoard',
  component: 'pastis-kanban-board',
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' } },
  argTypes: { disabled: { control: 'boolean' } },
  args: { disabled: false },
  render: board,
};

export const Default = {
  play: async ({ canvasElement, step }) => {
    const el = canvasElement.querySelector('pastis-kanban-board');
    const handle = (title) => [...el.querySelectorAll('pastis-task-row')].find(r => r.taskTitle === title).shadowRoot.querySelector('.handle');
    await step('Tap a card, then Move here on Verify', async () => {
      handle('Ship 2.0').click();
      const verify = el.querySelector('pastis-kanban-column[value="verify"]');
      await verify.updateComplete;
      verify.shadowRoot.querySelector('.move').click();
      await expect([...verify.children].map(r => r.taskTitle)).toEqual(['Ship 2.0']);
    });
  },
};

export const Disabled = { args: { disabled: true } };

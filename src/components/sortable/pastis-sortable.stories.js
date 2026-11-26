import { expect } from 'storybook/test';
import './pastis-sortable.js';
import '../task-row/pastis-task-row.js';

const groceries = ['Milk', 'Bread', 'Eggs', 'Rice', 'Coffee'];

/**
 * A sortable list of task rows: the app keeps the order and moves the rows on `pastis-reorder`.
 * This story does what an app would: it moves the child itself.
 */
function list({ disabled = false, label = 'Groceries' } = {}) {
  const wrap = document.createElement('div');
  wrap.style.maxWidth = '420px';
  wrap.innerHTML = `
    <pastis-sortable role="list" aria-label="${label}" ${disabled ? 'disabled' : ''}>
      ${groceries.map(t => `<pastis-task-row reorderable task-title="${t}"></pastis-task-row>`).join('')}
    </pastis-sortable>`;
  const sortable = wrap.querySelector('pastis-sortable');
  sortable.addEventListener('pastis-reorder', (e) => {
    const { from, to } = e.detail;
    const children = [...sortable.children];
    const moved = children[from];
    const rest = children.filter((_, i) => i !== from);
    sortable.insertBefore(moved, rest[to] ?? null);
  });
  return wrap;
}

const panel = (theme) => `
  <section data-theme="${theme}" aria-label="${theme === 'dark' ? 'Dark' : 'Light'} theme" style="background:var(--bg-primary);color:var(--text-primary);padding:16px;flex:1 1 320px;min-width:0;max-width:375px"></section>`;

export default {
  title: 'Basics/Sortable',
  component: 'pastis-sortable',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: { label: { control: 'text', description: 'The list’s aria-label' }, disabled: { control: 'boolean' } },
  args: { label: 'Groceries', disabled: false },
  render: list,
};

/** Drag a handle, tap one to pick the row up and another to put it there, or use the arrow keys. */
export const Default = {
  play: async ({ canvasElement, step }) => {
    const sortable = canvasElement.querySelector('pastis-sortable');
    const handle = (i) => sortable.children[i].shadowRoot.querySelector('.handle');
    await step('Tap Milk, then Eggs: Milk takes Eggs’ place', async () => {
      handle(0).click();
      handle(2).click();
      await expect([...sortable.children].map(r => r.taskTitle)).toEqual(['Bread', 'Eggs', 'Milk', 'Rice', 'Coffee']);
    });
  },
};

export const Disabled = { args: { disabled: true } };

/** Dark and light side by side, at phone width each. */
export const BothThemes = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexWrap = 'wrap';
    wrap.innerHTML = panel('dark') + panel('light');
    for (const [i, section] of [...wrap.querySelectorAll('section')].entries()) {
      section.append(list({ label: i === 0 ? 'Groceries (dark)' : 'Groceries (light)' }));
    }
    return wrap;
  },
};

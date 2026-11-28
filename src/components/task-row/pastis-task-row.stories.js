import './pastis-task-row.js';
import '../button/pastis-button.js';

/** Escapes text for a double-quoted attribute. */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** A list wrapper: the rows are list items, so they always sit in a `role="list"`. */
const list = (rows, label = 'Tasks') => `
  <div role="list" aria-label="${label}" style="max-width:480px;background:var(--bg-primary)">${rows}</div>`;

const panel = (theme, content) => `
  <section data-theme="${theme}" aria-label="${theme === 'dark' ? 'Dark' : 'Light'} theme" style="background:var(--bg-primary);color:var(--text-primary);padding:16px;flex:1 1 360px;min-width:0">
    ${content}
  </section>`;

const groceries = (theme) => list(`
  <pastis-task-row task-title="Buy oat milk" due="Today 14:00" flagged tags='["errands"]'></pastis-task-row>
  <pastis-task-row task-title="Renew passport" due="Yesterday" overdue priority="3"></pastis-task-row>
  <pastis-task-row task-title="Water the plants" due="Sat 09:00" repeats></pastis-task-row>
  <pastis-task-row task-title="Plan the weekend trip to Ghent" subtasks="2/5"></pastis-task-row>
  <pastis-task-row task-title="Book train tickets" indent></pastis-task-row>
  <pastis-task-row task-title="Pay the electricity bill" done></pastis-task-row>
`, `Personal (${theme})`);

/**
 * A task in a list: round completion toggle, title button, meta line, actions.
 *
 * Render rows inside `role="list"` (the host is a `listitem`). The title text is the `task-title`
 * attribute (`taskTitle` property), not `title`, which is the browser's tooltip.
 *
 * The toggle fires a cancelable `pastis-toggle` with the new `done`; cancel it to keep the row
 * controlled. The title fires `pastis-open`. The meta line is read as the title's description.
 */
export default {
  title: 'Data Display/TaskRow',
  component: 'pastis-task-row',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    taskTitle: { control: 'text' },
    done: { control: 'boolean' },
    toggleLabel: { control: 'text' },
    due: { control: 'text' },
    overdue: { control: 'boolean' },
    repeats: { control: 'boolean' },
    flagged: { control: 'boolean' },
    priority: { control: { type: 'range', min: 0, max: 3, step: 1 } },
    subtasks: { control: 'text' },
    tags: { control: 'object' },
    indent: { control: 'boolean' },
    disabled: { control: 'boolean' },
    selected: { control: 'boolean' },
    density: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: {
    taskTitle: 'Buy oat milk',
    done: false,
    due: '',
    overdue: false,
    repeats: false,
    flagged: false,
    priority: 0,
    subtasks: '',
    tags: [],
    indent: false,
    disabled: false,
    selected: false,
    density: 'default',
  },
  render: (args) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = list(`
    <pastis-task-row
      task-title="${esc(args.taskTitle ?? '')}"
      ${args.toggleLabel ? `toggle-label="${esc(args.toggleLabel)}"` : ''}
      ${args.due ? `due="${esc(args.due)}"` : ''}
      ${args.priority ? `priority="${args.priority}"` : ''}
      ${args.subtasks ? `subtasks="${esc(args.subtasks)}"` : ''}
      ${args.done ? 'done' : ''}
      ${args.overdue ? 'overdue' : ''}
      ${args.repeats ? 'repeats' : ''}
      ${args.flagged ? 'flagged' : ''}
      ${args.indent ? 'indent' : ''}
      ${args.selected ? 'selected' : ''}
      ${args.density === 'compact' ? 'density="compact"' : ''}
      ${args.disabled ? 'disabled' : ''}
    ></pastis-task-row>
  `);
    // An array: set as a property, no attribute quoting involved
    wrap.querySelector('pastis-task-row').tags = Array.isArray(args.tags) ? args.tags : [];
    return wrap;
  },
};

export const Plain = {};

export const Done = { args: { taskTitle: 'Pay the electricity bill', done: true } };

export const Overdue = { args: { taskTitle: 'Renew passport', due: 'Yesterday 17:00', overdue: true } };

export const DueToday = { args: { taskTitle: 'Call the dentist', due: 'Today 14:00' } };

/** Every meta item at once: due, repeats, flagged, priority, subtasks and tags. */
export const AllMeta = {
  args: {
    taskTitle: 'Prepare the quarterly review',
    due: 'Fri 10:00',
    repeats: true,
    flagged: true,
    priority: 2,
    subtasks: '2/5',
    tags: ['work', 'planning'],
  },
};

/** Each meta item on its own, and a few combinations. */
export const MetaCombinations = {
  render: () => list(`
    <pastis-task-row task-title="Call the dentist" due="Today 14:00"></pastis-task-row>
    <pastis-task-row task-title="Renew passport" due="Yesterday" overdue></pastis-task-row>
    <pastis-task-row task-title="Water the plants" repeats></pastis-task-row>
    <pastis-task-row task-title="Reply to Anna about the flat" flagged></pastis-task-row>
    <pastis-task-row task-title="Submit the tax return" priority="1"></pastis-task-row>
    <pastis-task-row task-title="Fix the leaking tap" priority="2"></pastis-task-row>
    <pastis-task-row task-title="Send the invoice to the client" priority="3"></pastis-task-row>
    <pastis-task-row task-title="Plan the weekend trip to Ghent" subtasks="2/5"></pastis-task-row>
    <pastis-task-row task-title="Buy oat milk" tags='["errands", "groceries"]'></pastis-task-row>
    <pastis-task-row task-title="Take out the recycling" due="Tue 07:00" repeats flagged></pastis-task-row>
    <pastis-task-row task-title="Book the car service" due="Last Monday" overdue priority="3" flagged></pastis-task-row>
    <pastis-task-row task-title="Pick up the dry cleaning" due="Today 17:30" tags='["errands"]' done></pastis-task-row>
  `),
};

/** A long title wraps to two lines, then ends with an ellipsis. */
export const LongTitle = {
  args: {
    taskTitle: 'Ask the landlord whether the heating engineer can come by on Thursday afternoon instead, because the Wednesday slot clashes with the school pick-up and the parents’ evening',
    due: 'Thu 13:00',
  },
};

/** A subtask is indented one level under its parent. */
export const SubtaskUnderParent = {
  render: () => list(`
    <pastis-task-row task-title="Plan the weekend trip to Ghent" subtasks="1/3"></pastis-task-row>
    <pastis-task-row task-title="Book train tickets" indent done></pastis-task-row>
    <pastis-task-row task-title="Reserve a table at the brasserie" indent></pastis-task-row>
    <pastis-task-row task-title="Pack the camera charger" indent></pastis-task-row>
  `),
};

export const Disabled = { args: { taskTitle: 'Renew passport', due: 'Next week', disabled: true } };

/** App buttons in the `actions` slot, reached after the title with Tab. */
export const WithActions = {
  render: () => list(`
    <pastis-task-row task-title="Buy oat milk" due="Today 14:00">
      <pastis-button slot="actions" variant="ghost" size="sm" aria-label="Rename Buy oat milk">Rename</pastis-button>
      <pastis-button slot="actions" variant="ghost" size="sm" aria-label="Delete Buy oat milk">Delete</pastis-button>
    </pastis-task-row>
  `),
};

/** A list of rows in a `role="list"`, as an app renders one. */
export const List = { render: () => groceries('dark') };

/** The same list in the dark and the light theme. */
export const BothThemes = {
  render: () => `<div style="display:flex;flex-wrap:wrap">${panel('dark', groceries('dark'))}${panel('light', groceries('light'))}</div>`,
};

/**
 * Controlled: the app cancels `pastis-toggle` and sets `done` itself (here after a short delay,
 * as after a save).
 */
export const Controlled = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = list(`<pastis-task-row task-title="Renew passport" due="Next week"></pastis-task-row>`);
    const row = wrap.querySelector('pastis-task-row');
    row.addEventListener('pastis-toggle', (e) => {
      e.preventDefault();
      setTimeout(() => { row.done = e.detail.done; }, 300);
    });
    return wrap;
  },
};

const backlog = [
  ['Doing', 'Ship the 2.11 release', 'Today', 'Platform', '!!!'],
  ['To do', 'Write release notes for the spring update and the store listing', 'Tomorrow', 'Platform', ''],
  ['Verify', 'Check the sync fix on the phone', 'Yesterday', 'Quality assurance and release', '!'],
  ['Inbox', 'Triage the crash report', '', 'Platform', ''],
];

const compactRows = (theme) => `
  <div role="list" aria-label="Platform (${theme})" style="max-width:720px;background:var(--bg-primary);--pastis-task-row-columns:[status] 4rem [due] 6rem [list] 7rem [priority] 2rem">
    ${backlog.map(([status, title, due, list, priority], i) => `
      <pastis-task-row density="compact" task-title="${esc(title)}" ${due ? `due="${due}"` : ''} ${i === 0 ? 'selected' : ''}>
        <span slot="meta" aria-hidden="true" style="grid-column: status">${status}</span>
        <span slot="meta" aria-hidden="true" style="grid-column: due">${due}</span>
        <span slot="meta" aria-hidden="true" style="grid-column: list">${list}</span>
        <span slot="meta" aria-hidden="true" style="grid-column: priority;color:var(--text-accent)">${priority}</span>
        <pastis-button slot="actions" variant="ghost" size="sm" aria-label="Flag ${esc(title)}">Flag</pastis-button>
        <pastis-button slot="actions" variant="ghost" size="sm" aria-label="More for ${esc(title)}">More</pastis-button>
      </pastis-task-row>`).join('')}
  </div>`;

/**
 * Compact density for desktop lists: one line per row, the `meta` slot's cells in the tracks of
 * `--pastis-task-row-columns` (set on the list, so they line up), actions on hover and focus. The
 * first row is `selected`.
 */
export const Compact = { render: () => compactRows('dark') };

/** Compact rows without slotted cells: the built-in meta follows the title on its line. */
export const CompactBuiltInMeta = {
  render: () => list(`
    <pastis-task-row density="compact" task-title="Buy oat milk" due="Today 14:00" flagged tags='["errands"]'></pastis-task-row>
    <pastis-task-row density="compact" task-title="Renew passport" due="Yesterday" overdue priority="3"></pastis-task-row>
    <pastis-task-row density="compact" task-title="Pay the electricity bill" done></pastis-task-row>
  `),
};

/** Compact rows in both themes. */
export const CompactBothThemes = {
  render: () => `<div style="display:flex;flex-wrap:wrap">${panel('dark', compactRows('dark'))}${panel('light', compactRows('light'))}</div>`,
};

/** A selected row in the default density (its details are open). */
export const Selected = { args: { taskTitle: 'Buy oat milk', due: 'Today 14:00', selected: true } };

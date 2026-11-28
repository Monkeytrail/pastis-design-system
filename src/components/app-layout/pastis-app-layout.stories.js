import { expect } from 'storybook/test';
import './pastis-app-layout.js';
import '../sidebar/pastis-sidebar.js';
import '../task-row/pastis-task-row.js';
import '../button/pastis-button.js';
import '../empty-state/pastis-empty-state.js';

const tasks = [
  ['Doing', 'Ship the 2.11 release', 'Today', 'Platform'],
  ['To do', 'Write release notes', 'Tomorrow', 'Platform'],
  ['To do', 'Update the screenshots for the store listing', 'Fri 4 Dec', 'Marketing'],
  ['Inbox', 'Triage the crash report from the beta', '', 'Platform'],
  ['Verify', 'Check the sync fix on the phone', 'Yesterday', 'QA'],
];

/**
 * A layout with a sidebar, a compact list and the open item. The story keeps it controlled: the
 * sidebar button folds the sidebar, a row opens the detail, Close and Esc close it, and the
 * splitter's width is applied.
 */
function appLayout({ sidebarCollapsed = false, detailOpen = true, detailWidth = 420, breakpoint = 0 } = {}) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <pastis-app-layout breakpoint="${breakpoint}" detail-width="${detailWidth}" ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${detailOpen ? 'detail-open' : ''}
      style="--pastis-app-layout-height: 560px; border: 1px solid var(--border-subtle)">
      <pastis-sidebar slot="sidebar" label="Views and lists">
        <pastis-button slot="header" size="sm">Add item</pastis-button>
        <pastis-sidebar-item href="#today" icon="today" label="Today" count="2" count-label="2 items due"></pastis-sidebar-item>
        <pastis-sidebar-item href="#all" icon="layers" label="All"></pastis-sidebar-item>
        <pastis-sidebar-section label="Work">
          <pastis-sidebar-item href="#platform" icon="board" label="Platform" count="5" current></pastis-sidebar-item>
          <pastis-sidebar-item href="#marketing" icon="list" label="Marketing" count="1"></pastis-sidebar-item>
        </pastis-sidebar-section>
        <span slot="footer" style="font-size:var(--font-size-caption);color:var(--text-tertiary)">Synced just now</span>
      </pastis-sidebar>
      <div style="padding:16px;font-family:var(--font-family-body)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <pastis-button class="fold" size="sm" variant="ghost" aria-pressed="${!sidebarCollapsed}">Sidebar</pastis-button>
          <h1 style="margin:0;font-size:var(--font-size-h4)">Platform</h1>
        </div>
        <div role="list" aria-label="Platform" style="--pastis-task-row-columns: [status] 4rem [due] 6rem [list] 6rem">
          ${tasks.map(([status, title, due, list], i) => `
            <pastis-task-row density="compact" task-title="${title}" ${due ? `due="${due}"` : ''} ${i === 0 && detailOpen ? 'selected' : ''}>
              <span slot="meta" aria-hidden="true" style="grid-column: status">${status}</span>
              <span slot="meta" aria-hidden="true" style="grid-column: due">${due}</span>
              <span slot="meta" aria-hidden="true" style="grid-column: list">${list}</span>
              <pastis-button slot="actions" size="sm" variant="ghost" aria-label="Flag ${title}">Flag</pastis-button>
            </pastis-task-row>`).join('')}
        </div>
      </div>
      <div slot="detail" style="padding:16px;font-family:var(--font-family-body)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h2 class="detail-title" style="margin:0;font-size:var(--font-size-h4)">${tasks[0][1]}</h2>
          <pastis-button class="close" size="sm" variant="ghost">Close</pastis-button>
        </div>
        <p style="color:var(--text-secondary)">Tag the release, publish the notes and tell the beta testers.</p>
      </div>
    </pastis-app-layout>`;
  const layout = wrap.querySelector('pastis-app-layout');
  wrap.addEventListener('pastis-navigate', e => e.preventDefault());
  wrap.querySelector('.fold').addEventListener('click', (e) => {
    layout.sidebarCollapsed = !layout.sidebarCollapsed;
    e.currentTarget.setAttribute('aria-pressed', String(!layout.sidebarCollapsed));
  });
  wrap.querySelector('.close').addEventListener('click', () => { layout.detailOpen = false; });
  wrap.addEventListener('pastis-open', (e) => {
    for (const row of wrap.querySelectorAll('pastis-task-row')) row.selected = row === e.target;
    wrap.querySelector('.detail-title').textContent = e.target.taskTitle;
    layout.detailOpen = true;
  });
  return wrap;
}

/**
 * App layout: sidebar · main · detail for desktop apps, each pane scrolling on its own. Below the
 * `breakpoint` only the main pane renders. These stories set `breakpoint="0"` so they stay wide
 * in a narrow canvas.
 */
export default {
  title: 'Layout/AppLayout',
  component: 'pastis-app-layout',
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' }, layout: 'fullscreen' },
  argTypes: {
    sidebarCollapsed: { control: 'boolean' },
    detailOpen: { control: 'boolean' },
    detailWidth: { control: { type: 'number', min: 380, step: 16 } },
    breakpoint: { control: { type: 'number', min: 0, step: 64 } },
  },
  args: { sidebarCollapsed: false, detailOpen: true, detailWidth: 420, breakpoint: 0 },
  render: appLayout,
};

export const Default = {
  play: async ({ canvasElement, step }) => {
    const layout = canvasElement.querySelector('pastis-app-layout');
    const separator = () => layout.shadowRoot.querySelector('[role="separator"]');
    await step('three landmarks', async () => {
      await expect(layout.mode).toBe('wide');
      await expect(layout.shadowRoot.querySelector('nav').getAttribute('aria-label')).toBe('Sidebar');
      await expect(layout.shadowRoot.querySelector('main')).toBeTruthy();
      await expect(layout.shadowRoot.querySelector('aside')).toBeTruthy();
    });
    await step('the splitter resizes from the keyboard', async () => {
      separator().focus();
      separator().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await layout.updateComplete;
      await expect(separator().getAttribute('aria-valuenow')).toBe('380');
    });
  },
};

export const SidebarCollapsed = { args: { sidebarCollapsed: true } };

export const DetailClosed = { args: { detailOpen: false } };

/** Below the breakpoint only the main slot renders (here the breakpoint is set very high). */
export const Narrow = { args: { breakpoint: 100000 } };

/** Nothing selected: the app shows an empty state in the detail pane. */
export const NothingSelected = {
  render: () => {
    const wrap = appLayout();
    const detail = wrap.querySelector('[slot="detail"]');
    detail.innerHTML = '<pastis-empty-state heading="No item selected" body="Pick an item in the list to see it here."></pastis-empty-state>';
    for (const row of wrap.querySelectorAll('pastis-task-row')) row.removeAttribute('selected');
    return wrap;
  },
};

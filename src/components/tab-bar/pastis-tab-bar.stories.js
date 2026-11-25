import './pastis-tab-bar.js';

/**
 * A phone-sized frame. `transform` makes it the containing block of the fixed tab bar, so the bar
 * sits at the bottom of the frame instead of the docs page.
 */
const phone = (bar, { theme, current = 'today', width = 390 } = {}) => `
  <div ${theme ? `data-theme="${theme}"` : ''} style="position:relative;transform:translateZ(0);overflow:hidden;width:${width}px;max-width:100%;height:560px;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border-default);border-radius:var(--radius-xl);font-family:var(--font-family-body)">
    <div style="height:100%;overflow:auto;padding:24px 16px var(--pastis-tab-bar-height)">
      <p style="margin:0 0 8px;font-size:var(--font-size-h4);font-weight:var(--font-weight-bold)">${{ today: 'Today', scheduled: 'Scheduled', lists: 'Lists' }[current]}</p>
      <p style="margin:0;color:var(--text-tertiary)">The page pads its bottom with <code>--pastis-tab-bar-height</code>.</p>
    </div>
    ${bar}
  </div>`;

const bar = (current = 'today', label = 'Main') => `
  <pastis-tab-bar label="${label}">
    <pastis-tab-bar-item href="#today" icon="today" label="Today" badge="3" badge-label="3 items" ${current === 'today' ? 'current' : ''}></pastis-tab-bar-item>
    <pastis-tab-bar-item href="#scheduled" icon="calendar" label="Scheduled" ${current === 'scheduled' ? 'current' : ''}></pastis-tab-bar-item>
    <pastis-tab-bar-item href="#lists" icon="list" label="Lists" ${current === 'lists' ? 'current' : ''}></pastis-tab-bar-item>
    <pastis-tab-bar-item href="#search" icon="search" label="Search" hidden></pastis-tab-bar-item>
  </pastis-tab-bar>`;

/**
 * Bottom navigation for the installed app: a `nav` landmark named by `label`, with
 * `<pastis-tab-bar-item>` links (`aria-current="page"` on the `current` one).
 *
 * Fixed to the bottom of the viewport, clear of the iPhone home indicator
 * (`env(safe-area-inset-bottom)`, which needs `viewport-fit=cover`). Pad the page with
 * `var(--pastis-tab-bar-height)`, its full height.
 *
 * A plain click fires a cancelable `pastis-navigate` with `detail.href`: a client-side router
 * cancels it and navigates itself; otherwise the link is followed. A badge's meaning goes in
 * `badge-label` (“3 items” makes the link “Today, 3 items”). `hidden` items are not rendered.
 */
export default {
  title: 'Navigation/TabBar',
  component: 'pastis-tab-bar',
  subcomponents: { TabBarItem: 'pastis-tab-bar-item' },
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    current: { control: 'select', options: ['today', 'scheduled', 'lists'] },
  },
  args: { current: 'today' },
  render: (args) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = phone(bar(args.current), { current: args.current });
    // Stand-in for a client-side router: cancel the navigation and move `current`
    wrap.addEventListener('pastis-navigate', (e) => {
      e.preventDefault();
      wrap.querySelectorAll('pastis-tab-bar-item').forEach((item) => {
        item.current = item.href === e.detail.href;
      });
    });
    return wrap;
  },
};

/** Today is current, with a badge; Search is `hidden`. Click an item: the story's router moves `current`. */
export const Default = {};

export const ScheduledCurrent = { args: { current: 'scheduled' } };

export const ListsCurrent = { args: { current: 'lists' } };

/** The same bar in the dark and the light theme. */
export const BothThemes = {
  render: () => `
    <div style="display:flex;flex-wrap:wrap;gap:24px">
      ${phone(bar('today', 'Main (dark)'), { theme: 'dark' })}
      ${phone(bar('scheduled', 'Main (light)'), { theme: 'light', current: 'scheduled' })}
    </div>`,
};

/** A small phone (320 px wide, iPhone SE): the items still share the width evenly. */
export const PhoneWidth = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => phone(`
    <pastis-tab-bar label="Main">
      <pastis-tab-bar-item href="#today" icon="today" label="Today" badge="12" badge-label="12 items" current></pastis-tab-bar-item>
      <pastis-tab-bar-item href="#scheduled" icon="calendar" label="Scheduled"></pastis-tab-bar-item>
      <pastis-tab-bar-item href="#lists" icon="list" label="Lists"></pastis-tab-bar-item>
      <pastis-tab-bar-item href="#search" icon="search" label="Search"></pastis-tab-bar-item>
    </pastis-tab-bar>`, { width: 320 }),
};

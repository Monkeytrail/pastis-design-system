import { describe, it, expect, afterEach, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-task-row.js';
import '../button/pastis-button.js';

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  // Nested Pastis elements (icons, tags) inside the rows' shadow roots
  await new Promise(requestAnimationFrame);
  return container;
}

/** Rows inside a list, on Pastis's dark surface (the tokens' default), as in the stories. */
const inList = (rows) => `<div role="list" aria-label="Personal" style="background:#110d0a">${rows}</div>`;

/** Every accessibility-tree node (Chrome's own) of the test page. */
async function axNodes() {
  const session = cdp();
  await session.send('Accessibility.enable');
  const { frameTree } = await session.send('Page.getFrameTree');
  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
  return nodes.filter(n => !n.ignored);
}

describe('pastis-task-row', () => {
  let container;
  const row = () => container.querySelector('pastis-task-row');
  const toggle = () => row().shadowRoot.querySelector('.toggle');
  const title = () => row().shadowRoot.querySelector('.title');
  const meta = () => row().shadowRoot.querySelector('.meta');

  afterEach(() => container?.remove());

  // ─── Default render, roles and names ──────────────────────────────────────

  it('has correct default property values', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    expect(row().taskTitle).toBe('Buy oat milk');
    expect(row().done).toBe(false);
    expect(row().overdue).toBe(false);
    expect(row().repeats).toBe(false);
    expect(row().flagged).toBe(false);
    expect(row().priority).toBe(0);
    expect(row().tags).toEqual([]);
    expect(row().indent).toBe(false);
    expect(row().disabled).toBe(false);
  });

  it('is a list item with a checkbox toggle and a title button', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    expect(row().getAttribute('role')).toBe('listitem');
    await expect.element(page.getByRole('listitem')).toBeInTheDocument();
    await expect.element(page.getByRole('checkbox', { name: 'Complete Buy oat milk', exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Buy oat milk', exact: true })).toBeInTheDocument();
    expect(toggle().getAttribute('aria-checked')).toBe('false');
  });

  it("keeps an author's role", async () => {
    container = await mount('<ul><pastis-task-row role="none" task-title="Buy oat milk"></pastis-task-row></ul>');
    expect(row().getAttribute('role')).toBe('none');
  });

  it('Chrome exposes one listitem, one checkbox and one button, named as expected', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    const nodes = await axNodes();
    const list = nodes.filter(n => n.role?.value === 'list');
    expect(list).toHaveLength(1);
    expect(nodes.filter(n => n.role?.value === 'listitem')).toHaveLength(1);
    const checkboxes = nodes.filter(n => n.role?.value === 'checkbox');
    expect(checkboxes).toHaveLength(1);
    expect(checkboxes[0].name.value).toBe('Complete Buy oat milk');
    expect(checkboxes[0].properties.find(p => p.name === 'checked')?.value.value).toBe('false');
    const buttons = nodes.filter(n => n.role?.value === 'button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].name.value).toBe('Buy oat milk');
    expect(buttons[0].description?.value ?? '').toBe('');
  });

  it('title is not the global title attribute (no tooltip)', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    expect(row().hasAttribute('title')).toBe(false);
    expect(row().shadowRoot.querySelector('[title]')).toBeNull();
  });

  it('an empty title is named "Untitled task" (toggle "Complete Untitled task"), axe clean', async () => {
    container = await mount(`<main style="color:var(--text-primary)">${inList('<pastis-task-row></pastis-task-row>')}</main>`);
    await expect.element(page.getByRole('checkbox', { name: 'Complete Untitled task', exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Untitled task', exact: true })).toBeInTheDocument();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
    // A title replaces the fallback, and the button is named by its text again
    row().taskTitle = 'Buy oat milk';
    await row().updateComplete;
    expect(title().hasAttribute('aria-label')).toBe(false);
    await expect.element(page.getByRole('checkbox', { name: 'Complete Buy oat milk', exact: true })).toBeInTheDocument();
  });

  it('toggle-label overrides the toggle name', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk" toggle-label="Mark Buy oat milk as done"></pastis-task-row>'));
    await expect.element(page.getByRole('checkbox', { name: 'Mark Buy oat milk as done', exact: true })).toBeInTheDocument();
  });

  it('the title text is shown as written, not uppercased', async () => {
    container = await mount(inList('<pastis-task-row task-title="Call Dr. van Dijk about the iPhone"></pastis-task-row>'));
    expect(title().textContent.trim()).toBe('Call Dr. van Dijk about the iPhone');
    expect(getComputedStyle(title()).textTransform).toBe('none');
    expect(getComputedStyle(title().querySelector('.title-text')).textTransform).toBe('none');
  });

  // ─── Toggling ─────────────────────────────────────────────────────────────

  it('click toggles done and fires pastis-toggle with the new value', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    const handler = vi.fn();
    row().addEventListener('pastis-toggle', handler);
    await userEvent.click(toggle());
    await row().updateComplete;
    expect(row().done).toBe(true);
    expect(row().hasAttribute('done')).toBe(true);
    expect(toggle().getAttribute('aria-checked')).toBe('true');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ done: true });
    await userEvent.click(toggle());
    await row().updateComplete;
    expect(row().done).toBe(false);
    expect(handler.mock.calls[1][0].detail).toEqual({ done: false });
  });

  it('Space toggles; Enter does not', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    toggle().focus();
    await userEvent.keyboard(' ');
    await row().updateComplete;
    expect(row().done).toBe(true);
    await userEvent.keyboard('{Enter}');
    await row().updateComplete;
    expect(row().done).toBe(true);
    await userEvent.keyboard(' ');
    await row().updateComplete;
    expect(row().done).toBe(false);
  });

  it('pastis-toggle bubbles, is composed and cancelable', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    let event;
    document.body.addEventListener('pastis-toggle', (e) => { event = e; }, { once: true });
    toggle().click();
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.cancelable).toBe(true);
  });

  it('a cancelled pastis-toggle leaves done unchanged (controlled)', async () => {
    container = await mount(inList('<pastis-task-row task-title="Renew passport"></pastis-task-row>'));
    const onToggle = vi.fn(e => e.preventDefault());
    container.addEventListener('pastis-toggle', onToggle);
    await userEvent.click(toggle());
    await row().updateComplete;
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle.mock.calls[0][0].detail).toEqual({ done: true });
    expect(row().done).toBe(false);
    expect(toggle().getAttribute('aria-checked')).toBe('false');
    // The app sets it itself
    row().done = true;
    await row().updateComplete;
    expect(toggle().getAttribute('aria-checked')).toBe('true');
  });

  it('setting done does not fire pastis-toggle', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    const handler = vi.fn();
    row().addEventListener('pastis-toggle', handler);
    row().done = true;
    await row().updateComplete;
    expect(handler).not.toHaveBeenCalled();
  });

  it('the toggle is a target of at least 44 × 44 px', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    const rect = toggle().getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);
  });

  it('done: the circle is filled with a check and the title struck through, still ≥ 4.5:1', async () => {
    container = await mount(inList('<pastis-task-row task-title="Pay the electricity bill" done></pastis-task-row>'));
    const circle = row().shadowRoot.querySelector('.circle');
    expect(circle.querySelector('pastis-icon[name="check"]')).toBeTruthy();
    expect(getComputedStyle(circle).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(title().querySelector('.title-text')).textDecorationLine).toBe('line-through');
    const results = await axe.run(container, { runOnly: ['color-contrast'] });
    expect(results.violations).toEqual([]);
    expect(results.passes.length).toBeGreaterThan(0);
  });

  // ─── Title ────────────────────────────────────────────────────────────────

  it('the title fires pastis-open (bubbles, composed) on click, Enter and Space', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    const events = [];
    document.body.addEventListener('pastis-open', (e) => events.push(e));
    await userEvent.click(title());
    title().focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(events).toHaveLength(3);
    expect(events[0].bubbles).toBe(true);
    expect(events[0].composed).toBe(true);
    expect(events[0].target).toBe(row());
    expect(row().done).toBe(false);
  });

  it('a long title wraps to two lines, then an ellipsis', async () => {
    const long = 'Ask the landlord whether the heating engineer can come by on Thursday afternoon instead, because the Wednesday slot clashes with the school pick-up and the parents’ evening';
    container = await mount(`<div style="width:320px">${inList(`<pastis-task-row task-title="${long}"></pastis-task-row>`)}</div>`);
    const text = title().querySelector('.title-text');
    const style = getComputedStyle(text);
    expect(style.webkitLineClamp).toBe('2');
    expect(text.scrollHeight).toBeGreaterThan(text.clientHeight);
    const lineHeight = parseFloat(style.lineHeight);
    expect(text.clientHeight).toBeCloseTo(lineHeight * 2, 0);
    // The full title is still the accessible name
    await expect.element(page.getByRole('button', { name: long, exact: true })).toBeInTheDocument();
  });

  // ─── Meta line ────────────────────────────────────────────────────────────

  it('no meta line when nothing is set', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    expect(meta()).toBeNull();
    expect(title().hasAttribute('aria-describedby')).toBe(false);
  });

  it.each([
    ['due', 'due="Today 14:00"', 'Today 14:00'],
    ['overdue', 'due="Yesterday" overdue', 'Overdue: Yesterday'],
    ['overdue without a due date', 'overdue', 'Overdue'],
    ['repeats', 'repeats', 'Repeats'],
    ['flagged', 'flagged', 'Flagged'],
    ['priority 1', 'priority="1"', 'Priority low'],
    ['priority 2', 'priority="2"', 'Priority medium'],
    ['priority 3', 'priority="3"', 'Priority high'],
    ['subtasks', 'subtasks="2/5"', 'Subtasks 2/5'],
    ['tags', `tags='["errands", "groceries"]'`, 'Tags: errands, groceries'],
  ])('meta %s is the title’s description', async (_name, attrs, description) => {
    container = await mount(inList(`<pastis-task-row task-title="Buy oat milk" ${attrs}></pastis-task-row>`));
    expect(title().getAttribute('aria-describedby')).toBe('description');
    await expect.element(page.getByRole('button', { name: 'Buy oat milk' })).toHaveAccessibleDescription(description);
  });

  it('Chrome reads the whole meta line as the description, comma separated', async () => {
    container = await mount(inList(`
      <pastis-task-row task-title="Prepare the quarterly review" due="Fri 10:00" repeats flagged priority="2" subtasks="2/5" tags='["work", "planning"]'></pastis-task-row>`));
    const [button] = (await axNodes()).filter(n => n.role?.value === 'button');
    expect(button.name.value).toBe('Prepare the quarterly review');
    expect(button.description.value).toBe('Fri 10:00, Repeats, Flagged, Priority medium, Subtasks 2/5, Tags: work, planning');
  });

  it('shows the visible meta: icons, priority marks, subtasks and tag chips', async () => {
    container = await mount(inList(`
      <pastis-task-row task-title="Prepare the quarterly review" due="Fri 10:00" repeats flagged priority="3" subtasks="2/5" tags='["work"]'></pastis-task-row>`));
    const icons = [...meta().querySelectorAll('pastis-icon')].map(i => i.name);
    expect(icons).toEqual(['clock', 'repeat', 'flag', 'subtasks']);
    expect(meta().querySelector('.priority').textContent).toBe('!!!');
    // Visual only: the words are the title's description
    expect(meta().getAttribute('aria-hidden')).toBe('true');
    expect(meta().querySelector('.subtasks').textContent).toContain('2/5');
    const tag = meta().querySelector('pastis-tag');
    expect(tag.textContent).toBe('work');
    // Tags keep their case (pastis-tag uppercases by default)
    expect(getComputedStyle(tag.shadowRoot.querySelector('.tag')).textTransform).toBe('none');
  });

  it('priority outside 1–3 shows nothing', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk" priority="0"></pastis-task-row>'));
    expect(meta()).toBeNull();
    row().priority = 7;
    await row().updateComplete;
    expect(meta()).toBeNull();
  });

  it('tags as a property', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>'));
    row().tags = ['errands'];
    await row().updateComplete;
    expect(meta().querySelector('pastis-tag').textContent).toBe('errands');
  });

  it('overdue: alert icon and the error text colour (styling hook)', async () => {
    container = await mount(inList('<pastis-task-row task-title="Renew passport" due="Yesterday" overdue></pastis-task-row>'));
    expect(row().hasAttribute('overdue')).toBe(true);
    const due = meta().querySelector('.due');
    expect(due.classList.contains('overdue')).toBe(true);
    expect(due.querySelector('pastis-icon').name).toBe('alert');
    expect(getComputedStyle(due).color).toBe('rgb(244, 95, 107)'); // --text-error, dark
    const results = await axe.run(container, { runOnly: ['color-contrast'] });
    expect(results.violations).toEqual([]);
  });

  it('overdue in the light theme keeps 4.5:1 (--text-error)', async () => {
    container = await mount(`<div data-theme="light" style="background:#f4f1ea">
      <div role="list" aria-label="Personal"><pastis-task-row task-title="Renew passport" due="Yesterday" overdue></pastis-task-row></div></div>`);
    const due = meta().querySelector('.due');
    expect(getComputedStyle(due).color).toBe('rgb(192, 18, 47)');
    const results = await axe.run(container, { runOnly: ['color-contrast'] });
    expect(results.violations).toEqual([]);
  });

  // ─── Indent ───────────────────────────────────────────────────────────────

  it('indent moves the row in by one level', async () => {
    container = await mount(inList(`
      <pastis-task-row task-title="Plan the weekend trip to Ghent"></pastis-task-row>
      <pastis-task-row task-title="Book train tickets" indent></pastis-task-row>`));
    const [parent, child] = container.querySelectorAll('pastis-task-row');
    const left = (r) => r.shadowRoot.querySelector('.toggle').getBoundingClientRect().left;
    expect(left(child) - left(parent)).toBe(32);
  });

  // ─── Disabled ─────────────────────────────────────────────────────────────

  it('disabled: toggle and title are disabled, nothing fires', async () => {
    container = await mount(inList('<pastis-task-row task-title="Renew passport" disabled></pastis-task-row>'));
    const handler = vi.fn();
    row().addEventListener('pastis-toggle', handler);
    row().addEventListener('pastis-open', handler);
    expect(toggle().disabled).toBe(true);
    expect(title().disabled).toBe(true);
    toggle().click();
    title().click();
    await row().updateComplete;
    expect(row().done).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    await expect.element(page.getByRole('checkbox', { name: 'Complete Renew passport' })).toBeDisabled();
    row().disabled = false;
    await row().updateComplete;
    expect(toggle().disabled).toBe(false);
    expect(title().disabled).toBe(false);
  });

  // ─── Actions slot and keyboard order ──────────────────────────────────────

  it('slotted actions are projected at the end and reached after toggle and title', async () => {
    container = await mount(`
      <button>Before</button>
      ${inList(`
        <pastis-task-row task-title="Buy oat milk">
          <pastis-button slot="actions" variant="ghost" size="sm">Rename</pastis-button>
          <pastis-button slot="actions" variant="ghost" size="sm">Delete</pastis-button>
        </pastis-task-row>`)}
      <button>After</button>`);
    const slot = row().shadowRoot.querySelector('slot[name="actions"]');
    expect(slot.assignedElements().map(e => e.textContent)).toEqual(['Rename', 'Delete']);
    const [rename, del] = container.querySelectorAll('pastis-button');
    expect(rename.getBoundingClientRect().left).toBeGreaterThan(title().getBoundingClientRect().right - 1);

    container.querySelector('button').focus();
    await userEvent.tab();
    expect(row().shadowRoot.activeElement).toBe(toggle());
    await userEvent.tab();
    expect(row().shadowRoot.activeElement).toBe(title());
    await userEvent.tab();
    expect(document.activeElement).toBe(rename);
    await userEvent.tab();
    expect(document.activeElement).toBe(del);
    await userEvent.tab();
    expect(document.activeElement.textContent).toBe('After');
  });

  it('focus is visible on toggle and title (Pastis focus token)', async () => {
    container = await mount(`<button>Before</button>${inList('<pastis-task-row task-title="Buy oat milk"></pastis-task-row>')}`);
    container.querySelector('button').focus();
    await userEvent.tab();
    expect(getComputedStyle(toggle()).outlineStyle).toBe('solid');
    expect(getComputedStyle(toggle()).outlineColor).toBe('rgb(252, 186, 40)');
    await userEvent.tab();
    expect(getComputedStyle(title()).outlineStyle).toBe('solid');
    expect(getComputedStyle(title()).outlineColor).toBe('rgb(252, 186, 40)');
  });

  it('clicking the meta line opens the task too', async () => {
    container = await mount(inList('<pastis-task-row task-title="Buy oat milk" due="Today 14:00"></pastis-task-row>'));
    const handler = vi.fn();
    row().addEventListener('pastis-open', handler);
    // The title's hit area covers the meta line (Playwright sees the title on top, hence force)
    await userEvent.click(meta(), { force: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it.each([
    ['plain', 'task-title="Buy oat milk"'],
    ['done', 'task-title="Pay the electricity bill" done'],
    ['every meta item', `task-title="Prepare the quarterly review" due="Fri 10:00" overdue repeats flagged priority="2" subtasks="2/5" tags='["work"]'`],
    ['indented', 'task-title="Book train tickets" indent'],
    ['disabled', 'task-title="Renew passport" due="Next week" disabled'],
  ])('axe (all rules) is clean: %s, in both themes', async (_name, attrs) => {
    for (const [theme, bg] of [['dark', '#110d0a'], ['light', '#f4f1ea']]) {
      container = await mount(`<main data-theme="${theme}" style="background:${bg};color:var(--text-primary)"><h1>Today</h1>
        <div role="list" aria-label="Personal"><pastis-task-row ${attrs}>
          <pastis-button slot="actions" variant="ghost" size="sm" aria-label="Delete this task">Delete</pastis-button>
        </pastis-task-row></div></main>`);
      const results = await axe.run(container);
      expect(results.violations, theme).toEqual([]);
      container.remove();
    }
  });
});

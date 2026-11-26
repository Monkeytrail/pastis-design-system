import { describe, it, expect, afterEach } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-quick-add.js';

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  await new Promise(requestAnimationFrame);
  return container;
}

/** Every accessibility-tree node (Chrome's own) of the test page. */
async function axNodes() {
  const session = cdp();
  await session.send('Accessibility.enable');
  const { frameTree } = await session.send('Page.getFrameTree');
  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
  return nodes.filter(n => !n.ignored);
}

const TOKENS = [
  { id: 'due', label: 'Tomorrow 09:00', icon: 'calendar' },
  { id: 'tag:home', label: '#home', icon: 'tag' },
  { id: 'priority', label: 'Priority medium' },
];

/** A quick add whose events are recorded in `events`. */
async function mountBar(attrs = '', tokens = [], wrap = s => s) {
  const container = await mount(wrap(`<pastis-quick-add label="New item" ${attrs}></pastis-quick-add>`));
  const bar = container.querySelector('pastis-quick-add');
  bar.tokens = tokens;
  await bar.updateComplete;
  await new Promise(requestAnimationFrame);
  const events = [];
  for (const type of ['pastis-input', 'pastis-submit', 'pastis-token-remove']) {
    bar.addEventListener(type, e => events.push([type, e.detail]));
  }
  return { container, bar, events, input: bar.shadowRoot.querySelector('input') };
}

describe('pastis-quick-add', () => {
  let container;
  afterEach(() => container?.remove());

  it('reports every edit and submits on Enter with the value', async () => {
    const mounted = await mountBar();
    container = mounted.container;
    await userEvent.click(mounted.input);
    await userEvent.keyboard('Milk');
    expect(mounted.events.filter(([type]) => type === 'pastis-input').at(-1)).toEqual(['pastis-input', { value: 'Milk' }]);
    expect(mounted.bar.value).toBe('Milk');
    await userEvent.keyboard('{Enter}');
    expect(mounted.events.at(-1)).toEqual(['pastis-submit', { value: 'Milk' }]);
  });

  it('submits with the Add button, and not at all when blank', async () => {
    const mounted = await mountBar('value="   "');
    container = mounted.container;
    const add = mounted.bar.shadowRoot.querySelector('.submit');
    await userEvent.click(add);
    expect(mounted.events).toEqual([]);
    mounted.bar.value = 'Bread';
    await mounted.bar.updateComplete;
    await userEvent.click(add);
    expect(mounted.events).toEqual([['pastis-submit', { value: 'Bread' }]]);
  });

  it('the app sets the value back (e.g. empty once saved)', async () => {
    const mounted = await mountBar('value="Milk"');
    container = mounted.container;
    expect(mounted.input.value).toBe('Milk');
    mounted.bar.value = '';
    await mounted.bar.updateComplete;
    expect(mounted.input.value).toBe('');
  });

  it('shows the tokens with a remove button each, which fires its id and keeps focus in the bar', async () => {
    const mounted = await mountBar('', TOKENS);
    container = mounted.container;
    const tokens = [...mounted.bar.shadowRoot.querySelectorAll('.token')];
    expect(tokens.map(t => t.textContent.trim())).toEqual(['Tomorrow 09:00', '#home', 'Priority medium']);
    expect(tokens[0].querySelector('pastis-icon')?.getAttribute('name')).toBe('calendar');
    expect(tokens[2].querySelector('pastis-icon:not(.remove pastis-icon)')).toBeNull();
    const remove = tokens[1].querySelector('.remove');
    expect(remove.getAttribute('aria-label')).toBe('Remove #home');
    await userEvent.click(remove);
    expect(mounted.events).toEqual([['pastis-token-remove', { id: 'tag:home' }]]);
    expect(mounted.bar.shadowRoot.activeElement).toBe(mounted.input);
  });

  it('describes the input with the tokens', async () => {
    const mounted = await mountBar('', TOKENS);
    container = mounted.container;
    const summary = mounted.bar.shadowRoot.getElementById(mounted.input.getAttribute('aria-describedby'));
    expect(summary.textContent).toBe('Will set: Tomorrow 09:00, #home, Priority medium');
    mounted.bar.tokens = [];
    await mounted.bar.updateComplete;
    expect(mounted.input.hasAttribute('aria-describedby')).toBe(false);
  });

  it('passes maxlength, placeholder and the submit label through', async () => {
    const mounted = await mountBar('maxlength="500" placeholder="Call the plumber tomorrow #home" submit-label="Add item"');
    container = mounted.container;
    expect(mounted.input.getAttribute('maxlength')).toBe('500');
    expect(mounted.input.placeholder).toBe('Call the plumber tomorrow #home');
    expect(mounted.bar.shadowRoot.querySelector('.submit').textContent.trim()).toBe('Add item');
  });

  it('disabled: no input, no submit, no remove', async () => {
    const mounted = await mountBar('disabled value="Milk"', TOKENS);
    container = mounted.container;
    expect(mounted.input.disabled).toBe(true);
    expect(mounted.bar.shadowRoot.querySelector('.submit').disabled).toBe(true);
    expect([...mounted.bar.shadowRoot.querySelectorAll('.remove')].every(b => b.disabled)).toBe(true);
    mounted.bar.shadowRoot.querySelector('form').requestSubmit();
    expect(mounted.events).toEqual([]);
  });

  it('Chrome names the input by the label, describes it by the tokens, and lists them', async () => {
    const mounted = await mountBar('', TOKENS);
    container = mounted.container;
    const nodes = await axNodes();
    const input = nodes.find(n => n.role?.value === 'textbox');
    expect(input?.name.value).toBe('New item');
    expect(input?.description?.value).toBe('Will set: Tomorrow 09:00, #home, Priority medium');
    expect(nodes.find(n => n.role?.value === 'list')?.name.value).toBe('Will set');
    const buttons = nodes.filter(n => n.role?.value === 'button').map(n => n.name.value);
    expect(buttons).toEqual(['Add', 'Remove Tomorrow 09:00', 'Remove #home', 'Remove Priority medium']);
  });

  it.each([
    ['empty', ''],
    ['with tokens', 'value="Call the plumber tomorrow at 9 #home !!"'],
    ['disabled', 'disabled value="Milk"'],
  ])('axe (all rules) is clean: %s, in both themes', async (name, attrs) => {
    for (const [theme, bg] of [['dark', '#110d0a'], ['light', '#f4f1ea']]) {
      const mounted = await mountBar(attrs, name === 'with tokens' ? TOKENS : [], s => `<main data-theme="${theme}" style="background:${bg};color:var(--text-primary)"><h1>Groceries</h1>${s}</main>`);
      container = mounted.container;
      const results = await axe.run(container);
      expect(results.violations, theme).toEqual([]);
      container.remove();
    }
  });
});

import { expect } from 'storybook/test';
import './pastis-quick-add.js';

/** Escapes text for a double-quoted attribute. */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** What an app would show for “Call the plumber tomorrow at 9 #home !!”. */
const plumberTokens = [
  { id: 'due', label: 'Tomorrow 09:00', icon: 'calendar' },
  { id: 'tag:home', label: '#home', icon: 'tag' },
  { id: 'priority', label: 'Priority medium' },
];

/** Renders one bar from args; tokens are set as a property. */
function bar(args) {
  const wrap = document.createElement('div');
  wrap.style.maxWidth = '480px';
  wrap.innerHTML = `
    <pastis-quick-add
      label="${esc(args.label ?? '')}"
      ${args.value ? `value="${esc(args.value)}"` : ''}
      ${args.placeholder ? `placeholder="${esc(args.placeholder)}"` : ''}
      ${args.submitLabel ? `submit-label="${esc(args.submitLabel)}"` : ''}
      ${args.disabled ? 'disabled' : ''}
    ></pastis-quick-add>`;
  wrap.querySelector('pastis-quick-add').tokens = Array.isArray(args.tokens) ? args.tokens : [];
  return wrap;
}

const panel = (theme, content) => `
  <section data-theme="${theme}" aria-label="${theme === 'dark' ? 'Dark' : 'Light'} theme" style="background:var(--bg-primary);color:var(--text-primary);padding:16px;flex:1 1 320px;min-width:0">
    ${content}
  </section>`;

/**
 * Quick add: one line for a whole entry. The app parses the text and shows what it understood
 * as tokens below the input, each removable, before the entry is added with Enter or Add.
 */
export default {
  title: 'Basics/QuickAdd',
  component: 'pastis-quick-add',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    submitLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    tokens: { control: 'object' },
  },
  args: {
    label: 'New item',
    value: '',
    placeholder: 'Call the plumber tomorrow at 9 #home !!',
    submitLabel: '',
    disabled: false,
    tokens: [],
  },
  render: bar,
};

export const Default = {};

/** The app's tokens for the typed line; each has a remove button. */
export const WithTokens = {
  args: { value: 'Call the plumber tomorrow at 9 #home !!', tokens: plumberTokens },
  play: async ({ canvasElement, step }) => {
    const el = canvasElement.querySelector('pastis-quick-add');
    const removed = [];
    el.addEventListener('pastis-token-remove', e => removed.push(e.detail.id));
    await step('Removing a token reports its id', async () => {
      el.shadowRoot.querySelector('[aria-label="Remove #home"]').click();
      await expect(removed).toEqual(['tag:home']);
    });
  },
};

export const Disabled = { args: { value: 'Milk', disabled: true } };

/** Dark and light side by side, at phone width each. */
export const BothThemes = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexWrap = 'wrap';
    wrap.innerHTML = panel('dark', '<div style="max-width:375px"></div>') + panel('light', '<div style="max-width:375px"></div>');
    for (const [i, slot] of [...wrap.querySelectorAll('section > div')].entries()) {
      slot.append(bar({ label: i === 0 ? 'New item (dark)' : 'New item (light)', value: 'Call the plumber tomorrow at 9 #home !!', tokens: plumberTokens }));
    }
    return wrap;
  },
};

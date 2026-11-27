import { expect } from 'storybook/test';
import './pastis-select.js';

const lists = [
  { value: 'groceries', label: 'Groceries' },
  { value: 'hardware', label: 'Hardware store' },
  { value: 'backlog', label: 'Work backlog' },
];

function select({ label, value, helper, error, required, disabled }) {
  const el = document.createElement('pastis-select');
  Object.assign(el, { label, value, helper, error, required, disabled, options: lists });
  return el;
}

/** Select: one choice from a list, with the platform's own picker. */
export default {
  title: 'Basics/Select',
  component: 'pastis-select',
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'select', options: lists.map(l => l.value) },
    helper: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'List', value: 'groceries', helper: '', error: '', required: false, disabled: false },
  render: select,
};

export const Default = {
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('pastis-select');
    await expect(el.shadowRoot.querySelector('select').value).toBe('groceries');
  },
};
export const WithHelper = { args: { helper: 'Where the item lives' } };
export const WithError = { args: { value: '', error: 'Choose a list' } };
export const Disabled = { args: { disabled: true } };

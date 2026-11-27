import { expect } from 'storybook/test';
import './pastis-segmented-control.js';

const priorities = [
  { value: '0', label: 'None' },
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'High' },
];

function control({ label, labelHidden, value, disabled }) {
  const el = document.createElement('pastis-segmented-control');
  Object.assign(el, { label, labelHidden, value, disabled, options: priorities });
  return el;
}

/** Segmented control: one choice among a few, all in view. */
export default {
  title: 'Basics/SegmentedControl',
  component: 'pastis-segmented-control',
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    label: { control: 'text' },
    labelHidden: { control: 'boolean' },
    value: { control: 'select', options: priorities.map(p => p.value) },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Priority', labelHidden: false, value: '0', disabled: false },
  render: control,
};

export const Default = {
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('pastis-segmented-control');
    el.shadowRoot.querySelectorAll('button')[3].click();
    await expect(el.value).toBe('3');
  },
};
export const LabelHidden = { args: { labelHidden: true } };
export const Disabled = { args: { disabled: true } };

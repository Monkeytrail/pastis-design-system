import './pastis-progress.js';

export default {
  title: 'Feedback/Progress',
  component: 'pastis-progress',
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['bar', 'ring'] },
    animated: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    showValue: { control: 'boolean' },
    label: { control: 'text' },
  },
  render: (args) => {
    const el = document.createElement('pastis-progress');
    el.value = args.value !== undefined ? args.value : 65;
    el.size = args.size || 'md';
    el.variant = args.variant || 'bar';
    el.animated = args.animated || false;
    el.indeterminate = args.indeterminate || false;
    el.showValue = args.showValue || false;
    if (args.label) el.label = args.label;
    el.style.maxWidth = '400px';
    return el;
  },
};

export const Default = { args: { value: 65, size: 'md' } };
export const WithLabel = { args: { value: 45, label: 'UPLOAD SEQUENCE', showValue: true } };
export const Ring = { args: { value: 72, variant: 'ring', showValue: true } };
export const Indeterminate = { args: { indeterminate: true, label: 'LOADING...' } };
export const Animated = { args: { value: 60, animated: true, label: 'SYNCING DATA' } };

export const Sizes = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;max-width:400px;padding:24px;background:#000000;">
      <pastis-progress value="60" size="xs" label="XS"></pastis-progress>
      <pastis-progress value="60" size="sm" label="SM"></pastis-progress>
      <pastis-progress value="60" size="md" label="MD"></pastis-progress>
      <pastis-progress value="60" size="lg" label="LG"></pastis-progress>
      <pastis-progress value="60" size="xl" label="XL" show-value></pastis-progress>
    </div>
  `,
};

export const Rings = {
  render: () => `
    <div style="display:flex;gap:24px;flex-wrap:wrap;padding:24px;background:#000000;align-items:flex-end">
      <pastis-progress variant="ring" value="25" show-value size="sm" radius="28" stroke-width="5"></pastis-progress>
      <pastis-progress variant="ring" value="50" show-value></pastis-progress>
      <pastis-progress variant="ring" value="75" show-value size="lg" radius="48" stroke-width="7"></pastis-progress>
      <pastis-progress variant="ring" indeterminate label="LOADING..."></pastis-progress>
    </div>
  `,
};

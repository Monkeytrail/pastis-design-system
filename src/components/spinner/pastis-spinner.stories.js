import './pastis-spinner.js';

export default {
  title: 'Feedback/Spinner',
  component: 'pastis-spinner',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['ring', 'dots'] },
    label: { control: 'text' },
    color: { control: 'color' },
  },
  render: (args) => `
    <pastis-spinner
      size="${args.size || 'md'}"
      variant="${args.variant || 'ring'}"
      ${args.label ? `label="${args.label}"` : ''}
      ${args.color ? `color="${args.color}"` : ''}
    ></pastis-spinner>
  `,
};

export const Default = { args: { size: 'md', variant: 'ring' } };
export const Dots = { args: { variant: 'dots', size: 'md' } };
export const WithLabel = { args: { size: 'md', label: 'LOADING...' } };
export const Large = { args: { size: 'xl', variant: 'ring' } };

export const AllSizes = {
  render: () => `
    <div style="display:flex;align-items:center;gap:24px;padding:24px;background:#000000;">
      <pastis-spinner size="xs"></pastis-spinner>
      <pastis-spinner size="sm"></pastis-spinner>
      <pastis-spinner size="md"></pastis-spinner>
      <pastis-spinner size="lg"></pastis-spinner>
      <pastis-spinner size="xl"></pastis-spinner>
    </div>
  `,
};

export const BothVariants = {
  render: () => `
    <div style="display:flex;align-items:center;gap:40px;padding:24px;background:#000000;">
      <pastis-spinner size="lg" variant="ring" label="RING"></pastis-spinner>
      <pastis-spinner size="lg" variant="dots" label="DOTS"></pastis-spinner>
    </div>
  `,
};

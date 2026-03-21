import './pastis-tag.js';

export default {
  title: 'Basics/Tag',
  component: 'pastis-tag',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'success', 'warning', 'error', 'info', 'solid', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    removable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    icon: { control: 'text' },
    label: { control: 'text' },
  },
  render: (args) => `
    <pastis-tag
      variant="${args.variant || 'default'}"
      size="${args.size || 'md'}"
      ${args.removable ? 'removable' : ''}
      ${args.disabled ? 'disabled' : ''}
      ${args.icon ? `icon="${args.icon}"` : ''}
    >${args.label || 'TAG'}</pastis-tag>
  `,
};

export const Default = { args: { label: 'SYSTEM', variant: 'default' } };
export const Primary = { args: { label: 'NEW BUILD', variant: 'primary', icon: '✨' } };
export const Removable = { args: { label: 'JAVASCRIPT', variant: 'primary', removable: true } };
export const Success = { args: { label: 'ONLINE', variant: 'success' } };
export const Error = { args: { label: 'DEPRECATED', variant: 'error' } };

export const AllVariants = {
  render: () => `
    <div style="display:flex;gap:16px;flex-wrap:wrap;padding:24px;background:#000000;align-items:center">
      <pastis-tag variant="default">DEFAULT</pastis-tag>
      <pastis-tag variant="primary">PRIMARY</pastis-tag>
      <pastis-tag variant="success">ACTIVE</pastis-tag>
      <pastis-tag variant="warning">WARNING</pastis-tag>
      <pastis-tag variant="error">SYSTEM ERROR</pastis-tag>
      <pastis-tag variant="info">INFO</pastis-tag>
      <pastis-tag variant="solid">SOLID</pastis-tag>
      <pastis-tag variant="outline">OUTLINE</pastis-tag>
    </div>
  `,
};

export const TagCloud = {
  render: () => `
    <div style="display:flex;gap:8px;flex-wrap:wrap;padding:24px;max-width:400px;background:#000000;">
      <pastis-tag variant="primary" removable>JAVASCRIPT</pastis-tag>
      <pastis-tag variant="success" removable>TYPESCRIPT</pastis-tag>
      <pastis-tag variant="warning" removable>CSS</pastis-tag>
      <pastis-tag variant="info" removable>REACT</pastis-tag>
      <pastis-tag variant="default" removable>VUE</pastis-tag>
      <pastis-tag variant="error" removable>ANGULAR</pastis-tag>
    </div>
  `,
};

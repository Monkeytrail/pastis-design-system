import './pastis-badge.js';

export default {
  title: 'Basics/Badge',
  component: 'pastis-badge',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'info', 'solid-primary', 'solid-success', 'solid-error', 'solid-warning'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    dot: { control: 'boolean' },
    label: { control: 'text' },
  },
  render: (args) => `
    <pastis-badge
      variant="${args.variant || 'default'}"
      size="${args.size || 'md'}"
      ${args.dot ? 'dot' : ''}
    >${args.label || 'BADGE'}</pastis-badge>
  `,
};

export const Default = { args: { label: 'DEFAULT', variant: 'default' } };
export const Primary = { args: { label: 'NEW ITEM', variant: 'primary' } };
export const Success = { args: { label: 'ONLINE', variant: 'success' } };
export const Warning = { args: { label: 'STANDBY', variant: 'warning' } };
export const Error = { args: { label: 'TERMINATED', variant: 'error' } };
export const Info = { args: { label: 'BETA BUILD', variant: 'info' } };
export const Dot = { args: { dot: true, variant: 'success' } };

export const AllVariants = {
  render: () => `
    <div style="display:flex;gap:16px;flex-wrap:wrap;padding:24px;background:#000000;align-items:center">
      <pastis-badge variant="default">DEFAULT</pastis-badge>
      <pastis-badge variant="primary">PRIMARY</pastis-badge>
      <pastis-badge variant="success">ONLINE</pastis-badge>
      <pastis-badge variant="warning">STANDBY</pastis-badge>
      <pastis-badge variant="error">TERMINATED</pastis-badge>
      <pastis-badge variant="info">BETA BUILD</pastis-badge>
      <pastis-badge variant="solid-primary">SOLID BLUE</pastis-badge>
      <pastis-badge variant="solid-success">SOLID GREEN</pastis-badge>
      <pastis-badge variant="solid-error">SOLID RED</pastis-badge>
      <pastis-badge dot variant="success"></pastis-badge>
      <pastis-badge dot variant="error"></pastis-badge>
      <pastis-badge dot variant="warning"></pastis-badge>
    </div>
  `,
};

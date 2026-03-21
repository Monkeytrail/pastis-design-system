import './pastis-toggle.js';

export default {
  title: 'Basics/Toggle',
  component: 'pastis-toggle',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    labelPosition: { control: 'select', options: ['left', 'right'] },
  },
  render: (args) => `
    <pastis-toggle
      label="${args.label || ''}"
      size="${args.size || 'md'}"
      label-position="${args.labelPosition || 'right'}"
      ${args.checked ? 'checked' : ''}
      ${args.disabled ? 'disabled' : ''}
    ></pastis-toggle>
  `,
};

export const Default = { args: { label: 'ENABLE ALERTS' } };
export const Checked = { args: { label: 'DARK MODE ACTIVE', checked: true } };
export const Disabled = { args: { label: 'FEATURE LOCKED', disabled: true } };
export const LabelLeft = { args: { label: 'STEALTH MODE', labelPosition: 'left' } };
export const Small = { args: { label: 'SMALL TOGGLE', size: 'sm', checked: true } };
export const Large = { args: { label: 'LARGE TOGGLE', size: 'lg' } };

export const Group = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;padding:24px;background:#000000;">
      <pastis-toggle label="PUSH ALERTS" checked></pastis-toggle>
      <pastis-toggle label="EMAIL DIGEST"></pastis-toggle>
      <pastis-toggle label="SMS UPLINK" checked></pastis-toggle>
      <pastis-toggle label="PROPAGANDA FEED (LOCKED)" disabled></pastis-toggle>
    </div>
  `,
};

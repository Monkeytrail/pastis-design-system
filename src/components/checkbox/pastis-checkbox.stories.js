import './pastis-checkbox.js';

export default {
  title: 'Basics/Checkbox',
  component: 'pastis-checkbox',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    helper: { control: 'text' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: (args) => `
    <pastis-checkbox
      label="${args.label || ''}"
      helper="${args.helper || ''}"
      ${args.checked ? 'checked' : ''}
      ${args.indeterminate ? 'indeterminate' : ''}
      ${args.disabled ? 'disabled' : ''}
    ></pastis-checkbox>
  `,
};

export const Default = { args: { label: 'ACCEPT TERMS OF SERVICE' } };
export const Checked = { args: { label: 'ENABLE TRANSMISSIONS', checked: true } };
export const Indeterminate = { args: { label: 'SELECT ALL UNITS', indeterminate: true } };
export const WithHelper = { args: { label: 'RECEIVE INTEL UPDATES', helper: 'RECEIVE MISSION UPDATES AND ALERTS.', checked: false } };
export const Disabled = { args: { label: 'LOCKED OPTION', disabled: true } };
export const DisabledChecked = { args: { label: 'LOCKED ACTIVE', checked: true, disabled: true } };

export const Group = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;padding:24px;background:#000000;">
      <pastis-checkbox label="UNIT ALPHA" checked></pastis-checkbox>
      <pastis-checkbox label="UNIT BRAVO"></pastis-checkbox>
      <pastis-checkbox label="UNIT CHARLIE" indeterminate></pastis-checkbox>
      <pastis-checkbox label="UNIT DELTA (LOCKED)" disabled></pastis-checkbox>
    </div>
  `,
};

import './pastis-checkbox.js';

export default {
  title: 'Basics/Checkbox',
  component: 'pastis-checkbox',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    label: { control: 'text' },
    helper: { control: 'text' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    labelCase: { control: 'select', options: ['upper', 'none'] },
  },
  render: (args) => `
    <pastis-checkbox
      label="${args.label || ''}"
      helper="${args.helper || ''}"
      label-case="${args.labelCase || 'upper'}"
      ${args.required ? 'required' : ''}
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

/** `label-case="none"` keeps user content as written, e.g. task titles. */
export const LabelAsWritten = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;padding:24px;background:#000000;">
      <pastis-checkbox label-case="none" label="Buy oat milk at Albert Heijn"></pastis-checkbox>
      <pastis-checkbox label-case="none" label="Call Dr. van Dijk about the iPhone repair" checked></pastis-checkbox>
    </div>
  `,
};

/** No visible label: `aria-label` names the checkbox (e.g. in a task row with its own title). */
export const AriaLabelOnly = {
  render: () => `
    <div style="display:flex;gap:12px;align-items:center;padding:24px;background:#000000;font-family:var(--font-family-mono, monospace);color:var(--text-secondary, #fff)">
      <pastis-checkbox aria-label="Complete “Renew passport”"></pastis-checkbox>
      <span>Renew passport</span>
    </div>
  `,
};

export const Required = { args: { label: 'I ACCEPT THE TERMS OF SERVICE', required: true } };

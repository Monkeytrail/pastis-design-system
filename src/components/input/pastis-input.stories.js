import './pastis-input.js';

export default {
  title: 'Basics/Input',
  component: 'pastis-input',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helper: { control: 'text' },
    error: { control: 'text' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search', 'url'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  render: (args) => `
    <pastis-input
      label="${args.label || ''}"
      placeholder="${args.placeholder || ''}"
      helper="${args.helper || ''}"
      error="${args.error || ''}"
      type="${args.type || 'text'}"
      size="${args.size || 'md'}"
      ${args.disabled ? 'disabled' : ''}
      ${args.readonly ? 'readonly' : ''}
      ${args.required ? 'required' : ''}
      style="width:320px"
    ></pastis-input>
  `,
};

export const Default = {
  args: { label: 'EMAIL ADDRESS', placeholder: '> ENTER VALUE_', type: 'email' },
};

export const WithHelper = {
  args: { label: 'PLAYER NAME', placeholder: '> ENTER VALUE_', helper: 'LETTERS, NUMBERS, AND UNDERSCORES ONLY.' },
};

export const WithError = {
  args: { label: 'ACCESS CODE', type: 'password', placeholder: '> ENTER VALUE_', error: 'SYSTEM ERROR: CODE MUST BE AT LEAST 8 CHARACTERS.' },
};

export const Disabled = {
  args: { label: 'LOCKED FIELD', value: 'ACCESS DENIED', disabled: true },
};

export const Required = {
  args: { label: 'PLAYER NAME', placeholder: '> ENTER VALUE_', required: true },
};

export const Sizes = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;width:320px;padding:24px;background:#000000;">
      <pastis-input label="SMALL" size="sm" placeholder="> ENTER VALUE_"></pastis-input>
      <pastis-input label="MEDIUM" size="md" placeholder="> ENTER VALUE_"></pastis-input>
      <pastis-input label="LARGE" size="lg" placeholder="> ENTER VALUE_"></pastis-input>
    </div>
  `,
};

export const WithIcons = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;width:320px;padding:24px;background:#000000;">
      <pastis-input label="▷ SEARCH_" leading-icon="🔍" placeholder="> ENTER VALUE_"></pastis-input>
      <pastis-input label="EMAIL ADDRESS" leading-icon="✉" trailing-icon="✓" placeholder="> ENTER VALUE_"></pastis-input>
    </div>
  `,
};

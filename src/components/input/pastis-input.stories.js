import { expect, waitFor } from 'storybook/test';
import './pastis-input.js';
import '../checkbox/pastis-checkbox.js';
import '../button/pastis-button.js';

export default {
  title: 'Basics/Input',
  component: 'pastis-input',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
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
    maxlength: { control: 'number' },
    autocomplete: { control: 'text' },
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
      ${args.maxlength ? `maxlength="${args.maxlength}"` : ''}
      ${args.autocomplete ? `autocomplete="${args.autocomplete}"` : ''}
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

export const WithMaxLength = {
  args: { label: 'LIST NAME', placeholder: 'Groceries', helper: 'UP TO 40 CHARACTERS.', maxlength: 40 },
};

/** No visible label: `aria-label` on the host names the input. */
export const AriaLabelOnly = {
  render: () => `
    <pastis-input aria-label="Rename list" value="Weekend groceries" style="width:320px"></pastis-input>
  `,
};

const formatFormData = (data) => [...data.entries()].map(([k, v]) => `${k} = ${v}`).join('\n') || '(empty)';

/**
 * A real `<form>`: the input and checkboxes are form-associated, the submit button submits,
 * Enter in the field submits, the reset button resets. The submitted `FormData` is shown below.
 */
export const InAForm = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:16px;width:360px;padding:24px;background:var(--bg-primary, #0d0d0d);';
    wrap.innerHTML = `
      <form style="display:flex;flex-direction:column;gap:16px">
        <pastis-input label="New list" name="title" value="Weekend groceries" maxlength="40" required
          helper="Shared with everyone in the space."></pastis-input>
        <pastis-checkbox label="Pin to the top" name="pinned" checked></pastis-checkbox>
        <pastis-checkbox label="Notify members" name="notify" value="members"></pastis-checkbox>
        <div style="display:flex;gap:8px">
          <pastis-button type="submit" name="intent" value="create">Create list</pastis-button>
          <pastis-button type="reset" variant="ghost">Reset</pastis-button>
        </div>
      </form>
      <pre data-testid="form-data" aria-live="polite" style="margin:0;font-family:var(--font-family-mono, monospace);font-size:12px;color:var(--text-secondary, #fff)">Submit to see the FormData.</pre>
    `;
    const form = wrap.querySelector('form');
    const output = wrap.querySelector('pre');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      output.textContent = formatFormData(new FormData(form, e.submitter));
    });
    form.addEventListener('reset', () => { output.textContent = 'Form reset.'; });
    return wrap;
  },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    await waitFor(() => expect(form.querySelector('pastis-button').shadowRoot.querySelector('button')).toBeTruthy());
    form.querySelector('pastis-button[type="submit"]').click();
    const output = canvasElement.querySelector('[data-testid="form-data"]');
    await expect(output.textContent).toBe('title = Weekend groceries\npinned = on\nintent = create');
  },
};

/**
 * Slotted mode for credentials: native inputs in the light DOM, so password managers and passkey
 * autofill (`autocomplete="username webauthn"`) find them. The field labels, describes and styles them.
 */
export const SlottedCredentials = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:360px;padding:24px;background:var(--bg-primary, #0d0d0d);';
    wrap.innerHTML = `
      <form style="display:flex;flex-direction:column;gap:16px">
        <pastis-input label="Email" helper="The address you signed up with.">
          <input slot="input" type="email" name="email" autocomplete="username webauthn" required>
        </pastis-input>
        <pastis-input label="Password">
          <input slot="input" type="password" name="password" autocomplete="current-password" required>
        </pastis-input>
        <pastis-button type="submit">Sign in</pastis-button>
        <p data-testid="result" aria-live="polite" style="margin:0;font-family:var(--font-family-mono, monospace);font-size:12px;color:var(--text-secondary, #fff)"></p>
      </form>
    `;
    const form = wrap.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      wrap.querySelector('[data-testid="result"]').textContent = `Signing in as ${new FormData(form).get('email')}`;
    });
    return wrap;
  },
};

export const SlottedWithError = {
  render: () => `
    <div style="width:360px;padding:24px;background:var(--bg-primary, #0d0d0d);">
      <pastis-input label="Email" error="NO ACCOUNT WITH THIS EMAIL.">
        <input slot="input" type="email" name="email" autocomplete="username" value="ada@example.com">
      </pastis-input>
    </div>
  `,
};

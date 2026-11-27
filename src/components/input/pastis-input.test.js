import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import './pastis-input.js';
import '../button/pastis-button.js';

describe('pastis-input', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('pastis-input');
    el.label = 'Email';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  // ─── Default render ───────────────────────────────────────────────────────

  it('names the built-in input by its label as written, not its uppercase styling', async () => {
    const field = document.createElement('pastis-input');
    field.label = 'New item';
    document.body.appendChild(field);
    await field.updateComplete;
    try {
      await expect
        .element(page.getByRole('textbox', { name: 'New item', exact: true }))
        .toBeInTheDocument();
    } finally {
      field.remove();
    }
  });

  it('renders a native <input> element', () => {
    expect(el.shadowRoot.querySelector('input')).toBeTruthy();
  });

  it('has correct default property values', () => {
    expect(el.type).toBe('text');
    expect(el.value).toBe('');
    expect(el.disabled).toBe(false);
    expect(el.readonly).toBe(false);
    expect(el.required).toBe(false);
    expect(el.size).toBe('md');
  });

  it('renders label when provided', () => {
    const label = el.shadowRoot.querySelector('label');
    expect(label).toBeTruthy();
    expect(label.textContent).toContain('Email');
  });

  it('label is associated with input via for/id', () => {
    const label = el.shadowRoot.querySelector('label');
    const input = el.shadowRoot.querySelector('input');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  // ─── Boolean props ────────────────────────────────────────────────────────

  it('disabled — native input is disabled', async () => {
    el.disabled = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').disabled).toBe(true);
  });

  it('readonly — native input has readonly attribute', async () => {
    el.readonly = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').readOnly).toBe(true);
  });

  it('required — native input is required', async () => {
    el.required = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').required).toBe(true);
  });

  it('required — renders the required indicator and no "required" text in the label', async () => {
    el.label = 'New item';
    el.required = true;
    await el.updateComplete;
    const dot = el.shadowRoot.querySelector('.required-dot');
    expect(dot).toBeTruthy();
    // The input's own required state is announced; text would add "required" to its name
    expect(el.shadowRoot.querySelector('label').textContent.replace('*', '').trim()).toBe('New item');
  });

  it('required dot is aria-hidden', async () => {
    el.required = true;
    await el.updateComplete;
    const dot = el.shadowRoot.querySelector('.required-dot');
    expect(dot.getAttribute('aria-hidden')).toBe('true');
  });

  // ─── Error state ──────────────────────────────────────────────────────────

  it('error — sets aria-invalid on input', async () => {
    el.error = 'This field is required';
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('error — renders error message with role="alert"', async () => {
    el.error = 'Invalid email';
    await el.updateComplete;
    const msg = el.shadowRoot.querySelector('.error-text');
    expect(msg).toBeTruthy();
    expect(msg.textContent).toContain('Invalid email');
    expect(msg.getAttribute('role')).toBe('alert');
  });

  it('error — input aria-describedby points to error element', async () => {
    el.error = 'Bad value';
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-describedby')).toBe(el.shadowRoot.querySelector('.error-text').id);
  });

  it('no error — aria-invalid is false', async () => {
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  // ─── Helper text ──────────────────────────────────────────────────────────

  it('helper — renders helper text', async () => {
    el.helper = 'We will never share your email';
    await el.updateComplete;
    const helper = el.shadowRoot.querySelector('.helper-text');
    expect(helper).toBeTruthy();
    expect(helper.textContent).toContain('We will never share your email');
  });

  it('helper — input aria-describedby points to helper element', async () => {
    el.helper = 'Hint text';
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-describedby')).toBe(el.shadowRoot.querySelector('.helper-text').id);
  });

  // ─── Icons ────────────────────────────────────────────────────────────────

  it('leadingIcon — renders leading icon and adds has-leading class', async () => {
    el.leadingIcon = '✉';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.leading-icon')).toBeTruthy();
    expect(el.shadowRoot.querySelector('.has-leading')).toBeTruthy();
  });

  it('trailingIcon — renders trailing icon and adds has-trailing class', async () => {
    el.trailingIcon = '✓';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trailing-icon')).toBeTruthy();
    expect(el.shadowRoot.querySelector('.has-trailing')).toBeTruthy();
  });

  it('icons are aria-hidden', async () => {
    el.leadingIcon = '✉';
    el.trailingIcon = '✓';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.leading-icon').getAttribute('aria-hidden')).toBe('true');
    expect(el.shadowRoot.querySelector('.trailing-icon').getAttribute('aria-hidden')).toBe('true');
  });

  // ─── Custom events ────────────────────────────────────────────────────────

  it('emits pastis-input with value on input', async () => {
    const handler = vi.fn();
    el.addEventListener('pastis-input', handler);
    const input = el.shadowRoot.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('hello');
  });

  it('emits pastis-change with value on change', async () => {
    const handler = vi.fn();
    el.addEventListener('pastis-change', handler);
    const input = el.shadowRoot.querySelector('input');
    input.value = 'world';
    input.dispatchEvent(new Event('change'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('world');
  });

  it('pastis-input bubbles and is composed', () => {
    let event;
    document.body.addEventListener('pastis-input', (e) => { event = e; }, { once: true });
    const input = el.shadowRoot.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  // ─── Sizes ────────────────────────────────────────────────────────────────

  it.each(['sm', 'md', 'lg'])('accepts size="%s"', async (size) => {
    el.size = size;
    await el.updateComplete;
    expect(el.getAttribute('size')).toBe(size);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it('passes axe-core in default state', async () => {
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('passes axe-core in error state', async () => {
    el.error = 'Required field';
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('passes axe-core when required', async () => {
    el.required = true;
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

// ─── Forms ──────────────────────────────────────────────────────────────────

/** Renders markup in a fresh container and waits for every Lit element in it to render. */
async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  return container;
}

/** Collects the FormData of every submit of `form`, preventing navigation. */
function captureSubmits(form) {
  const submits = [];
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submits.push({ data: new FormData(form, e.submitter), submitter: e.submitter });
  });
  return submits;
}

const tick = () => new Promise(r => setTimeout(r));

describe('pastis-input in a form', () => {
  let container;
  afterEach(() => container?.remove());

  it('is form-associated and submits its value under its name', async () => {
    container = await mount(`
      <form>
        <pastis-input label="List name" name="title"></pastis-input>
        <pastis-button type="submit">Create list</pastis-button>
      </form>`);
    const form = container.querySelector('form');
    const field = container.querySelector('pastis-input');
    const submits = captureSubmits(form);
    expect(PastisInputCtor().formAssociated).toBe(true);
    expect(field.form).toBe(form);
    field.shadowRoot.querySelector('input').focus();
    await userEvent.keyboard('Groceries');
    container.querySelector('pastis-button').click();
    expect(submits).toHaveLength(1);
    expect(submits[0].data.get('title')).toBe('Groceries');
  });

  it('form.reset() restores the initial value', async () => {
    container = await mount(`<form><pastis-input label="City" name="city" value="Utrecht"></pastis-input></form>`);
    const field = container.querySelector('pastis-input');
    field.shadowRoot.querySelector('input').focus();
    await userEvent.keyboard('{End} Centraal');
    expect(field.value).toBe('Utrecht Centraal');
    container.querySelector('form').reset();
    await field.updateComplete;
    expect(field.value).toBe('Utrecht');
    expect(field.shadowRoot.querySelector('input').value).toBe('Utrecht');
    expect(new FormData(container.querySelector('form')).get('city')).toBe('Utrecht');
  });

  it('required — invalid while empty, blocks submission, valid once filled', async () => {
    container = await mount(`
      <form>
        <pastis-input label="Email" name="email" type="email" required></pastis-input>
        <pastis-button type="submit">Sign in</pastis-button>
      </form>`);
    const form = container.querySelector('form');
    const field = container.querySelector('pastis-input');
    const submits = captureSubmits(form);
    const invalid = vi.fn();
    field.addEventListener('invalid', invalid);
    expect(field.validity.valueMissing).toBe(true);
    expect(field.checkValidity()).toBe(false);
    expect(form.checkValidity()).toBe(false);
    expect(field.matches(':invalid')).toBe(true);
    container.querySelector('pastis-button').click();
    expect(submits).toHaveLength(0);
    expect(invalid).toHaveBeenCalled();
    field.value = 'ada@example.com';
    await field.updateComplete;
    expect(field.validity.valid).toBe(true);
    container.querySelector('pastis-button').click();
    expect(submits).toHaveLength(1);
  });

  it('type rules apply (email)', async () => {
    container = await mount(`<form><pastis-input label="Email" name="email" type="email" value="not an email"></pastis-input></form>`);
    const field = container.querySelector('pastis-input');
    expect(field.validity.typeMismatch).toBe(true);
    expect(field.validationMessage).not.toBe('');
  });

  it('maxlength stops typing past the limit', async () => {
    container = await mount(`<form><pastis-input label="Code" name="code" maxlength="4"></pastis-input></form>`);
    const field = container.querySelector('pastis-input');
    const input = field.shadowRoot.querySelector('input');
    expect(input.maxLength).toBe(4);
    input.focus();
    await userEvent.keyboard('123456');
    expect(field.value).toBe('1234');
    expect(new FormData(container.querySelector('form')).get('code')).toBe('1234');
  });

  it('minlength and pattern make the field invalid after editing', async () => {
    container = await mount(`<form><pastis-input label="Postcode" name="pc" minlength="6" pattern="[0-9]{4}[A-Z]{2}"></pastis-input></form>`);
    const field = container.querySelector('pastis-input');
    field.shadowRoot.querySelector('input').focus();
    await userEvent.keyboard('12a');
    await field.updateComplete;
    expect(field.validity.tooShort || field.validity.patternMismatch).toBe(true);
    expect(field.checkValidity()).toBe(false);
  });

  it('Enter submits a form with a Pastis submit button (submitter carries its name/value)', async () => {
    container = await mount(`
      <form>
        <pastis-input label="New item" name="title"></pastis-input>
        <pastis-input label="Notes" name="notes"></pastis-input>
        <pastis-button type="submit" name="intent" value="add">Add</pastis-button>
      </form>`);
    const form = container.querySelector('form');
    const submits = captureSubmits(form);
    container.querySelector('pastis-input').shadowRoot.querySelector('input').focus();
    await userEvent.keyboard('Buy bread{Enter}');
    await tick();
    expect(submits).toHaveLength(1);
    expect(submits[0].data.get('title')).toBe('Buy bread');
    expect(submits[0].data.get('intent')).toBe('add');
  });

  it('Enter submits a form without any submit button', async () => {
    container = await mount(`<form><pastis-input label="Search" name="q"></pastis-input></form>`);
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelector('pastis-input').shadowRoot.querySelector('input').focus();
    await userEvent.keyboard('milk{Enter}');
    await tick();
    expect(submits).toHaveLength(1);
    expect(submits[0].data.get('q')).toBe('milk');
  });

  it('Enter does not submit when a listener prevents its default', async () => {
    container = await mount(`<form><pastis-input label="Search" name="q"></pastis-input></form>`);
    const submits = captureSubmits(container.querySelector('form'));
    const field = container.querySelector('pastis-input');
    field.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    field.shadowRoot.querySelector('input').focus();
    await userEvent.keyboard('milk{Enter}');
    await tick();
    expect(submits).toHaveLength(0);
  });

  it('Enter does not submit through a disabled default button', async () => {
    container = await mount(`
      <form>
        <pastis-input label="Search" name="q"></pastis-input>
        <pastis-button type="submit" disabled>Search</pastis-button>
      </form>`);
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelector('pastis-input').shadowRoot.querySelector('input').focus();
    await userEvent.keyboard('milk{Enter}');
    await tick();
    expect(submits).toHaveLength(0);
  });

  it('a disabled fieldset disables it and leaves it out of the form data', async () => {
    container = await mount(`
      <form><fieldset disabled><pastis-input label="City" name="city" value="Delft"></pastis-input></fieldset></form>`);
    const field = container.querySelector('pastis-input');
    await field.updateComplete;
    expect(field.matches(':disabled')).toBe(true);
    expect(field.shadowRoot.querySelector('input').disabled).toBe(true);
    expect(new FormData(container.querySelector('form')).has('city')).toBe(false);
    container.querySelector('fieldset').disabled = false;
    await field.updateComplete;
    expect(field.shadowRoot.querySelector('input').disabled).toBe(false);
    expect(new FormData(container.querySelector('form')).get('city')).toBe('Delft');
  });

  it('formStateRestoreCallback restores the value', async () => {
    container = await mount(`<form><pastis-input label="City" name="city"></pastis-input></form>`);
    const field = container.querySelector('pastis-input');
    field.formStateRestoreCallback('Leiden', 'restore');
    await field.updateComplete;
    expect(field.value).toBe('Leiden');
  });
});

function PastisInputCtor() { return customElements.get('pastis-input'); }

describe('pastis-input attributes', () => {
  let container;
  afterEach(() => container?.remove());

  it('passes the input attributes through to the inner input', async () => {
    container = await mount(`
      <pastis-input label="Email" autocomplete="email" inputmode="email" enterkeyhint="send"
        spellcheck="false" autocapitalize="none" minlength="3" maxlength="80" pattern=".+@.+"></pastis-input>`);
    const input = container.querySelector('pastis-input').shadowRoot.querySelector('input');
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.getAttribute('inputmode')).toBe('email');
    expect(input.getAttribute('enterkeyhint')).toBe('send');
    expect(input.getAttribute('spellcheck')).toBe('false');
    expect(input.getAttribute('autocapitalize')).toBe('none');
    expect(input.minLength).toBe(3);
    expect(input.maxLength).toBe(80);
    expect(input.getAttribute('pattern')).toBe('.+@.+');
  });

  it('leaves unset pass-through attributes off the inner input', async () => {
    container = await mount(`<pastis-input label="Name"></pastis-input>`);
    const input = container.querySelector('pastis-input').shadowRoot.querySelector('input');
    for (const name of ['maxlength', 'minlength', 'pattern', 'autocomplete', 'inputmode', 'enterkeyhint', 'spellcheck', 'autocapitalize']) {
      expect(input.hasAttribute(name), name).toBe(false);
    }
  });

  it('autofocus focuses the inner input on first render', async () => {
    container = await mount(`<pastis-input label="New list" autofocus></pastis-input>`);
    const field = container.querySelector('pastis-input');
    expect(document.activeElement).toBe(field);
    expect(field.shadowRoot.activeElement).toBe(field.shadowRoot.querySelector('input'));
  });

  it('focus() on the host focuses the inner input', async () => {
    container = await mount(`<pastis-input label="Name"></pastis-input>`);
    const field = container.querySelector('pastis-input');
    field.focus();
    expect(field.shadowRoot.activeElement).toBe(field.shadowRoot.querySelector('input'));
  });

  it('aria-label on the host names the input when there is no visible label; a label wins', async () => {
    container = await mount(`<pastis-input aria-label="Rename list"></pastis-input>`);
    const field = container.querySelector('pastis-input');
    const input = field.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Rename list');
    field.label = 'List name';
    await field.updateComplete;
    // The visible label, as written (spec: its uppercase styling must not reach the name).
    expect(input.getAttribute('aria-label')).toBe('List name');
    const results = await axe.run(container, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('aria-label alone passes axe', async () => {
    container = await mount(`<pastis-input aria-label="Search lists"></pastis-input>`);
    const results = await axe.run(container, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('helper and error ids are unique per instance', async () => {
    container = await mount(`
      <pastis-input label="First" helper="Shown first"></pastis-input>
      <pastis-input label="Second" helper="Shown second"></pastis-input>
      <pastis-input label="Third" error="Wrong"></pastis-input>
      <pastis-input label="Fourth" error="Also wrong"></pastis-input>`);
    const ids = [...container.querySelectorAll('pastis-input')].map((f) => {
      const input = f.shadowRoot.querySelector('input');
      const describedBy = input.getAttribute('aria-describedby');
      expect(f.shadowRoot.getElementById(describedBy)).toBeTruthy();
      return describedBy;
    });
    expect(new Set(ids).size).toBe(4);
  });
});

describe('pastis-input slotted mode', () => {
  let container;
  afterEach(() => container?.remove());

  const signIn = `
    <form>
      <pastis-input label="Email" helper="The address you signed up with">
        <input slot="input" type="email" name="email" autocomplete="username webauthn" required>
      </pastis-input>
      <pastis-input label="Password">
        <input slot="input" type="password" name="password" autocomplete="current-password" required>
      </pastis-input>
      <pastis-button type="submit">Sign in</pastis-button>
    </form>`;

  it('renders the slotted input instead of its own', async () => {
    container = await mount(signIn);
    const field = container.querySelector('pastis-input');
    await field.updateComplete;
    expect(field.shadowRoot.querySelector('input')).toBeNull();
    const slot = field.shadowRoot.querySelector('slot[name="input"]');
    expect(slot.assignedElements()).toEqual([field.querySelector('input')]);
  });

  it('labels and describes the slotted input', async () => {
    container = await mount(signIn);
    const [email, password] = container.querySelectorAll('pastis-input');
    const input = email.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Email');
    expect(input.getAttribute('aria-description')).toBe('The address you signed up with');
    expect(password.querySelector('input').getAttribute('aria-label')).toBe('Password');
    email.error = 'No account with this email';
    await email.updateComplete;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-description')).toBe('No account with this email');
    const results = await axe.run(container, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('clicking the label focuses the slotted input', async () => {
    container = await mount(signIn);
    const email = container.querySelector('pastis-input');
    email.shadowRoot.querySelector('label').click();
    expect(document.activeElement).toBe(email.querySelector('input'));
  });

  it('focus() focuses the slotted input', async () => {
    container = await mount(signIn);
    const password = container.querySelectorAll('pastis-input')[1];
    password.focus();
    expect(document.activeElement).toBe(password.querySelector('input'));
  });

  it('shows the required marker when the slotted input is required', async () => {
    container = await mount(signIn);
    await container.querySelector('pastis-input').updateComplete;
    expect(container.querySelector('pastis-input').shadowRoot.querySelector('.required-dot')).toBeTruthy();
  });

  it('emits pastis-input / pastis-change and mirrors value', async () => {
    container = await mount(signIn);
    const email = container.querySelector('pastis-input');
    const onInput = vi.fn();
    const onChange = vi.fn();
    email.addEventListener('pastis-input', onInput);
    email.addEventListener('pastis-change', onChange);
    email.querySelector('input').focus();
    await userEvent.keyboard('ada@example.com');
    email.querySelectorAll('input')[0].blur();
    expect(onInput).toHaveBeenCalledTimes('ada@example.com'.length);
    expect(onInput.mock.calls.at(-1)[0].detail.value).toBe('ada@example.com');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(email.value).toBe('ada@example.com');
  });

  it('setting value on the host updates the slotted input', async () => {
    container = await mount(signIn);
    const email = container.querySelector('pastis-input');
    email.value = 'grace@example.com';
    await email.updateComplete;
    expect(email.querySelector('input').value).toBe('grace@example.com');
  });

  it('the native input is the form control: FormData has it once, the host adds nothing', async () => {
    container = await mount(signIn.replace('<pastis-input label="Email"', '<pastis-input label="Email" name="host-email"'));
    const form = container.querySelector('form');
    const submits = captureSubmits(form);
    const [email, password] = container.querySelectorAll('pastis-input');
    email.querySelector('input').focus();
    await userEvent.keyboard('ada@example.com');
    password.querySelector('input').focus();
    await userEvent.keyboard('correct horse{Enter}');
    await tick();
    expect(submits).toHaveLength(1);
    expect([...submits[0].data.keys()]).toEqual(['email', 'password']);
    expect(submits[0].data.get('email')).toBe('ada@example.com');
    expect(submits[0].data.get('password')).toBe('correct horse');
  });

  it('Enter does not submit while a required slotted input is empty', async () => {
    container = await mount(signIn);
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelector('pastis-input input').focus();
    await userEvent.keyboard('ada@example.com{Enter}');
    await tick();
    expect(submits).toHaveLength(0);
  });

  it('Enter with a native submit button submits exactly once', async () => {
    container = await mount(`
      <form>
        <pastis-input label="Email"><input slot="input" type="email" name="email"></pastis-input>
        <button type="submit">Go</button>
      </form>`);
    const submits = captureSubmits(container.querySelector('form'));
    container.querySelector('input').focus();
    await userEvent.keyboard('ada@example.com{Enter}');
    await tick();
    expect(submits).toHaveLength(1);
  });

  it('reset restores the native input and the host value follows', async () => {
    container = await mount(`<form><pastis-input label="Email"><input slot="input" name="email" value="ada@example.com"></pastis-input></form>`);
    const field = container.querySelector('pastis-input');
    expect(field.value).toBe('ada@example.com');
    field.querySelector('input').focus();
    await userEvent.keyboard('{End}.nl');
    expect(field.value).toBe('ada@example.com.nl');
    container.querySelector('form').reset();
    await Promise.resolve();
    expect(field.querySelector('input').value).toBe('ada@example.com');
    expect(field.value).toBe('ada@example.com');
  });

  it('switches to slotted mode when an input is added later', async () => {
    container = await mount(`<pastis-input label="Email"></pastis-input>`);
    const field = container.querySelector('pastis-input');
    expect(field.shadowRoot.querySelector('input')).toBeTruthy();
    const input = document.createElement('input');
    input.slot = 'input';
    field.append(input);
    await new Promise(r => requestAnimationFrame(r));
    await field.updateComplete;
    expect(field.shadowRoot.querySelector('input')).toBeNull();
    expect(input.getAttribute('aria-label')).toBe('Email');
  });
});

// ─── Review fixes ───────────────────────────────────────────────────────────

describe('pastis-input slotted mode: disabled, readonly and owned attributes', () => {
  let container;
  afterEach(() => container?.remove());

  const emailForm = (hostAttrs = '', inputAttrs = '') => `
    <form>
      <pastis-input label="Email" ${hostAttrs}>
        <input slot="input" type="email" name="email" value="ada@example.com" ${inputAttrs}>
      </pastis-input>
    </form>`;

  it('host disabled disables the slotted input and leaves it out of the form data', async () => {
    container = await mount(emailForm('disabled'));
    const field = container.querySelector('pastis-input');
    const input = field.querySelector('input');
    expect(input.disabled).toBe(true);
    expect(new FormData(container.querySelector('form')).has('email')).toBe(false);
    field.disabled = false;
    await field.updateComplete;
    expect(input.disabled).toBe(false);
    expect(new FormData(container.querySelector('form')).get('email')).toBe('ada@example.com');
  });

  it('host readonly makes the slotted input read-only', async () => {
    container = await mount(emailForm('readonly'));
    const field = container.querySelector('pastis-input');
    const input = field.querySelector('input');
    expect(input.readOnly).toBe(true);
    input.focus();
    await userEvent.keyboard('x');
    expect(input.value).toBe('ada@example.com');
    field.readonly = false;
    await field.updateComplete;
    expect(input.readOnly).toBe(false);
  });

  it('a disabled fieldset disables the slotted input', async () => {
    container = await mount(`<form><fieldset disabled>${emailForm().replace(/<\/?form>/g, '')}</fieldset></form>`);
    const input = container.querySelector('pastis-input input');
    expect(input.matches(':disabled')).toBe(true);
    expect(new FormData(container.querySelector('form')).has('email')).toBe(false);
  });

  it('never re-enables an input the author disabled', async () => {
    container = await mount(emailForm('', 'disabled'));
    const field = container.querySelector('pastis-input');
    field.disabled = true;
    await field.updateComplete;
    field.disabled = false;
    await field.updateComplete;
    expect(field.querySelector('input').disabled).toBe(true);
  });

  it('removes the aria-label it set when the label becomes empty', async () => {
    container = await mount(emailForm());
    const field = container.querySelector('pastis-input');
    const input = field.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Email');
    field.label = 'Work email';
    await field.updateComplete;
    expect(input.getAttribute('aria-label')).toBe('Work email');
    field.label = '';
    await field.updateComplete;
    expect(input.hasAttribute('aria-label')).toBe(false);
  });

  it("keeps the author's own aria-label, aria-description and aria-invalid", async () => {
    container = await mount(emailForm('helper="We never share it"', 'aria-label="Account email" aria-description="Author text" aria-invalid="false"'));
    const field = container.querySelector('pastis-input');
    const input = field.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Account email');
    expect(input.getAttribute('aria-description')).toBe('Author text');
    field.error = 'No account with this email';
    await field.updateComplete;
    expect(input.getAttribute('aria-invalid')).toBe('false');
    field.label = '';
    field.error = '';
    await field.updateComplete;
    expect(input.getAttribute('aria-label')).toBe('Account email');
    expect(input.getAttribute('aria-description')).toBe('Author text');
  });

  it('does not add aria-label when the input has its own <label> or aria-labelledby', async () => {
    container = await mount(`
      <label for="pw">Password</label>
      <pastis-input label="Password"><input slot="input" id="pw" type="password"></pastis-input>
      <span id="code-name">Code</span>
      <pastis-input label="Code"><input slot="input" aria-labelledby="code-name"></pastis-input>`);
    const [pw, code] = container.querySelectorAll('pastis-input input');
    expect(pw.hasAttribute('aria-label')).toBe(false);
    expect(code.hasAttribute('aria-label')).toBe(false);
  });
});

describe('pastis-input: aria-label stays on the host (React updates and removes it)', () => {
  let container;
  afterEach(() => container?.remove());

  it('axe (all rules) is clean with aria-label on the host', async () => {
    container = await mount('<main><pastis-input aria-label="Rename list" value="Weekend groceries"></pastis-input></main>');
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('a single textbox carries the name', async () => {
    container = await mount('<pastis-input aria-label="Rename list" value="Weekend groceries"></pastis-input>');
    expect(page.getByRole('textbox', { name: 'Rename list' }).elements()).toHaveLength(1);
  });

  it('updating and removing the host attribute updates the input', async () => {
    container = await mount('<pastis-input aria-label="Rename list"></pastis-input>');
    const field = container.querySelector('pastis-input');
    const input = field.shadowRoot.querySelector('input');
    field.setAttribute('aria-label', 'Rename Weekend groceries');
    await field.updateComplete;
    expect(input.getAttribute('aria-label')).toBe('Rename Weekend groceries');
    field.removeAttribute('aria-label');
    await field.updateComplete;
    expect(input.hasAttribute('aria-label')).toBe(false);
  });
});

describe('pastis-input re-enabled after being disabled', () => {
  let container;
  afterEach(() => container?.remove());

  const contexts = [
    ['on its own', '<pastis-input label="New item"></pastis-input>'],
    ['in a form', '<form><pastis-input label="New item" name="title"></pastis-input></form>'],
    ['in an enabled fieldset', '<form><fieldset><pastis-input label="New item" name="title"></pastis-input></fieldset></form>'],
  ];
  const toggles = [
    ['property', (f, on) => { f.disabled = on; }],
    ['attribute', (f, on) => f.toggleAttribute('disabled', on)],
  ];

  /** The inner input is enabled and takes typing. */
  async function expectUsable(field) {
    const input = field.shadowRoot.querySelector('input');
    expect(field.matches(':disabled')).toBe(false);
    expect(input.disabled).toBe(false);
    await userEvent.type(input, 'Oat milk');
    expect(field.value).toBe('Oat milk');
  }

  for (const [where, markup] of contexts) {
    for (const [how, setDisabled] of toggles) {
      it(`${where}, by ${how}: the inner input is enabled and typable again`, async () => {
        container = await mount(markup);
        const field = container.querySelector('pastis-input');
        setDisabled(field, true);
        await field.updateComplete;
        expect(field.shadowRoot.querySelector('input').disabled).toBe(true);
        setDisabled(field, false);
        await field.updateComplete;
        await expectUsable(field);
      });
    }
  }

  it('fieldset disabled, then enabled', async () => {
    container = await mount('<form><fieldset disabled><pastis-input label="New item"></pastis-input></fieldset></form>');
    const field = container.querySelector('pastis-input');
    expect(field.shadowRoot.querySelector('input').disabled).toBe(true);
    container.querySelector('fieldset').disabled = false;
    await field.updateComplete;
    await expectUsable(field);
  });

  it('stays disabled while either its own disabled or the fieldset still applies', async () => {
    container = await mount('<form><fieldset disabled><pastis-input label="New item" disabled></pastis-input></fieldset></form>');
    const field = container.querySelector('pastis-input');
    const input = () => field.shadowRoot.querySelector('input');
    field.disabled = false;
    await field.updateComplete;
    expect(input().disabled).toBe(true);
    field.disabled = true;
    await field.updateComplete;
    container.querySelector('fieldset').disabled = false;
    await field.updateComplete;
    expect(input().disabled).toBe(true);
    field.disabled = false;
    await field.updateComplete;
    await expectUsable(field);
  });

  it('slotted mode: the slotted input is enabled and typable again', async () => {
    container = await mount(`
      <form><pastis-input label="Email" disabled>
        <input slot="input" type="email" name="email">
      </pastis-input></form>`);
    const field = container.querySelector('pastis-input');
    field.disabled = false;
    await field.updateComplete;
    const input = field.querySelector('input');
    expect(input.disabled).toBe(false);
    await userEvent.type(input, 'ada@example.com');
    expect(field.value).toBe('ada@example.com');
  });
});

/** Chrome's own accessibility-tree nodes for text fields on the test page. */
async function axTextboxes() {
  const session = cdp();
  await session.send('Accessibility.enable');
  const { frameTree } = await session.send('Page.getFrameTree');
  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
  return nodes.filter(n => !n.ignored && n.role?.value === 'textbox');
}

const axRequired = node => node.properties?.find(p => p.name === 'required')?.value.value === true;

describe('pastis-input: a required field is named by its label only', () => {
  let container;
  afterEach(() => container?.remove());

  it('built-in input: the name is the label, and required is exposed as a state', async () => {
    container = await mount('<pastis-input label="New item" required></pastis-input>');
    const field = container.querySelector('pastis-input');
    expect(field.shadowRoot.querySelector('.required-dot').getAttribute('aria-hidden')).toBe('true');
    expect(page.getByRole('textbox', { name: 'New item', exact: true }).elements()).toHaveLength(1);
    const [textbox] = await axTextboxes();
    // Chrome applies the label's text-transform (uppercase) to the name
    expect(textbox.name.value.toLowerCase()).toBe('new item');
    expect(axRequired(textbox)).toBe(true);
  });

  it('slotted mode, required slotted input: the name is the label', async () => {
    container = await mount(`
      <pastis-input label="Email">
        <input slot="input" type="email" name="email" required>
      </pastis-input>`);
    expect(container.querySelector('pastis-input').shadowRoot.querySelector('.required-dot')).toBeTruthy();
    const [textbox] = await axTextboxes();
    expect(textbox.name.value).toBe('Email');
    expect(axRequired(textbox)).toBe(true);
  });

  it('slotted mode, required host: the slotted input is required, announced and enforced', async () => {
    container = await mount(`
      <form>
        <pastis-input label="Email" required>
          <input slot="input" type="email" name="email">
        </pastis-input>
        <pastis-button type="submit">Sign in</pastis-button>
      </form>`);
    const form = container.querySelector('form');
    const field = container.querySelector('pastis-input');
    const input = field.querySelector('input');
    expect(input.required).toBe(true);
    expect(input.hasAttribute('aria-required')).toBe(false);
    const [textbox] = await axTextboxes();
    expect(textbox.name.value).toBe('Email');
    expect(axRequired(textbox)).toBe(true);
    // Empty: submission is blocked and the browser reports it on the slotted input
    const submits = captureSubmits(form);
    container.querySelector('pastis-button').click();
    await tick();
    expect(submits).toHaveLength(0);
    expect(input.validity.valueMissing).toBe(true);
    expect(field.reportValidity()).toBe(false);
    expect(document.activeElement).toBe(input);
    field.required = false;
    await field.updateComplete;
    expect(input.required).toBe(false);
    container.querySelector('pastis-button').click();
    await tick();
    expect(submits).toHaveLength(1);
  });

  it("slotted mode: the host never removes the author's own required", async () => {
    container = await mount(`
      <pastis-input label="Email" required>
        <input slot="input" type="email" name="email" required>
      </pastis-input>`);
    const field = container.querySelector('pastis-input');
    field.required = false;
    await field.updateComplete;
    expect(field.querySelector('input').required).toBe(true);
  });

  it("slotted mode: the marker follows the slotted input's own required", async () => {
    container = await mount(`
      <pastis-input label="Email">
        <input slot="input" type="email" name="email">
      </pastis-input>`);
    const field = container.querySelector('pastis-input');
    const input = field.querySelector('input');
    const marker = () => field.shadowRoot.querySelector('.required-dot');
    expect(marker()).toBeNull();
    input.required = true;
    await tick();
    await field.updateComplete;
    expect(marker()).toBeTruthy();
    input.required = false;
    await tick();
    await field.updateComplete;
    expect(marker()).toBeNull();
  });

  it("slotted mode: the label follows the slotted input's own aria-labelledby", async () => {
    container = await mount(`
      <p id="work-email">Work email</p>
      <pastis-input label="Email">
        <input slot="input" type="email" name="email">
      </pastis-input>`);
    const field = container.querySelector('pastis-input');
    const input = field.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Email');
    input.setAttribute('aria-labelledby', 'work-email');
    await tick();
    await field.updateComplete;
    expect(input.hasAttribute('aria-label')).toBe(false);
  });

  it('passes axe-core when required', async () => {
    container = await mount('<div style="background:#0d0d0d;padding:8px"><pastis-input label="New item" required></pastis-input></div>');
    const results = await axe.run(container, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

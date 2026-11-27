import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import './pastis-checkbox.js';
import '../button/pastis-button.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  return container;
}

describe('pastis-checkbox', () => {
  let el;
  const input = () => el.shadowRoot.querySelector('input');

  beforeEach(async () => {
    // Pastis's dark surface (the tokens' default), as in the stories
    document.body.style.background = '#0d0d0d';
    el = document.createElement('pastis-checkbox');
    el.label = 'Buy oat milk';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
    document.body.style.background = '';
  });

  // ─── Default render ───────────────────────────────────────────────────────

  it('renders a native checkbox inside a label with the label text', () => {
    expect(input().type).toBe('checkbox');
    expect(input().closest('label').textContent).toContain('Buy oat milk');
  });

  it('has correct default property values', () => {
    expect(el.checked).toBe(false);
    expect(el.indeterminate).toBe(false);
    expect(el.disabled).toBe(false);
    expect(el.required).toBe(false);
    expect(el.value).toBe('');
    expect(el.labelCase).toBe('upper');
  });

  it('is exposed as a checkbox named by its label', async () => {
    await expect.element(page.getByRole('checkbox', { name: 'Buy oat milk' })).toBeInTheDocument();
  });

  it('renders helper text under the label, describing the checkbox rather than naming it', async () => {
    el.helper = 'Due tomorrow';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.helper').textContent).toBe('Due tomorrow');
    const box = page.getByRole('checkbox', { name: 'Buy oat milk', exact: true });
    await expect.element(box).toBeInTheDocument();
    await expect.element(box).toHaveAccessibleDescription('Due tomorrow');
  });

  // ─── Hidden input (1 px clip) and target size ─────────────────────────────

  it('hides the native input with the 1 px clip pattern, not 0 × 0', () => {
    const rect = input().getBoundingClientRect();
    const style = getComputedStyle(input());
    expect(rect.width).toBe(1);
    expect(rect.height).toBe(1);
    expect(style.opacity).toBe('1');
    expect(input().checkVisibility()).toBe(true);
  });

  it('the visible box is a target of at least 24 × 24 px', () => {
    const box = el.shadowRoot.querySelector('.box');
    const style = getComputedStyle(box);
    const width = box.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    const height = box.getBoundingClientRect().height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    expect(width).toBeGreaterThanOrEqual(24);
    expect(height).toBeGreaterThanOrEqual(24);
    expect(el.shadowRoot.querySelector('label').getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  });

  // ─── Label case ───────────────────────────────────────────────────────────

  it('label is uppercase by default', () => {
    expect(getComputedStyle(el.shadowRoot.querySelector('label')).textTransform).toBe('uppercase');
  });

  it('label-case="none" keeps the text as written', async () => {
    el.setAttribute('label-case', 'none');
    await el.updateComplete;
    expect(el.labelCase).toBe('none');
    expect(getComputedStyle(el.shadowRoot.querySelector('label')).textTransform).toBe('none');
  });

  // ─── Toggling ─────────────────────────────────────────────────────────────

  it('toggles on click and emits pastis-change with checked and value', async () => {
    el.value = 'oat-milk';
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('pastis-change', handler);
    el.shadowRoot.querySelector('label').click();
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(el.hasAttribute('checked')).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ checked: true, value: 'oat-milk' });
    el.shadowRoot.querySelector('.box').click();
    await el.updateComplete;
    expect(el.checked).toBe(false);
    expect(handler.mock.calls[1][0].detail.checked).toBe(false);
  });

  it('toggles with Space when focused', async () => {
    el.focus();
    expect(el.shadowRoot.activeElement).toBe(input());
    await userEvent.keyboard(' ');
    await el.updateComplete;
    expect(el.checked).toBe(true);
    await userEvent.keyboard(' ');
    await el.updateComplete;
    expect(el.checked).toBe(false);
  });

  it('pastis-change bubbles and is composed', async () => {
    let event;
    document.body.addEventListener('pastis-change', (e) => { event = e; }, { once: true });
    input().click();
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it('setting checked does not emit pastis-change', async () => {
    const handler = vi.fn();
    el.addEventListener('pastis-change', handler);
    el.checked = true;
    await el.updateComplete;
    expect(input().checked).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });

  // ─── Indeterminate ────────────────────────────────────────────────────────

  it('indeterminate sets the native state and aria-checked="mixed"', async () => {
    el.indeterminate = true;
    await el.updateComplete;
    expect(input().indeterminate).toBe(true);
    expect(input().getAttribute('aria-checked')).toBe('mixed');
    expect(el.shadowRoot.querySelector('.indeterminate-mark')).toBeTruthy();
  });

  it('toggling clears indeterminate', async () => {
    el.indeterminate = true;
    await el.updateComplete;
    input().click();
    await el.updateComplete;
    expect(el.indeterminate).toBe(false);
    expect(el.checked).toBe(true);
  });

  // ─── Disabled ─────────────────────────────────────────────────────────────

  it('disabled — native input is disabled and clicks do nothing', async () => {
    el.disabled = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('pastis-change', handler);
    expect(input().disabled).toBe(true);
    el.shadowRoot.querySelector('label').click();
    await el.updateComplete;
    expect(el.checked).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  // ─── aria-label ───────────────────────────────────────────────────────────

  it('aria-label names the input when there is no visible label', async () => {
    el.label = '';
    el.setAttribute('aria-label', 'Complete “Buy oat milk”');
    await el.updateComplete;
    expect(input().getAttribute('aria-label')).toBe('Complete “Buy oat milk”');
    await expect.element(page.getByRole('checkbox', { name: 'Complete “Buy oat milk”' })).toBeInTheDocument();
    const results = await axe.run(el, AXE);
    expect(results.violations).toHaveLength(0);
  });

  it('the visible label wins over aria-label', async () => {
    el.setAttribute('aria-label', 'Something else');
    await el.updateComplete;
    expect(input().hasAttribute('aria-label')).toBe(false);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it.each([
    ['default', {}],
    ['checked', { checked: true }],
    ['indeterminate', { indeterminate: true }],
    ['disabled', { disabled: true }],
    ['with helper', { helper: 'Due tomorrow' }],
  ])('passes axe-core (%s)', async (_name, props) => {
    Object.assign(el, props);
    await el.updateComplete;
    const results = await axe.run(el, AXE);
    expect(results.violations).toHaveLength(0);
  });
});

describe('pastis-checkbox in a form', () => {
  let container;
  afterEach(() => container?.remove());

  it('is form-associated', async () => {
    container = await mount('<form><pastis-checkbox label="Remember me" name="remember"></pastis-checkbox></form>');
    expect(customElements.get('pastis-checkbox').formAssociated).toBe(true);
    expect(container.querySelector('pastis-checkbox').form).toBe(container.querySelector('form'));
  });

  it('FormData has "on" when checked without a value, nothing when unchecked', async () => {
    container = await mount('<form><pastis-checkbox label="Remember me" name="remember"></pastis-checkbox></form>');
    const form = container.querySelector('form');
    const box = container.querySelector('pastis-checkbox');
    expect(new FormData(form).has('remember')).toBe(false);
    box.shadowRoot.querySelector('input').click();
    await box.updateComplete;
    expect(new FormData(form).get('remember')).toBe('on');
  });

  it('submits its value when checked, through a real submission', async () => {
    container = await mount(`
      <form>
        <pastis-checkbox label="Groceries" name="lists" value="groceries" checked></pastis-checkbox>
        <pastis-checkbox label="Hardware" name="lists" value="hardware"></pastis-checkbox>
        <pastis-checkbox label="Pharmacy" name="lists" value="pharmacy" checked></pastis-checkbox>
        <pastis-button type="submit">Share lists</pastis-button>
      </form>`);
    const form = container.querySelector('form');
    let data;
    form.addEventListener('submit', (e) => { e.preventDefault(); data = new FormData(form); });
    container.querySelector('pastis-button').click();
    expect(data.getAll('lists')).toEqual(['groceries', 'pharmacy']);
  });

  it('required — invalid until checked, blocks submission', async () => {
    container = await mount(`
      <form>
        <pastis-checkbox label="I accept the terms" name="terms" required></pastis-checkbox>
        <pastis-button type="submit">Continue</pastis-button>
      </form>`);
    const form = container.querySelector('form');
    const box = container.querySelector('pastis-checkbox');
    const onSubmit = vi.fn(e => e.preventDefault());
    form.addEventListener('submit', onSubmit);
    expect(box.validity.valueMissing).toBe(true);
    expect(box.checkValidity()).toBe(false);
    expect(box.validationMessage).not.toBe('');
    container.querySelector('pastis-button').click();
    expect(onSubmit).not.toHaveBeenCalled();
    box.shadowRoot.querySelector('input').click();
    await box.updateComplete;
    expect(box.validity.valid).toBe(true);
    container.querySelector('pastis-button').click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('form.reset() restores the initial checked state', async () => {
    container = await mount(`
      <form>
        <pastis-checkbox label="Remember me" name="remember" checked></pastis-checkbox>
        <pastis-checkbox label="Newsletter" name="news"></pastis-checkbox>
      </form>`);
    const [remember, news] = container.querySelectorAll('pastis-checkbox');
    remember.shadowRoot.querySelector('input').click();
    news.shadowRoot.querySelector('input').click();
    news.indeterminate = true;
    await remember.updateComplete;
    await news.updateComplete;
    container.querySelector('form').reset();
    await remember.updateComplete;
    await news.updateComplete;
    expect(remember.checked).toBe(true);
    expect(news.checked).toBe(false);
    expect(news.indeterminate).toBe(false);
    expect(remember.shadowRoot.querySelector('input').checked).toBe(true);
  });

  it('a disabled fieldset disables it and leaves it out of the form data', async () => {
    container = await mount(`
      <form><fieldset disabled><pastis-checkbox label="Remember me" name="remember" checked></pastis-checkbox></fieldset></form>`);
    const box = container.querySelector('pastis-checkbox');
    await box.updateComplete;
    expect(box.matches(':disabled')).toBe(true);
    expect(box.shadowRoot.querySelector('input').disabled).toBe(true);
    expect(new FormData(container.querySelector('form')).has('remember')).toBe(false);
    container.querySelector('fieldset').disabled = false;
    await box.updateComplete;
    expect(box.shadowRoot.querySelector('input').disabled).toBe(false);
    expect(new FormData(container.querySelector('form')).get('remember')).toBe('on');
  });

  it('formStateRestoreCallback restores the checked state', async () => {
    container = await mount('<form><pastis-checkbox label="Remember me" name="remember"></pastis-checkbox></form>');
    const box = container.querySelector('pastis-checkbox');
    box.formStateRestoreCallback('true', 'restore');
    await box.updateComplete;
    expect(box.checked).toBe(true);
  });
});

describe('pastis-checkbox: aria-label stays on the host (React updates and removes it)', () => {
  let container;
  afterEach(() => container?.remove());

  it('axe (all rules) is clean with aria-label on the host', async () => {
    container = await mount('<main style="background:#0d0d0d"><pastis-checkbox aria-label="Complete “Renew passport”"></pastis-checkbox></main>');
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('a single checkbox carries the name', async () => {
    container = await mount('<pastis-checkbox aria-label="Complete “Renew passport”"></pastis-checkbox>');
    expect(page.getByRole('checkbox', { name: 'Complete “Renew passport”' }).elements()).toHaveLength(1);
  });

  it('updating and removing the host attribute updates the input', async () => {
    container = await mount('<pastis-checkbox aria-label="Complete"></pastis-checkbox>');
    const box = container.querySelector('pastis-checkbox');
    const input = box.shadowRoot.querySelector('input');
    box.setAttribute('aria-label', 'Complete “Renew passport”');
    await box.updateComplete;
    expect(input.getAttribute('aria-label')).toBe('Complete “Renew passport”');
    box.removeAttribute('aria-label');
    await box.updateComplete;
    expect(input.hasAttribute('aria-label')).toBe(false);
  });
});

describe('pastis-checkbox re-enabled after being disabled', () => {
  let container;
  afterEach(() => container?.remove());

  const contexts = [
    ['on its own', '<pastis-checkbox label="Buy oat milk" label-case="none"></pastis-checkbox>'],
    ['in a form', '<form><pastis-checkbox label="Buy oat milk" label-case="none" name="done"></pastis-checkbox></form>'],
    ['in an enabled fieldset', '<form><fieldset><pastis-checkbox label="Buy oat milk" label-case="none" name="done"></pastis-checkbox></fieldset></form>'],
  ];
  const toggles = [
    ['property', (b, on) => { b.disabled = on; }],
    ['attribute', (b, on) => b.toggleAttribute('disabled', on)],
  ];

  /** The inner input is enabled, and a real click toggles it. */
  async function expectUsable(box) {
    expect(box.matches(':disabled')).toBe(false);
    expect(box.shadowRoot.querySelector('input').disabled).toBe(false);
    await userEvent.click(box.shadowRoot.querySelector('label'));
    expect(box.checked).toBe(true);
  }

  for (const [where, markup] of contexts) {
    for (const [how, setDisabled] of toggles) {
      it(`${where}, by ${how}: the inner input is enabled and clickable again`, async () => {
        container = await mount(markup);
        const box = container.querySelector('pastis-checkbox');
        setDisabled(box, true);
        await box.updateComplete;
        expect(box.shadowRoot.querySelector('input').disabled).toBe(true);
        setDisabled(box, false);
        await box.updateComplete;
        await expectUsable(box);
      });
    }
  }

  it('fieldset disabled, then enabled', async () => {
    container = await mount('<form><fieldset disabled><pastis-checkbox label="Buy oat milk"></pastis-checkbox></fieldset></form>');
    const box = container.querySelector('pastis-checkbox');
    container.querySelector('fieldset').disabled = false;
    await box.updateComplete;
    await expectUsable(box);
  });

  it('stays disabled while either its own disabled or the fieldset still applies', async () => {
    container = await mount('<form><fieldset disabled><pastis-checkbox label="Buy oat milk" disabled></pastis-checkbox></fieldset></form>');
    const box = container.querySelector('pastis-checkbox');
    const input = () => box.shadowRoot.querySelector('input');
    box.disabled = false;
    await box.updateComplete;
    expect(input().disabled).toBe(true);
    box.disabled = true;
    await box.updateComplete;
    container.querySelector('fieldset').disabled = false;
    await box.updateComplete;
    expect(input().disabled).toBe(true);
    box.disabled = false;
    await box.updateComplete;
    await expectUsable(box);
  });
});

describe('pastis-checkbox: a required checkbox is named by its label only', () => {
  let container;
  afterEach(() => container?.remove());

  it('the name is the label, and the native input is required', async () => {
    container = await mount('<pastis-checkbox label="I accept the terms" label-case="none" required></pastis-checkbox>');
    expect(page.getByRole('checkbox', { name: 'I accept the terms', exact: true }).elements()).toHaveLength(1);
    const session = cdp();
    await session.send('Accessibility.enable');
    const { frameTree } = await session.send('Page.getFrameTree');
    const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
    const [checkbox] = nodes.filter(n => !n.ignored && n.role?.value === 'checkbox');
    expect(checkbox.name.value).toBe('I accept the terms');
    // ARIA 1.2 allows aria-required on checkboxes, but Chrome's accessibility tree has no
    // required property for any checkbox (native required, aria-required or role="checkbox"), so
    // the native input's required, and its invalid state until checked, are asserted instead
    expect(container.querySelector('pastis-checkbox').shadowRoot.querySelector('input').required).toBe(true);
    expect(checkbox.properties.find(p => p.name === 'invalid')?.value.value).toBe('true');
  });
});

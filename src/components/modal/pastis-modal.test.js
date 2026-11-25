import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import './pastis-modal.js';
import '../button/pastis-button.js';
import '../input/pastis-input.js';

describe('pastis-modal', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('pastis-modal');
    el.title = 'Confirm action';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(async () => {
    // Always close cleanly so body overflow is restored
    el.open = false;
    await el.updateComplete;
    el.remove();
    document.body.style.overflow = '';
  });

  // ─── Default render ───────────────────────────────────────────────────────

  it('renders nothing when closed', () => {
    expect(el.shadowRoot.querySelector('.backdrop')).toBeNull();
  });

  it('has correct default property values', () => {
    expect(el.open).toBe(false);
    expect(el.closable).toBe(true);
    expect(el.persistent).toBe(false);
    expect(el.size).toBe('md');
  });

  // ─── Open / close ─────────────────────────────────────────────────────────

  it('renders backdrop and dialog when open=true', async () => {
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.backdrop')).toBeTruthy();
    expect(el.shadowRoot.querySelector('.dialog')).toBeTruthy();
  });

  it('close() sets open to false and emits pastis-close', async () => {
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('pastis-close', handler);
    el.close();
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('pastis-close bubbles and is composed', async () => {
    el.open = true;
    await el.updateComplete;
    let event;
    document.body.addEventListener('pastis-close', (e) => { event = e; }, { once: true });
    el.close();
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  // ─── Close button ─────────────────────────────────────────────────────────

  it('renders close button when closable=true', async () => {
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.close-btn')).toBeTruthy();
  });

  it('close button has aria-label', async () => {
    el.open = true;
    await el.updateComplete;
    const btn = el.shadowRoot.querySelector('.close-btn');
    expect(btn.getAttribute('aria-label')).toBeTruthy();
  });

  it('does not render close button when closable=false', async () => {
    el.closable = false;
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.close-btn')).toBeNull();
  });

  it('clicking close button closes the modal', async () => {
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.close-btn').click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  // ─── Backdrop click ───────────────────────────────────────────────────────

  it('clicking backdrop closes modal when not persistent', async () => {
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.backdrop').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('clicking backdrop does NOT close modal when persistent=true', async () => {
    el.persistent = true;
    el.open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.backdrop').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  it('Escape closes modal when not persistent', async () => {
    el.open = true;
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('Escape does NOT close modal when persistent=true', async () => {
    el.persistent = true;
    el.open = true;
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  // ─── Body scroll lock ─────────────────────────────────────────────────────

  it('locks body overflow when opened', async () => {
    el.open = true;
    await el.updateComplete;
    // Wait for requestAnimationFrame
    await new Promise(r => requestAnimationFrame(r));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', async () => {
    el.open = true;
    await el.updateComplete;
    el.open = false;
    await el.updateComplete;
    expect(document.body.style.overflow).toBe('');
  });

  // ─── Slots ────────────────────────────────────────────────────────────────

  it('projects default slot content into modal body', async () => {
    el.open = true;
    const p = document.createElement('p');
    p.textContent = 'Modal body content';
    el.appendChild(p);
    await el.updateComplete;
    expect(el.querySelector('p').textContent).toBe('Modal body content');
  });

  it('projects footer slot content', async () => {
    el.open = true;
    const footer = document.createElement('div');
    footer.slot = 'footer';
    footer.textContent = 'Footer actions';
    el.appendChild(footer);
    await el.updateComplete;
    expect(el.querySelector('[slot="footer"]').textContent).toBe('Footer actions');
  });

  // ─── ARIA ─────────────────────────────────────────────────────────────────

  it('backdrop has role="dialog" and aria-modal="true"', async () => {
    el.open = true;
    await el.updateComplete;
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    expect(backdrop.getAttribute('role')).toBe('dialog');
    expect(backdrop.getAttribute('aria-modal')).toBe('true');
  });

  it('backdrop has aria-label from title', async () => {
    el.open = true;
    await el.updateComplete;
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    expect(backdrop.getAttribute('aria-label')).toBe('Confirm action');
  });

  // ─── Sizes ────────────────────────────────────────────────────────────────

  it.each(['sm', 'md', 'lg', 'xl', 'full'])('accepts size="%s"', async (size) => {
    el.size = size;
    el.open = true;
    await el.updateComplete;
    expect(el.getAttribute('size')).toBe(size);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it('passes axe-core when open', async () => {
    el.open = true;
    el.innerHTML = '<p>Modal content</p>';
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

// ─── Native <dialog>: focus, keyboard, roles ────────────────────────────────

const frame = () => new Promise(r => requestAnimationFrame(r));

/** The element that really has focus, through shadow roots. */
function deepActive() {
  let a = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
}

/** The focused element's label for assertions: its text or aria-label. */
function focusedName() {
  const a = deepActive();
  const host = a.getRootNode().host;
  const ownText = a.getAttribute('aria-label') || a.textContent.trim();
  if (ownText) return ownText;
  // The inner <button> of a pastis-button: its label is the host's slotted text
  if (host && host.localName !== 'pastis-modal') return host.textContent.trim();
  return a.className;
}

describe('pastis-modal on the native dialog', () => {
  let container;
  let opener;
  let modal;

  async function setup(attrs = '', content = '') {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="opener">Sign out</button>
      <pastis-modal title="Sign out?" ${attrs}>
        ${content || `
        <p>You have 3 changes that have not synced yet. Signing out discards them.</p>
        <pastis-button slot="footer" variant="ghost" id="cancel">Cancel</pastis-button>
        <pastis-button slot="footer" variant="destructive" id="confirm">Sign out anyway</pastis-button>`}
      </pastis-modal>`;
    document.body.appendChild(container);
    opener = container.querySelector('#opener');
    modal = container.querySelector('pastis-modal');
    await modal.updateComplete;
  }

  async function openFromOpener() {
    opener.focus();
    modal.open = true;
    await modal.updateComplete;
    await frame();
  }

  afterEach(async () => {
    if (modal) { modal.open = false; await modal.updateComplete; }
    container?.remove();
    document.body.style.overflow = '';
  });

  it('opens a native modal <dialog>', async () => {
    await setup();
    await openFromOpener();
    const dialog = modal.shadowRoot.querySelector('dialog');
    expect(dialog.open).toBe(true);
    expect(dialog.matches(':modal')).toBe(true);
  });

  it('makes the rest of the page inert', async () => {
    await setup();
    await openFromOpener();
    opener.focus();
    expect(document.activeElement).not.toBe(opener);
  });

  it('focuses the first slotted focusable element first', async () => {
    await setup();
    await openFromOpener();
    expect(deepActive()).toBe(container.querySelector('#cancel').shadowRoot.querySelector('button'));
  });

  it('focuses a slotted [autofocus] element first', async () => {
    await setup('', `
      <pastis-input label="New list name" autofocus></pastis-input>
      <pastis-button slot="footer" id="create">Create</pastis-button>`);
    await openFromOpener();
    const field = container.querySelector('pastis-input');
    expect(document.activeElement).toBe(field);
    expect(deepActive()).toBe(field.shadowRoot.querySelector('input'));
  });

  it('focuses a plain slotted [autofocus] element', async () => {
    await setup('', `
      <p>Rename this list.</p>
      <button slot="footer">Cancel</button>
      <button slot="footer" autofocus>Rename</button>`);
    await openFromOpener();
    expect(deepActive().textContent).toBe('Rename');
  });

  it('falls back to the close button when nothing slotted is focusable', async () => {
    await setup('', '<p>Your session has ended.</p>');
    await openFromOpener();
    expect(deepActive()).toBe(modal.shadowRoot.querySelector('.close-btn'));
  });

  it('Tab cycles through the close button, body and slotted buttons, and wraps', async () => {
    await setup();
    await openFromOpener();
    const seen = [focusedName()];
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      seen.push(focusedName());
    }
    expect(seen).toEqual(['Cancel', 'Sign out anyway', 'Close dialog', 'modal-body', 'Cancel']);
  });

  it('Shift+Tab cycles backwards and wraps', async () => {
    await setup();
    await openFromOpener();
    const seen = [focusedName()];
    for (let i = 0; i < 4; i++) {
      await userEvent.tab({ shift: true });
      seen.push(focusedName());
    }
    expect(seen).toEqual(['Cancel', 'modal-body', 'Close dialog', 'Sign out anyway', 'Cancel']);
  });

  it('focus never leaves the dialog while tabbing', async () => {
    await setup();
    await openFromOpener();
    for (let i = 0; i < 8; i++) {
      await userEvent.tab();
      expect(modal.contains(document.activeElement) || modal.shadowRoot.contains(deepActive())).toBe(true);
    }
  });

  it('Escape (a real key press) closes it and emits pastis-close', async () => {
    await setup();
    await openFromOpener();
    const onClose = vi.fn();
    modal.addEventListener('pastis-close', onClose);
    await userEvent.keyboard('{Escape}');
    await modal.updateComplete;
    expect(modal.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape does nothing when persistent, even pressed twice', async () => {
    await setup('persistent');
    await openFromOpener();
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Escape}');
    await modal.updateComplete;
    expect(modal.open).toBe(true);
    expect(modal.shadowRoot.querySelector('dialog').open).toBe(true);
  });

  it('a cancel request is respected unless persistent', async () => {
    await setup('persistent');
    await openFromOpener();
    const dialog = modal.shadowRoot.querySelector('dialog');
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await modal.updateComplete;
    expect(modal.open).toBe(true);
    modal.persistent = false;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await modal.updateComplete;
    expect(modal.open).toBe(false);
  });

  it('restores focus to the opener when closed', async () => {
    await setup();
    await openFromOpener();
    container.querySelector('#cancel').click();
    modal.close();
    await modal.updateComplete;
    expect(document.activeElement).toBe(opener);
  });

  it('restores focus after Escape too', async () => {
    await setup();
    await openFromOpener();
    await userEvent.keyboard('{Escape}');
    await modal.updateComplete;
    expect(document.activeElement).toBe(opener);
  });

  it('clicks on slotted buttons reach listeners outside the modal', async () => {
    await setup();
    await openFromOpener();
    const onClick = vi.fn();
    document.addEventListener('click', onClick);
    container.querySelector('#confirm').click();
    document.removeEventListener('click', onClick);
    expect(onClick).toHaveBeenCalled();
    expect(modal.open).toBe(true);
  });

  it('a click on the panel does not close it', async () => {
    await setup();
    await openFromOpener();
    modal.shadowRoot.querySelector('.modal-body').click();
    await modal.updateComplete;
    expect(modal.open).toBe(true);
  });

  it('role defaults to dialog; aria-describedby points at the body', async () => {
    await setup();
    await openFromOpener();
    const dialog = modal.shadowRoot.querySelector('dialog');
    expect(modal.role).toBe('dialog');
    expect(dialog.getAttribute('role')).toBe('dialog');
    const body = modal.shadowRoot.getElementById(dialog.getAttribute('aria-describedby'));
    expect(body.classList.contains('modal-body')).toBe(true);
  });

  it('role="alertdialog" makes it an alert dialog named by its title and described by its body', async () => {
    await setup('role="alertdialog"');
    await openFromOpener();
    expect(modal.shadowRoot.querySelector('dialog').getAttribute('role')).toBe('alertdialog');
    await expect.element(page.getByRole('alertdialog', { name: 'Sign out?' })).toBeInTheDocument();
    // Chrome's own accessibility tree: exactly one alert dialog, with the slotted body as description
    const session = cdp();
    await session.send('Accessibility.enable');
    const { frameTree } = await session.send('Page.getFrameTree');
    const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
    const dialogs = nodes.filter(n => !n.ignored && /dialog/.test(n.role?.value));
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0].role.value).toBe('alertdialog');
    expect(dialogs[0].name.value).toBe('Sign out?');
    expect(dialogs[0].description.value).toContain('have not synced yet');
  });

  it('a closed modal exposes nothing, and the host keeps no role attribute', async () => {
    await setup('role="alertdialog"');
    expect(modal.role).toBe('alertdialog');
    expect(modal.hasAttribute('role')).toBe(false);
    expect(getComputedStyle(modal).display).toBe('none');
    expect(page.getByRole('alertdialog').elements()).toHaveLength(0);
  });

  it('passes axe-core as an alert dialog with slotted actions', async () => {
    await setup('role="alertdialog"');
    await openFromOpener();
    const results = await axe.run(modal, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });

  it('closes when removed while open without leaving the page locked', async () => {
    await setup();
    await openFromOpener();
    modal.remove();
    expect(document.body.style.overflow).toBe('');
    modal = null;
  });
});

// ─── Review fixes ───────────────────────────────────────────────────────────

describe('pastis-modal focus, lifecycle and tab stops', () => {
  let container;
  afterEach(async () => {
    for (const m of container?.querySelectorAll('pastis-modal') ?? []) { m.open = false; await m.updateComplete; }
    container?.remove();
    document.body.style.overflow = '';
  });

  async function mountOpen(inner, attrs = '') {
    container = document.createElement('div');
    // Modal and its Lit content are created and rendered in one pass, already open
    container.innerHTML = `<pastis-modal title="Rename list" open ${attrs}>${inner}</pastis-modal>`;
    document.body.appendChild(container);
    const modal = container.querySelector('pastis-modal');
    await modal.updateComplete;
    await frame();
    await frame();
    return modal;
  }

  it('opened in one pass with a slotted autofocus pastis-input, focuses that input', async () => {
    const modal = await mountOpen(`
      <pastis-input label="List name" value="Weekend groceries" autofocus></pastis-input>
      <pastis-button slot="footer">Save</pastis-button>`);
    const field = modal.querySelector('pastis-input');
    expect(deepActive()).toBe(field.shadowRoot.querySelector('input'));
  });

  it('opened in one pass, focuses the first slotted pastis-button (not the close button)', async () => {
    const modal = await mountOpen(`
      <p>Delete this list?</p>
      <pastis-button slot="footer" id="keep">Keep</pastis-button>
      <pastis-button slot="footer">Delete</pastis-button>`);
    expect(deepActive()).toBe(modal.querySelector('#keep').shadowRoot.querySelector('button'));
  });

  it('skips <a> without href, controls in a disabled fieldset, and unchecked radios of a group', async () => {
    const modal = await mountOpen(`
      <a>Not a link</a>
      <fieldset disabled><button>Locked</button><pastis-button>Locked too</pastis-button></fieldset>
      <fieldset><legend>Sort by</legend>
        <label><input type="radio" name="sort" value="due"> Due date</label>
        <label><input type="radio" name="sort" value="title" checked> Title</label>
        <label><input type="radio" name="sort" value="created"> Created</label>
      </fieldset>
      <button slot="footer">Apply</button>`);
    const stops = modal._getFocusableElements().map(el => el.value || el.textContent.trim() || el.className);
    expect(stops).toEqual(['✕', 'modal-body', 'title', 'Apply']);
  });

  it('a radio group with nothing checked is one stop: its first radio', async () => {
    const modal = await mountOpen(`
      <label><input type="radio" name="when" value="today"> Today</label>
      <label><input type="radio" name="when" value="tomorrow"> Tomorrow</label>
      <button slot="footer">Apply</button>`);
    const radios = modal._getFocusableElements().filter(el => el.type === 'radio');
    expect(radios.map(r => r.value)).toEqual(['today']);
  });

  it('Tab never gets stuck on or escapes through those elements', async () => {
    const modal = await mountOpen(`
      <a>Not a link</a>
      <fieldset disabled><button>Locked</button></fieldset>
      <label><input type="radio" name="sort" value="due" checked> Due date</label>
      <label><input type="radio" name="sort" value="title"> Title</label>
      <button slot="footer">Apply</button>`);
    const seen = [];
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      const a = deepActive();
      expect(modal.contains(a) || modal.shadowRoot.contains(a)).toBe(true);
      seen.push(a.value || a.textContent.trim() || a.className);
    }
    // Starts on the checked radio; the link without href, the locked button and the other radio
    // are never stops
    expect(seen).toEqual(['Apply', '✕', 'modal-body', 'due', 'Apply']);
  });

  it('reopened right after closing stays open (a stale close event is ignored)', async () => {
    const modal = await mountOpen('<p>Saved.</p>');
    const onClose = vi.fn();
    modal.addEventListener('pastis-close', onClose);
    modal.close();
    await modal.updateComplete;
    modal.open_();
    await modal.updateComplete;
    await new Promise(r => setTimeout(r, 50));
    await frame();
    expect(modal.open).toBe(true);
    expect(modal.shadowRoot.querySelector('dialog').open).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moved in the DOM while open, it is modal again and keeps the scroll lock', async () => {
    const modal = await mountOpen('<button slot="footer">Done</button>');
    const elsewhere = document.createElement('section');
    container.appendChild(elsewhere);
    elsewhere.appendChild(modal);
    await modal.updateComplete;
    await frame();
    const dialog = modal.shadowRoot.querySelector('dialog');
    expect(modal.open).toBe(true);
    expect(dialog.matches(':modal')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('passes axe-core as an open dialog (default role) with slotted content', async () => {
    const modal = await mountOpen(`
      <pastis-input label="List name" value="Weekend groceries"></pastis-input>
      <pastis-button slot="footer" variant="ghost">Cancel</pastis-button>
      <pastis-button slot="footer">Save</pastis-button>`);
    expect(modal.shadowRoot.querySelector('dialog').getAttribute('role')).toBe('dialog');
    const results = await axe.run(modal, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] });
    expect(results.violations).toHaveLength(0);
  });
});

describe('pastis-modal initial focus, with and without the close button', () => {
  let container;
  afterEach(async () => {
    for (const m of container?.querySelectorAll('pastis-modal') ?? []) { m.open = false; await m.updateComplete; }
    container?.remove();
    document.body.style.overflow = '';
  });

  /**
   * Mounts a modal titled "Unsynced changes". `oneShot` creates it already open, rendering with its
   * Lit content in one pass; otherwise it renders closed and is opened from a focused opener.
   */
  async function mount(content, { closable, oneShot }) {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="opener">Sign out</button>
      <pastis-modal title="Unsynced changes" role="alertdialog" persistent ${oneShot ? 'open' : ''}>${content}</pastis-modal>`;
    const modal = container.querySelector('pastis-modal');
    modal.closable = closable; // a boolean property that defaults to true: no attribute for false
    document.body.appendChild(container);
    if (!oneShot) {
      await modal.updateComplete;
      container.querySelector('#opener').focus();
      modal.open = true;
    }
    await modal.updateComplete;
    await frame();
    await frame();
    return modal;
  }

  const confirmation = (autofocus = '') => `
    <p>3 changes have not synced yet. Signing out discards them.</p>
    <pastis-button slot="footer" variant="ghost" id="stay">Stay signed in</pastis-button>
    <pastis-button slot="footer" variant="destructive" id="leave" ${autofocus}>Sign out anyway</pastis-button>`;

  const innerButton = (modal, id) => modal.querySelector(`#${id}`).shadowRoot.querySelector('button');

  for (const closable of [true, false]) {
    for (const oneShot of [false, true]) {
      const when = `${closable ? 'with' : 'without'} a close button, ${oneShot ? 'rendered open in one pass' : 'opened later'}`;

      it(`${when}: focuses the slotted [autofocus] pastis-button`, async () => {
        const modal = await mount(confirmation('autofocus'), { closable, oneShot });
        expect(deepActive()).toBe(innerButton(modal, 'leave'));
      });

      it(`${when}: focuses the first slotted focusable element without [autofocus]`, async () => {
        const modal = await mount(confirmation(), { closable, oneShot });
        expect(deepActive()).toBe(innerButton(modal, 'stay'));
      });

      it(`${when}: focuses a plain slotted [autofocus] button`, async () => {
        const modal = await mount(`
          <p>Your session has ended.</p>
          <button slot="footer">Later</button>
          <button slot="footer" autofocus>Sign in again</button>`, { closable, oneShot });
        expect(deepActive()).toBe(modal.querySelector('[autofocus]'));
      });

      it(`${when}: with nothing focusable slotted, focuses the ${closable ? 'close button' : 'body'}`, async () => {
        const modal = await mount('<p>Your session has ended.</p>', { closable, oneShot });
        expect(deepActive()).toBe(modal.shadowRoot.querySelector(closable ? '.close-btn' : '.modal-body'));
      });
    }
  }

  it('without a close button, focus the user moved into the content is kept', async () => {
    const modal = await mount(confirmation(), { closable: false, oneShot: false });
    modal.querySelector('#leave').focus();
    modal._focusInitialWhenReady();
    await frame();
    expect(deepActive()).toBe(innerButton(modal, 'leave'));
  });

  for (const closable of [true, false]) {
    it(`${closable ? 'with' : 'without'} a close button: skips an [autofocus] element that cannot take focus`, async () => {
      const modal = await mount(`
        <p>3 changes have not synced yet.</p>
        <fieldset disabled><pastis-button autofocus id="locked">Retry sync</pastis-button></fieldset>
        <button slot="footer" autofocus disabled>Discard</button>
        <button slot="footer" autofocus hidden>Hidden</button>
        <pastis-button slot="footer" id="stay">Stay signed in</pastis-button>
        <pastis-button slot="footer" variant="destructive" id="leave" autofocus>Sign out anyway</pastis-button>`, { closable, oneShot: false });
      expect(deepActive()).toBe(innerButton(modal, 'leave'));
    });

    it(`${closable ? 'with' : 'without'} a close button: with no usable [autofocus], falls back to the first slotted control`, async () => {
      const modal = await mount(`
        <p>3 changes have not synced yet.</p>
        <button slot="footer" autofocus disabled>Discard</button>
        <pastis-button slot="footer" id="stay">Stay signed in</pastis-button>`, { closable, oneShot: false });
      expect(deepActive()).toBe(innerButton(modal, 'stay'));
    });
  }

  it('a focus step still waiting from an earlier open does not move focus after a reopen', async () => {
    const modal = await mount(confirmation('autofocus'), { closable: true, oneShot: false });
    modal.open = false;
    await modal.updateComplete;
    // Content that is slow to render keeps the next open's focus step waiting
    const slow = modal.querySelector('p');
    let finishRendering;
    slow.updateComplete = new Promise(r => { finishRendering = r; });
    modal.open = true;
    await modal.updateComplete;
    modal.open = false;
    await modal.updateComplete;
    delete slow.updateComplete;
    modal.open = true;
    await modal.updateComplete;
    await frame();
    expect(deepActive()).toBe(innerButton(modal, 'leave'));
    // The user moves to the close button (what showModal() focused), then the slow content is done
    modal.shadowRoot.querySelector('.close-btn').focus();
    finishRendering();
    await frame();
    expect(deepActive()).toBe(modal.shadowRoot.querySelector('.close-btn'));
  });

  it('clears what showModal() focused once closed', async () => {
    const modal = await mount(confirmation(), { closable: true, oneShot: false });
    expect(modal._dialogFocus).toBe(modal.shadowRoot.querySelector('.close-btn'));
    modal.open = false;
    await modal.updateComplete;
    expect(modal._dialogFocus).toBeNull();
  });
});

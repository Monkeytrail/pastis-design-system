import './pastis-modal.js';
import '../button/pastis-button.js';
import '../input/pastis-input.js';

export default {
  title: 'Overlay/Modal',
  component: 'pastis-modal',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    title: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    open: { control: 'boolean' },
    closable: { control: 'boolean' },
    persistent: { control: 'boolean' },
  },
  render: (args) => `
    <pastis-button id="open-modal-btn" variant="primary">▶ OPEN TERMINAL</pastis-button>
    <pastis-modal
      id="demo-modal"
      title="${args.title || 'SYSTEM TERMINAL'}"
      size="${args.size || 'md'}"
      ${args.open ? 'open' : ''}
      ${args.closable !== false ? 'closable' : ''}
      ${args.persistent ? 'persistent' : ''}
    >
      <p style="margin:0;color:var(--text-secondary)">INITIALIZING SYSTEM SEQUENCE. AWAITING CONFIRMATION TO PROCEED WITH OPERATION.</p>
      <div slot="footer" style="display:flex;gap:8px;justify-content:flex-end">
        <pastis-button variant="ghost" onclick="document.getElementById('demo-modal').close()">✕ ABORT</pastis-button>
        <pastis-button variant="primary" onclick="document.getElementById('demo-modal').close()">▶ EXECUTE</pastis-button>
      </div>
    </pastis-modal>
    <script>
      document.getElementById('open-modal-btn').addEventListener('click', () => {
        document.getElementById('demo-modal').open = true;
      });
    </script>
  `,
};

export const Default = { args: { title: 'CONFIRM OPERATION', closable: true } };
export const Small = { args: { title: 'QUICK MEMO', size: 'sm', closable: true } };
export const Large = { args: { title: 'FULL MISSION BRIEFING', size: 'lg', closable: true } };

export const DeleteConfirmation = {
  render: () => `
    <pastis-button variant="destructive" id="del-btn">✕ DESTROY ACCOUNT</pastis-button>
    <pastis-modal id="del-modal" title="✕ DESTROY ACCOUNT" size="sm" closable>
      <p style="margin:0;color:var(--text-secondary)">WARNING: THIS OPERATION CANNOT BE UNDONE. ALL DATA WILL BE PERMANENTLY WIPED FROM THE SYSTEM.</p>
      <div slot="footer" style="display:flex;gap:8px;justify-content:flex-end">
        <pastis-button variant="ghost" onclick="document.getElementById('del-modal').close()">✕ ABORT</pastis-button>
        <pastis-button variant="destructive" onclick="document.getElementById('del-modal').close()">✕ DESTROY</pastis-button>
      </div>
    </pastis-modal>
    <script>
      document.getElementById('del-btn').addEventListener('click', () => {
        document.getElementById('del-modal').open = true;
      });
    </script>
  `,
};

export const OpenByDefault = {
  args: { title: 'WELCOME TO PASTIS OS', open: true, closable: true },
  render: (args) => `
    <pastis-modal title="${args.title}" open closable>
      <p style="margin:0;color:var(--text-secondary)">SYSTEM BOOT COMPLETE. THIS TERMINAL IS OPEN BY DEFAULT TO DEMONSTRATE THE COMPONENT.</p>
      <div slot="footer" style="display:flex;justify-content:flex-end">
        <pastis-button variant="primary" onclick="this.closest('pastis-modal').close()">▶ START GAME</pastis-button>
      </div>
    </pastis-modal>
  `,
};

const openerFor = (wrap, buttonSelector, modalSelector) => {
  wrap.querySelector(buttonSelector).addEventListener('pastis-click', () => {
    wrap.querySelector(modalSelector).open = true;
  });
};

/**
 * `role="alertdialog"` for a confirmation that needs an answer. Its body is the dialog's
 * description; `persistent` keeps Escape and backdrop clicks from dismissing it.
 */
export const AlertDialog = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <pastis-button variant="destructive" id="sign-out">Sign out</pastis-button>
      <pastis-modal id="sign-out-modal" role="alertdialog" title="Sign out?" size="sm" closable>
        <p style="margin:0;color:var(--text-secondary)">You have 3 changes that have not synced yet. Signing out on this device discards them.</p>
        <pastis-button slot="footer" variant="ghost" data-close>Stay signed in</pastis-button>
        <pastis-button slot="footer" variant="destructive" data-close>Sign out anyway</pastis-button>
      </pastis-modal>
    `;
    openerFor(wrap, '#sign-out', '#sign-out-modal');
    wrap.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('pastis-click', () => wrap.querySelector('pastis-modal').close()));
    return wrap;
  },
};

export const PersistentAlertDialog = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <pastis-button id="expired">Show session ended</pastis-button>
      <pastis-modal id="expired-modal" role="alertdialog" title="Session ended" size="sm" persistent>
        <p style="margin:0;color:var(--text-secondary)">Your session ended on another device. Sign in again to keep syncing.</p>
        <pastis-button slot="footer" data-close>Sign in again</pastis-button>
      </pastis-modal>
    `;
    const modal = wrap.querySelector('pastis-modal');
    modal.closable = false;
    openerFor(wrap, '#expired', '#expired-modal');
    wrap.querySelector('[data-close]').addEventListener('pastis-click', () => modal.close());
    return wrap;
  },
};

/** A form in a dialog: the slotted `autofocus` field gets focus, Tab cycles through every control. */
export const WithForm = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <pastis-button id="rename">Rename list</pastis-button>
      <pastis-modal id="rename-modal" title="Rename list" size="sm">
        <form id="rename-form" style="display:flex;flex-direction:column;gap:16px">
          <pastis-input label="List name" name="title" value="Weekend groceries" maxlength="40" autofocus></pastis-input>
        </form>
        <pastis-button slot="footer" variant="ghost" data-cancel>Cancel</pastis-button>
        <pastis-button slot="footer" data-save>Save</pastis-button>
      </pastis-modal>
    `;
    const modal = wrap.querySelector('pastis-modal');
    const form = wrap.querySelector('form');
    openerFor(wrap, '#rename', '#rename-modal');
    form.addEventListener('submit', (e) => { e.preventDefault(); modal.close(); });
    wrap.querySelector('[data-cancel]').addEventListener('pastis-click', () => modal.close());
    wrap.querySelector('[data-save]').addEventListener('pastis-click', () => form.requestSubmit());
    return wrap;
  },
};

/** The alert dialog open on load, so the accessibility checks run against the open state. */
export const AlertDialogOpen = {
  render: () => `
    <pastis-modal role="alertdialog" title="Delete “Weekend groceries”?" size="sm" open closable>
      <p style="margin:0;color:var(--text-secondary)">The list and its 12 items are deleted for everyone in the space.</p>
      <pastis-button slot="footer" variant="ghost" onclick="this.closest('pastis-modal').close()">Keep list</pastis-button>
      <pastis-button slot="footer" variant="destructive" onclick="this.closest('pastis-modal').close()">Delete list</pastis-button>
    </pastis-modal>
  `,
};

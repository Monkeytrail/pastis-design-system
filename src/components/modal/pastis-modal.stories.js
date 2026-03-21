import './pastis-modal.js';
import '../button/pastis-button.js';

export default {
  title: 'Overlay/Modal',
  component: 'pastis-modal',
  tags: ['autodocs'],
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

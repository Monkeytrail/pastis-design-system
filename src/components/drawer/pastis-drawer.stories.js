import './pastis-drawer.js';
import '../button/pastis-button.js';

export default {
  title: 'Overlay/Drawer',
  component: 'pastis-drawer',
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['right', 'left', 'bottom', 'top'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    title: { control: 'text' },
    closable: { control: 'boolean' },
    persistent: { control: 'boolean' },
  },
};

export const Right = {
  render: () => `
    <pastis-button variant="primary" id="right-btn">▶ OPEN CONFIG PANEL</pastis-button>
    <pastis-drawer id="right-drawer" title="SYSTEM CONFIG" position="right" closable>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div>
          <h3 style="margin:0 0 8px;font-size:15px;font-weight:700">DISPLAY SETTINGS</h3>
          <p style="margin:0;font-size:14px;color:var(--text-secondary)">CUSTOMIZE THE VISUAL OUTPUT OF YOUR TERMINAL.</p>
        </div>
        <div>
          <h3 style="margin:0 0 8px;font-size:15px;font-weight:700">ALERT PROTOCOL</h3>
          <p style="margin:0;font-size:14px;color:var(--text-secondary)">MANAGE HOW YOU RECEIVE ALERTS AND UPLINK UPDATES.</p>
        </div>
      </div>
      <div slot="footer" style="display:flex;gap:8px;justify-content:flex-end">
        <pastis-button variant="ghost" onclick="document.getElementById('right-drawer').close()">✕ ABORT</pastis-button>
        <pastis-button variant="primary" onclick="document.getElementById('right-drawer').close()">◆ SAVE STATE</pastis-button>
      </div>
    </pastis-drawer>
    <script>
      document.getElementById('right-btn').addEventListener('click', () => {
        document.getElementById('right-drawer').open = true;
      });
    </script>
  `,
};

export const Left = {
  render: () => `
    <pastis-button variant="secondary" id="left-btn">☰ OPEN NAV</pastis-button>
    <pastis-drawer id="left-drawer" title="NAVIGATION" position="left" closable>
      <nav style="display:flex;flex-direction:column;gap:4px">
        ${['COMMAND CENTER', 'ANALYTICS', 'ARMORY', 'AGENTS', 'ORDERS', 'SYSTEM CONFIG'].map(item => `
          <a href="#" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;text-decoration:none;color:var(--text-primary);font-size:15px;font-weight:500;transition:background 150ms" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background=''">${item}</a>
        `).join('')}
      </nav>
    </pastis-drawer>
    <script>
      document.getElementById('left-btn').addEventListener('click', () => {
        document.getElementById('left-drawer').open = true;
      });
    </script>
  `,
};

export const Bottom = {
  render: () => `
    <pastis-button variant="primary" id="bottom-btn">▶ OPEN UPLINK PANEL</pastis-button>
    <pastis-drawer id="bottom-drawer" title="UPLINK CHANNELS" position="bottom" closable>
      <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;padding:8px 0">
        ${['📧 COMMS', '🐦 SIGNAL', '💼 NETWORK', '📱 MOBILE UPLINK', '🔗 COPY LINK'].map(s => `
          <button style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 20px;border:1px solid var(--border-subtle);border-radius:10px;background:#000000;cursor:pointer;font-size:14px;font-family:inherit;color:var(--text-primary)">${s}</button>
        `).join('')}
      </div>
    </pastis-drawer>
    <script>
      document.getElementById('bottom-btn').addEventListener('click', () => {
        document.getElementById('bottom-drawer').open = true;
      });
    </script>
  `,
};

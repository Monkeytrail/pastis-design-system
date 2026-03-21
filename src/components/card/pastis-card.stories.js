import './pastis-card.js';

export default {
  title: 'Layout/Card',
  component: 'pastis-card',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'elevated', 'outlined', 'ghost'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    hoverable: { control: 'boolean' },
    clickable: { control: 'boolean' },
    selected: { control: 'boolean' },
  },
  render: (args) => `
    <pastis-card
      variant="${args.variant || 'default'}"
      padding="${args.padding || 'md'}"
      ${args.hoverable ? 'hoverable' : ''}
      ${args.clickable ? 'clickable' : ''}
      ${args.selected ? 'selected' : ''}
      style="max-width:360px"
    >
      <h3 slot="header" style="font-size:18px;font-weight:700;margin:0 0 0 0">MISSION BRIEFING</h3>
      <p style="margin:0;color:var(--text-secondary)">Loading mission data... Stand by.</p>
    </pastis-card>
  `,
};

export const Default = { args: {} };
export const Elevated = { args: { variant: 'elevated' } };
export const Outlined = { args: { variant: 'outlined' } };
export const Hoverable = { args: { hoverable: true } };
export const Selected = { args: { selected: true } };

export const WithFooter = {
  render: () => `
    <pastis-card style="max-width:360px">
      <h3 slot="header" style="font-size:18px;font-weight:700;margin:0">SYSTEM STATUS</h3>
      <p style="margin:0;color:var(--text-secondary)">NEW PATCH DEPLOYED. ENHANCED FEATURES AND BUG FIXES DETECTED.</p>
      <div slot="footer" style="display:flex;gap:8px;justify-content:flex-end">
        <pastis-button variant="ghost">✕ ABORT</pastis-button>
        <pastis-button variant="primary">▶ EXECUTE</pastis-button>
      </div>
    </pastis-card>
  `,
};

export const Grid = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:24px;max-width:900px;background:#000000;">
      <pastis-card hoverable>
        <h3 style="margin:0 0 8px;font-size:16px;font-weight:700">PLAYER STATS</h3>
        <p style="margin:0;font-size:14px;color:var(--text-secondary)">TRACK KEY METRICS AND PERFORMANCE INDICATORS.</p>
      </pastis-card>
      <pastis-card hoverable>
        <h3 style="margin:0 0 8px;font-size:16px;font-weight:700">MISSION LOGS</h3>
        <p style="margin:0;font-size:14px;color:var(--text-secondary)">GENERATE DETAILED REPORTS FROM MISSION DATA.</p>
      </pastis-card>
      <pastis-card hoverable>
        <h3 style="margin:0 0 8px;font-size:16px;font-weight:700">SYSTEM CONFIG</h3>
        <p style="margin:0;font-size:14px;color:var(--text-secondary)">CONFIGURE YOUR WORKSPACE PREFERENCES.</p>
      </pastis-card>
    </div>
  `,
};

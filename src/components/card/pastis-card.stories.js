import './pastis-card.js';

export default {
  title: 'Layout/Card',
  component: 'pastis-card',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'elevated', 'outlined', 'ghost', 'cover'] },
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

export const Cover = {
  render: () => `
    <pastis-card variant="cover" hoverable style="max-width:360px;--card-cover-min-height:400px;">
      <img
        slot="media"
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=720&q=80"
        alt="Mountain landscape at dusk"
        style="width:100%;height:100%;object-fit:cover;display:block;"
      />
      <h3 slot="header" style="font-size:20px;font-weight:700;margin:0">SECTOR 7 — MOUNTAIN PASS</h3>
      <p style="margin:4px 0 0;font-size:13px;">ELEVATION 3,400M — HOSTILE TERRAIN DETECTED</p>
      <div slot="footer" style="display:flex;gap:8px;justify-content:flex-end">
        <pastis-button variant="primary">▶ DEPLOY</pastis-button>
      </div>
    </pastis-card>
  `,
};

export const CoverGrid = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:24px;max-width:1000px;background:#000000;">
      <pastis-card variant="cover" hoverable style="--card-cover-min-height:280px;">
        <img slot="media" src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&q=70" alt="Mountain" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <h3 slot="header" style="font-size:16px;font-weight:700;margin:0">MOUNTAIN PASS</h3>
        <p style="margin:4px 0 0;font-size:12px;">ELEVATION 3,400M</p>
      </pastis-card>
      <pastis-card variant="cover" hoverable style="--card-cover-min-height:280px;">
        <img slot="media" src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=480&q=70" alt="Forest" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <h3 slot="header" style="font-size:16px;font-weight:700;margin:0">DEEP FOREST</h3>
        <p style="margin:4px 0 0;font-size:12px;">SECTOR 12 — DENSE CANOPY</p>
      </pastis-card>
      <pastis-card variant="cover" hoverable style="--card-cover-min-height:280px;">
        <img slot="media" src="https://images.unsplash.com/photo-1510784722466-f2aa240477b8?w=480&q=70" alt="Desert" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <h3 slot="header" style="font-size:16px;font-weight:700;margin:0">ARID ZONE</h3>
        <p style="margin:4px 0 0;font-size:12px;">SECTOR 9 — EXTREME HEAT</p>
      </pastis-card>
    </div>
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

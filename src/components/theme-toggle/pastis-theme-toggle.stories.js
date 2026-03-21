import './pastis-theme-toggle.js';

export default {
  title: 'Interactive/ThemeToggle',
  component: 'pastis-theme-toggle',
  tags: ['autodocs'],
};

export const Default = {
  render: () => `<pastis-theme-toggle></pastis-theme-toggle>`,
};

export const LightMode = {
  render: () => `<pastis-theme-toggle theme="light"></pastis-theme-toggle>`,
};

export const IconOnly = {
  render: () => `<pastis-theme-toggle label="false"></pastis-theme-toggle>`,
};

export const Small = {
  render: () => `<pastis-theme-toggle size="sm"></pastis-theme-toggle>`,
};

export const Large = {
  render: () => `<pastis-theme-toggle size="lg"></pastis-theme-toggle>`,
};

export const InNavbar = {
  render: () => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:var(--bg-card,#0A0A0F);border:4px solid var(--border-default,#00FF41);font-family:'Courier New',monospace;color:var(--text-primary,#00FF41)">
      <span style="font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:2px">▶ PASTIS</span>
      <pastis-theme-toggle size="sm"></pastis-theme-toggle>
    </div>
  `,
};

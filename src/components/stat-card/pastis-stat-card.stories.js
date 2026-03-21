import './pastis-stat-card.js';

export default {
  title: 'Data Display/StatCard',
  component: 'pastis-stat-card',
  tags: ['autodocs'],
};

export const Default = {
  render: () => `<pastis-stat-card label="Total Users" value="12,480" delta="+8.2%" trend="up" icon="👤"></pastis-stat-card>`,
};

export const Down = {
  render: () => `<pastis-stat-card label="Bounce Rate" value="34.7%" delta="-2.1%" trend="down" icon="📉"></pastis-stat-card>`,
};

export const Warning = {
  render: () => `<pastis-stat-card label="Error Rate" value="1.4%" delta="+0.3%" trend="up" icon="⚠" variant="warning"></pastis-stat-card>`,
};

export const Error = {
  render: () => `<pastis-stat-card label="Failed Jobs" value="47" delta="+12" trend="up" icon="✕" variant="error"></pastis-stat-card>`,
};

export const Grid = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:800px">
      <pastis-stat-card label="Revenue" value="$48,920" delta="+12.4%" trend="up" icon="💰"></pastis-stat-card>
      <pastis-stat-card label="Active Users" value="3,241" delta="+5.7%" trend="up" icon="👥"></pastis-stat-card>
      <pastis-stat-card label="Churn Rate" value="2.3%" delta="-0.4%" trend="down" variant="success" icon="📊"></pastis-stat-card>
      <pastis-stat-card label="Avg Session" value="4m 12s" delta="+18s" trend="up" icon="⏱"></pastis-stat-card>
      <pastis-stat-card label="Error Rate" value="0.8%" delta="+0.1%" trend="up" variant="warning" icon="⚠"></pastis-stat-card>
      <pastis-stat-card label="Uptime" value="99.97%" delta="─" trend="neutral" icon="✓" variant="success"></pastis-stat-card>
    </div>
  `,
};

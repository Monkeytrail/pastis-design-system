import './pastis-divider.js';

export default {
  title: 'Layout/Divider',
  component: 'pastis-divider',
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    variant: { control: 'select', options: ['solid', 'dashed', 'dotted', 'thick'] },
    label: { control: 'text' },
    spacing: { control: 'select', options: ['', 'sm', 'md', 'lg', 'xl'] },
  },
  render: (args) => `
    <div style="padding:24px;width:400px;background:#000000;">
      <p style="margin:0;color:var(--text-secondary)">SECTOR ALPHA</p>
      <pastis-divider
        orientation="${args.orientation || 'horizontal'}"
        variant="${args.variant || 'solid'}"
        ${args.label ? `label="${args.label}"` : ''}
        ${args.spacing ? `spacing="${args.spacing}"` : ''}
        style="margin:16px 0"
      ></pastis-divider>
      <p style="margin:0;color:var(--text-secondary)">SECTOR BRAVO</p>
    </div>
  `,
};

export const Default = { args: {} };
export const WithLabel = { args: { label: 'OR' } };
export const Dashed = { args: { variant: 'dashed' } };
export const Dotted = { args: { variant: 'dotted' } };
export const Thick = { args: { variant: 'thick' } };

export const Vertical = {
  render: () => `
    <div style="display:flex;align-items:center;gap:0;height:60px;padding:24px;background:#000000;">
      <span style="color:var(--text-secondary);font-size:14px">LEFT SECTOR</span>
      <pastis-divider orientation="vertical" style="height:40px;margin:0 16px"></pastis-divider>
      <span style="color:var(--text-secondary);font-size:14px">RIGHT SECTOR</span>
    </div>
  `,
};

export const SectionDividers = {
  render: () => `
    <div style="max-width:400px;padding:24px;background:#000000;">
      <h2 style="margin:0 0 8px;font-size:18px;font-weight:700">SECTOR ONE</h2>
      <p style="margin:0;color:var(--text-secondary);font-size:14px">FIRST SECTOR INTEL.</p>
      <pastis-divider spacing="lg" label="NEXT SECTOR"></pastis-divider>
      <h2 style="margin:0 0 8px;font-size:18px;font-weight:700">SECTOR TWO</h2>
      <p style="margin:0;color:var(--text-secondary);font-size:14px">SECOND SECTOR INTEL.</p>
      <pastis-divider spacing="lg"></pastis-divider>
      <h2 style="margin:0 0 8px;font-size:18px;font-weight:700">SECTOR THREE</h2>
      <p style="margin:0;color:var(--text-secondary);font-size:14px">THIRD SECTOR INTEL.</p>
    </div>
  `,
};

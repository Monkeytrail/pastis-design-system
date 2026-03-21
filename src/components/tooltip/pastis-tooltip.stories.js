import './pastis-tooltip.js';
import '../button/pastis-button.js';

export default {
  title: 'Overlay/Tooltip',
  component: 'pastis-tooltip',
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    variant: { control: 'select', options: ['dark', 'light'] },
    delay: { control: 'number' },
  },
  render: (args) => `
    <div style="padding:60px;display:flex;justify-content:center;background:#000000;">
      <pastis-tooltip
        content="${args.content || 'SYSTEM INFO'}"
        position="${args.position || 'top'}"
        ${args.variant ? `variant="${args.variant}"` : ''}
        delay="${args.delay || 300}"
      >
        <pastis-button variant="secondary">▷ HOVER_</pastis-button>
      </pastis-tooltip>
    </div>
  `,
};

export const Top = { args: { content: 'APPEARS ABOVE', position: 'top' } };
export const Bottom = { args: { content: 'APPEARS BELOW', position: 'bottom' } };
export const Left = { args: { content: 'APPEARS LEFT', position: 'left' } };
export const Right = { args: { content: 'APPEARS RIGHT', position: 'right' } };
export const Light = { args: { content: 'LIGHT MODE TOOLTIP', position: 'top', variant: 'light' } };

export const AllPositions = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:40px;padding:80px;max-width:600px;align-items:center;justify-items:center;background:#000000;">
      <div></div>
      <pastis-tooltip content="TOP NODE" position="top">
        <pastis-button variant="secondary" size="sm">▲ TOP</pastis-button>
      </pastis-tooltip>
      <div></div>
      <pastis-tooltip content="LEFT NODE" position="left">
        <pastis-button variant="secondary" size="sm">◄ LEFT</pastis-button>
      </pastis-tooltip>
      <div style="width:80px;height:40px;background:#111111;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text-tertiary)">HOVER →</div>
      <pastis-tooltip content="RIGHT NODE" position="right">
        <pastis-button variant="secondary" size="sm">RIGHT ►</pastis-button>
      </pastis-tooltip>
      <div></div>
      <pastis-tooltip content="BOTTOM NODE" position="bottom">
        <pastis-button variant="secondary" size="sm">▼ BOTTOM</pastis-button>
      </pastis-tooltip>
      <div></div>
    </div>
  `,
};

import './pastis-skeleton.js';

export default {
  title: 'Feedback/Skeleton',
  component: 'pastis-skeleton',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['rect', 'circle', 'text', 'lines'] },
    width: { control: 'text' },
    height: { control: 'text' },
    animated: { control: 'boolean' },
    lines: { control: 'number' },
  },
  render: (args) => `
    <pastis-skeleton
      variant="${args.variant || 'rect'}"
      ${args.width ? `width="${args.width}"` : ''}
      ${args.height ? `height="${args.height}"` : ''}
      ${args.animated !== false ? 'animated' : ''}
      ${args.lines ? `lines="${args.lines}"` : ''}
      style="max-width:320px"
    ></pastis-skeleton>
  `,
};

export const Rectangle = { args: { variant: 'rect', width: '320px', height: '160px' } };
export const Circle = { args: { variant: 'circle', width: '48px' } };
export const TextLines = { args: { variant: 'lines', lines: 4 } };
export const Static = { args: { variant: 'lines', animated: false, lines: 3 } };

export const CardSkeleton = {
  render: () => `
    <div style="max-width:360px;padding:24px;background:#000000;border-radius:12px">
      <pastis-skeleton variant="rect" width="100%" height="180px" animated style="margin-bottom:16px;border-radius:8px;display:block"></pastis-skeleton>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <pastis-skeleton variant="circle" width="40px" animated></pastis-skeleton>
        <div style="flex:1">
          <pastis-skeleton variant="rect" width="140px" height="14px" animated style="margin-bottom:6px;border-radius:4px;display:block"></pastis-skeleton>
          <pastis-skeleton variant="rect" width="100px" height="12px" animated style="border-radius:4px;display:block"></pastis-skeleton>
        </div>
      </div>
      <pastis-skeleton variant="lines" lines="3" animated style="display:block"></pastis-skeleton>
    </div>
  `,
};

export const ListSkeleton = {
  render: () => `
    <div style="max-width:360px;display:flex;flex-direction:column;gap:16px;padding:24px;background:#000000;">
      ${[1,2,3].map(() => `
        <div style="display:flex;align-items:center;gap:12px">
          <pastis-skeleton variant="circle" width="44px" animated></pastis-skeleton>
          <div style="flex:1;display:flex;flex-direction:column;gap:6px">
            <pastis-skeleton variant="rect" width="60%" height="14px" animated style="border-radius:4px;display:block"></pastis-skeleton>
            <pastis-skeleton variant="rect" width="40%" height="12px" animated style="border-radius:4px;display:block"></pastis-skeleton>
          </div>
        </div>
      `).join('')}
    </div>
  `,
};

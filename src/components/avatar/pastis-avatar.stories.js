import './pastis-avatar.js';

export default {
  title: 'Basics/Avatar',
  component: 'pastis-avatar',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    src: { control: 'text' },
    alt: { control: 'text' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    shape: { control: 'select', options: ['circle', 'rounded', 'square'] },
    status: { control: 'select', options: ['', 'online', 'away', 'busy', 'offline'] },
  },
  render: (args) => `
    <pastis-avatar
      name="${args.name || ''}"
      src="${args.src || ''}"
      alt="${args.alt || ''}"
      size="${args.size || 'md'}"
      shape="${args.shape || 'circle'}"
      ${args.status ? `status="${args.status}"` : ''}
    ></pastis-avatar>
  `,
};

export const WithInitials = { args: { name: 'PLAYER ONE', size: 'md' } };
export const WithImage = { args: { src: 'https://i.pravatar.cc/150?img=3', alt: 'PLAYER AVATAR', size: 'md' } };
export const WithStatus = { args: { name: 'PLAYER ONE', status: 'online', size: 'lg' } };
export const Rounded = { args: { name: 'P1', shape: 'rounded', size: 'lg' } };

export const AllSizes = {
  render: () => `
    <div style="display:flex;align-items:center;gap:16px;padding:24px;background:#000000;">
      <pastis-avatar name="PLAYER ONE" size="xs"></pastis-avatar>
      <pastis-avatar name="PLAYER ONE" size="sm"></pastis-avatar>
      <pastis-avatar name="PLAYER ONE" size="md"></pastis-avatar>
      <pastis-avatar name="PLAYER ONE" size="lg"></pastis-avatar>
      <pastis-avatar name="PLAYER ONE" size="xl"></pastis-avatar>
      <pastis-avatar name="PLAYER ONE" size="2xl"></pastis-avatar>
    </div>
  `,
};

export const WithStatusIndicators = {
  render: () => `
    <div style="display:flex;gap:16px;padding:24px;background:#000000;align-items:center">
      <pastis-avatar name="PLAYER ONE" size="lg" status="online"></pastis-avatar>
      <pastis-avatar name="PLAYER TWO" size="lg" status="away"></pastis-avatar>
      <pastis-avatar name="PLAYER THREE" size="lg" status="busy"></pastis-avatar>
      <pastis-avatar name="PLAYER FOUR" size="lg" status="offline"></pastis-avatar>
    </div>
  `,
};

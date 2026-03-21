import './pastis-button.js';

export default {
  title: 'Basics/Button',
  component: 'pastis-button',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    label: { control: 'text' },
  },
  render: (args) => `
    <pastis-button
      variant="${args.variant}"
      size="${args.size}"
      ${args.disabled ? 'disabled' : ''}
      ${args.loading ? 'loading' : ''}
    >${args.label}</pastis-button>
  `,
};

export const Primary = { args: { variant: 'primary', size: 'md', label: '▶ START GAME', disabled: false, loading: false } };
export const Secondary = { args: { variant: 'secondary', size: 'md', label: '◆ SELECT', disabled: false, loading: false } };
export const Ghost = { args: { variant: 'ghost', size: 'md', label: '✕ ABORT', disabled: false, loading: false } };
export const Destructive = { args: { variant: 'destructive', size: 'md', label: '✕ DESTROY', disabled: false, loading: false } };
export const Loading = { args: { variant: 'primary', size: 'md', label: 'LOADING...', loading: true } };
export const Disabled = { args: { variant: 'primary', size: 'md', label: 'LOCKED', disabled: true } };
export const Small = { args: { variant: 'primary', size: 'sm', label: '▶ SMALL' } };
export const Large = { args: { variant: 'primary', size: 'lg', label: '▶ EXECUTE' } };

export const AllVariants = {
  render: () => `
    <div style="display:flex;gap:16px;flex-wrap:wrap;padding:24px;background:#000000;">
      <pastis-button variant="primary">▶ START GAME</pastis-button>
      <pastis-button variant="secondary">◆ SELECT</pastis-button>
      <pastis-button variant="ghost">✕ ABORT</pastis-button>
      <pastis-button variant="destructive">✕ DESTROY</pastis-button>
      <pastis-button loading>LOADING...</pastis-button>
      <pastis-button disabled>LOCKED</pastis-button>
    </div>
  `
};

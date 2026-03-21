import './pastis-nav.js';

export default {
  title: 'Navigation/Main Navigation',
  component: 'pastis-nav',
  tags: ['autodocs'],
  argTypes: {
    brand:   { control: 'text' },
    active:  { control: 'text' },
    sticky:  { control: 'boolean' },
    variant: { control: 'select', options: ['default', 'minimal'] },
  },
  render: (args) => `
    <pastis-nav
      brand="${args.brand ?? '◆ PASTIS'}"
      active="${args.active ?? 'home'}"
      variant="${args.variant ?? 'default'}"
      ${args.sticky ? 'sticky' : ''}
      .items=${JSON.stringify(args.items ?? [])}
    >
      <pastis-button slot="actions" variant="primary" size="sm">▶ HIRE ME</pastis-button>
      <pastis-button slot="mobile-actions" variant="primary">▶ HIRE ME</pastis-button>
    </pastis-nav>
  `,
};

const defaultItems = [
  { id: 'home',    label: 'HOME',    href: '#' },
  { id: 'work',    label: 'WORK',    href: '#' },
  { id: 'about',   label: 'ABOUT',   href: '#' },
  { id: 'contact', label: 'CONTACT', href: '#' },
];

const itemsWithDropdown = [
  { id: 'home', label: 'HOME', href: '#' },
  {
    id: 'work', label: 'WORK', href: '#',
    children: [
      { id: 'web',    label: 'WEB DESIGN',   href: '#' },
      { id: 'brand',  label: 'BRANDING',     href: '#' },
      { id: 'motion', label: 'MOTION',       href: '#' },
    ],
  },
  { id: 'about',   label: 'ABOUT',   href: '#' },
  { id: 'contact', label: 'CONTACT', href: '#' },
];

export const Default = {
  args: { brand: '◆ PASTIS', active: 'home', variant: 'default', sticky: false, items: defaultItems },
};

export const Minimal = {
  args: { brand: '◆ PASTIS', active: 'work', variant: 'minimal', sticky: false, items: defaultItems },
};

export const WithDropdown = {
  args: { brand: '◆ PASTIS', active: 'home', variant: 'default', sticky: false, items: itemsWithDropdown },
};

export const Sticky = {
  args: { brand: '◆ PASTIS', active: 'home', variant: 'default', sticky: true, items: defaultItems },
};

export const MobileView = {
  args: { brand: '◆ PASTIS', active: 'home', variant: 'default', sticky: false, items: defaultItems },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

import './pastis-footer.js';

const LINKS = [
  {
    heading: 'Work',
    items: [
      { label: 'Projects',    href: '#projects' },
      { label: 'Case Studies',href: '#case-studies' },
      { label: 'Open Source', href: '#open-source' },
    ],
  },
  {
    heading: 'Info',
    items: [
      { label: 'About',   href: '#about' },
      { label: 'Resume',  href: '#resume' },
      { label: 'Contact', href: '#contact' },
    ],
  },
];

const SOCIALS = [
  { label: 'GitHub',   href: 'https://github.com',   icon: '⌥' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'in' },
  { label: 'Dribbble', href: 'https://dribbble.com', icon: '●' },
  { label: 'X / Twitter', href: 'https://x.com',    icon: '✕' },
];

export default {
  title: 'Portfolio/Footer',
  component: 'pastis-footer',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'minimal'] },
  },
  render: (args) => {
    const el = document.createElement('pastis-footer');
    el.brand     = 'Jane Doe';
    el.tagline   = 'Frontend Engineer · Design Systems · Amsterdam';
    el.copyright = `© ${new Date().getFullYear()} Jane Doe. All rights reserved.`;
    el.links     = LINKS;
    el.socials   = SOCIALS;
    el.variant   = args.variant || 'default';
    return el;
  },
};

export const Default = { args: {
  variant: "minimal"
} };

export const Minimal = { args: { variant: 'minimal' } };

export const WithThemeToggle = {
  render: () => {
    const el = document.createElement('pastis-footer');
    el.brand     = 'Jane Doe';
    el.tagline   = 'Frontend Engineer · Design Systems · Amsterdam';
    el.copyright = `© ${new Date().getFullYear()} Jane Doe.`;
    el.links     = LINKS;
    el.socials   = SOCIALS;

    const toggle = document.createElement('pastis-theme-toggle');
    toggle.setAttribute('slot', 'actions');
    el.appendChild(toggle);

    return el;
  },
};

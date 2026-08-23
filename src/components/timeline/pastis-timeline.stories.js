import './pastis-timeline.js';

const ITEMS = [
  {
    date: '2024 — Present',
    title: 'Senior Frontend Engineer',
    body: 'Leading design system architecture and component library across multiple product teams.',
    tag: 'Full-time',
    icon: '▶',
  },
  {
    date: '2022 — 2024',
    title: 'Frontend Engineer',
    body: 'Built accessible, performant UI components in React and Web Components.',
    tag: 'Full-time',
    icon: '◆',
  },
  {
    date: '2021 — 2022',
    title: 'UI Engineer — Contract',
    body: 'Delivered a white-label dashboard for a fintech startup, from design tokens to production.',
    tag: 'Contract',
    icon: '◆',
  },
  {
    date: '2019 — 2021',
    title: 'Junior Developer',
    body: 'Joined first agency role. Shipped marketing sites, e-commerce storefronts, and internal tools.',
    tag: 'Full-time',
    icon: '◆',
  },
];

export default {
  title: 'Portfolio/Timeline',
  component: 'pastis-timeline',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'compact'] },
  },
  render: (args) => {
    const el = document.createElement('pastis-timeline');
    el.items = ITEMS;
    el.variant = args.variant || 'default';
    el.style.maxWidth = '680px';
    el.style.display = 'block';
    el.style.padding = '32px';
    return el;
  },
};

export const Default  = { args: { variant: 'default' } };
export const Compact  = { args: { variant: 'compact' } };

export const Education = {
  render: () => {
    const el = document.createElement('pastis-timeline');
    el.items = [
      { date: '2015 — 2019', title: 'BSc Computer Science', body: 'University of Amsterdam. Graduated with distinction. Thesis on WebGL rendering optimisation.', tag: 'Degree', icon: '🎓' },
      { date: '2023',        title: 'AWS Certified Solutions Architect', body: 'Associate level certification.', tag: 'Cert', icon: '☁' },
      { date: '2024',        title: 'Web Accessibility Specialist (WAS)', body: 'IAAP certified. Focus on WCAG 2.2 and ARIA authoring patterns.', tag: 'Cert', icon: '♿' },
    ];
    el.style.maxWidth = '680px';
    el.style.display = 'block';
    el.style.padding = '32px';
    return el;
  },
};

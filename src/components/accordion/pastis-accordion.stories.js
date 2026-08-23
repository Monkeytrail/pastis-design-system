import './pastis-accordion.js';

const faqItems = [
  {
    id: 'q1',
    title: 'WHAT IS PASTIS DESIGN SYSTEM?',
    content: 'Pastis is a modern, component-driven design system built with Lit web components. It provides a comprehensive set of accessible, themeable UI components.',
  },
  {
    id: 'q2',
    title: 'CAN I USE IT WITH ANY FRAMEWORK?',
    content: 'Yes! Since Pastis uses standard web components, it works with any framework including React, Vue, Angular, or vanilla JavaScript.',
  },
  {
    id: 'q3',
    title: 'IS IT ACCESSIBLE?',
    content: 'All components include proper ARIA attributes, keyboard navigation support, and focus management following WCAG 2.1 guidelines.',
  },
  {
    id: 'q4',
    title: 'HOW DO I CUSTOMIZE THE THEME?',
    content: 'Pastis uses CSS custom properties for all design tokens. Override them in your stylesheet to customize colors, typography, and spacing system-wide.',
  },
];

const iconItems = faqItems.map((item, i) => ({
  ...item,
  icon: ['📦', '⚙', '♿', '🎨'][i],
}));

export default {
  title: 'Navigation/Accordion',
  component: 'pastis-accordion',
  tags: ['autodocs'],
};

export const Default = {
  render: () => {
    const el = document.createElement('pastis-accordion');
    el.items = faqItems;
    el.style.maxWidth = '600px';
    return el;
  },
};

export const Multiple = {
  render: () => {
    const el = document.createElement('pastis-accordion');
    el.items = faqItems;
    el.multiple = true;
    el.openItems = ['q1'];
    el.style.maxWidth = '600px';
    return el;
  },
};

export const WithIcons = {
  render: () => {
    const el = document.createElement('pastis-accordion');
    el.items = iconItems;
    el.style.maxWidth = '600px';
    return el;
  },
};

export const Separated = {
  render: () => {
    const el = document.createElement('pastis-accordion');
    el.items = faqItems;
    el.variant = 'separated';
    el.style.maxWidth = '600px';
    return el;
  },
};

export const Flush = {
  render: () => {
    const el = document.createElement('pastis-accordion');
    el.items = faqItems;
    el.variant = 'flush';
    el.style.maxWidth = '600px';
    return el;
  },
};

import './pastis-accordion.js';

const faqItems = [
  {
    id: 'q1',
    title: 'WHAT IS PASTIS DESIGN SYSTEM?',
    content: 'PASTIS IS A MODERN, COMPONENT-DRIVEN DESIGN SYSTEM BUILT WITH LIT WEB COMPONENTS. IT PROVIDES A COMPREHENSIVE SET OF ACCESSIBLE, THEMEABLE UI COMPONENTS.',
  },
  {
    id: 'q2',
    title: 'CAN I USE IT WITH ANY FRAMEWORK?',
    content: 'AFFIRMATIVE! SINCE PASTIS USES STANDARD WEB COMPONENTS, IT OPERATES WITH ANY FRAMEWORK INCLUDING REACT, VUE, ANGULAR, OR VANILLA JAVASCRIPT.',
  },
  {
    id: 'q3',
    title: 'IS IT ACCESSIBLE?',
    content: 'ALL COMPONENTS INCLUDE PROPER ARIA ATTRIBUTES, KEYBOARD NAVIGATION SUPPORT, AND FOCUS MANAGEMENT FOLLOWING WCAG 2.1 PROTOCOL.',
  },
  {
    id: 'q4',
    title: 'HOW DO I CUSTOMIZE THE THEME?',
    content: 'PASTIS USES CSS CUSTOM PROPERTIES FOR ALL DESIGN TOKENS. OVERRIDE THEM IN YOUR STYLESHEET TO CUSTOMIZE COLORS, TYPOGRAPHY, AND SPACING SYSTEM-WIDE.',
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

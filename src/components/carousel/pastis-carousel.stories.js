import './pastis-carousel.js';

export default {
  title: 'Interactive/Carousel',
  component: 'pastis-carousel',
  tags: ['autodocs'],
};

const slides = [
  {
    title: 'Level 01 — Getting Started',
    body: 'Install the design system and import your first component.',
  },
  {
    title: 'Level 02 — Theming',
    body: 'Apply dark or light mode via the data-theme attribute.',
  },
  {
    title: 'Level 03 — Components',
    body: '26 pixel-perfect components built with Lit Web Components.',
  },
  {
    title: 'Level 04 — Deploy',
    body: 'Ship to production. Insert coin to continue.',
  },
];

export const Default = {
  render: () => {
    const el = document.createElement('pastis-carousel');
    el.slides = slides;
    el.style.maxWidth = '480px';
    return el;
  },
};

export const FadeVariant = {
  render: () => {
    const el = document.createElement('pastis-carousel');
    el.slides = slides;
    el.variant = 'fade';
    el.style.maxWidth = '480px';
    return el;
  },
};

export const Autoplay = {
  render: () => {
    const el = document.createElement('pastis-carousel');
    el.slides = slides;
    el.autoplay = 3000;
    el.style.maxWidth = '480px';
    return el;
  },
};

export const NoLoop = {
  render: () => {
    const el = document.createElement('pastis-carousel');
    el.slides = slides;
    el.loop = false;
    el.style.maxWidth = '480px';
    return el;
  },
};

export const DotsOnly = {
  render: () => {
    const el = document.createElement('pastis-carousel');
    el.slides = slides;
    el.showArrows = false;
    el.style.maxWidth = '480px';
    return el;
  },
};

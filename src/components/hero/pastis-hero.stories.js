import './pastis-hero.js';

export default {
  title: 'Marketing/Hero',
  component: 'pastis-hero',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export const Default = {
  render: () => {
    const el = document.createElement('pastis-hero');
    el.heading = 'BUILD BETTER SYSTEMS. FASTER.';
    el.subheading = 'PASTIS IS A MODERN DESIGN SYSTEM BUILT WITH LIT WEB COMPONENTS. POWERFUL, ACCESSIBLE, AND READY FOR DEPLOYMENT.';
    el.cta = '▶ START GAME';
    el.ctaSecondary = '◆ VIEW DOCS';
    el.badge = 'NOW IN V1.0';
    return el;
  },
};

export const Centered = {
  render: () => {
    const el = document.createElement('pastis-hero');
    el.heading = 'DESIGN WITH PRECISION.';
    el.subheading = 'A COMPREHENSIVE DESIGN SYSTEM THAT EMPOWERS TEAMS TO BUILD CONSISTENT, BATTLE-TESTED DIGITAL EXPERIENCES.';
    el.cta = '▶ EXPLORE COMPONENTS';
    el.ctaSecondary = '◆ SELECT';
    el.align = 'center';
    el.gradient = true;
    return el;
  },
};

export const Dark = {
  render: () => {
    const el = document.createElement('pastis-hero');
    el.heading = 'THE FUTURE OF WEB COMPONENTS.';
    el.subheading = 'PASTIS BRINGS THE POWER OF MODERN WEB STANDARDS TO YOUR DESIGN SYSTEM, WITH ZERO DEPENDENCIES BEYOND LIT.';
    el.cta = '▶ START BUILDING';
    el.ctaSecondary = '◆ SEE EXAMPLES';
    el.variant = 'dark';
    el.gradient = true;
    el.badge = 'OPEN SOURCE';
    el.align = 'center';
    return el;
  },
};

export const WithImage = {
  render: () => {
    const el = document.createElement('pastis-hero');
    el.heading = 'SHIP WITH CONFIDENCE.';
    el.subheading = 'EVERY COMPONENT IS TESTED, ACCESSIBLE, AND DESIGNED TO PERFORM. BUILD YOUR NEXT MISSION ON A SOLID FOUNDATION.';
    el.cta = '▶ START GAME FREE';
    el.ctaSecondary = '◆ SEE DEMO';
    el.image = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80';
    el.imageAlt = 'DEVELOPER AT TERMINAL';
    return el;
  },
};

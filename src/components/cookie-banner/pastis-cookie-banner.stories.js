import './pastis-cookie-banner.js';
import '../toggle/pastis-toggle.js';

export default {
  title: 'Marketing/CookieBanner',
  component: 'pastis-cookie-banner',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    position: { control: 'select', options: ['bottom-left', 'bottom-right', 'bottom-center', 'top-left', 'top-right'] },
    showSettings: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
  },
};

export const Default = {
  render: () => {
    const el = document.createElement('pastis-cookie-banner');
    el.visible = true;
    el.position = 'bottom-left';
    return el;
  },
};

export const WithSettings = {
  render: () => {
    const el = document.createElement('pastis-cookie-banner');
    el.visible = true;
    el.showSettings = true;
    el.position = 'bottom-left';
    return el;
  },
};

export const BottomRight = {
  render: () => {
    const el = document.createElement('pastis-cookie-banner');
    el.visible = true;
    el.position = 'bottom-right';
    el.showSettings = true;
    return el;
  },
};

export const BottomCenter = {
  render: () => {
    const el = document.createElement('pastis-cookie-banner');
    el.visible = true;
    el.position = 'bottom-center';
    el.title = 'TRACKING PROTOCOL DETECTED';
    el.message = 'THIS SYSTEM USES TRACKING TOKENS TO ENHANCE YOUR EXPERIENCE, SERVE INTEL, AND ANALYZE ACTIVITY. CHOOSE YOUR CLEARANCE LEVEL.';
    el.showSettings = true;
    return el;
  },
};

export const Minimal = {
  render: () => {
    const el = document.createElement('pastis-cookie-banner');
    el.visible = true;
    el.position = 'bottom-center';
    el.title = 'COOKIE PROTOCOL';
    el.message = 'THIS SYSTEM USES TRACKING TOKENS TO IMPROVE YOUR EXPERIENCE.';
    el.acceptText = '▶ ACCEPT';
    el.rejectText = '✕ ABORT';
    return el;
  },
};

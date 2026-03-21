import './pastis-tabs.js';

const defaultTabs = [
  { id: 'overview', label: 'OVERVIEW', content: '<p style="margin:0;color:var(--text-secondary)">MISSION OVERVIEW DATA LOADED.</p>' },
  { id: 'details', label: 'DETAILS', content: '<p style="margin:0;color:var(--text-secondary)">TECHNICAL SPECS AND PARAMETERS.</p>' },
  { id: 'reviews', label: 'BATTLE LOG', badge: 12, content: '<p style="margin:0;color:var(--text-secondary)">COMBAT HISTORY AND PERFORMANCE RATINGS.</p>' },
  { id: 'faq', label: 'HELP', content: '<p style="margin:0;color:var(--text-secondary)">FREQUENTLY ASKED SYSTEM QUERIES.</p>' },
];

const iconTabs = [
  { id: 'home', label: 'BASE', icon: '🏠', content: '<p style="margin:0;color:var(--text-secondary)">WELCOME TO BASE CAMP!</p>' },
  { id: 'profile', label: 'PLAYER PROFILE', icon: '👤', content: '<p style="margin:0;color:var(--text-secondary)">YOUR PLAYER PROFILE SETTINGS.</p>' },
  { id: 'messages', label: 'COMMS', icon: '💬', badge: 3, content: '<p style="margin:0;color:var(--text-secondary)">INCOMING TRANSMISSIONS.</p>' },
  { id: 'settings', label: 'CONFIG', icon: '⚙', content: '<p style="margin:0;color:var(--text-secondary)">SYSTEM CONFIGURATION.</p>' },
];

export default {
  title: 'Navigation/Tabs',
  component: 'pastis-tabs',
  tags: ['autodocs'],
};

export const Default = {
  render: () => {
    const el = document.createElement('pastis-tabs');
    el.tabs = defaultTabs;
    return el;
  },
};

export const Pills = {
  render: () => {
    const el = document.createElement('pastis-tabs');
    el.tabs = defaultTabs;
    el.variant = 'pills';
    return el;
  },
};

export const WithIcons = {
  render: () => {
    const el = document.createElement('pastis-tabs');
    el.tabs = iconTabs;
    return el;
  },
};

export const FullWidth = {
  render: () => {
    const el = document.createElement('pastis-tabs');
    el.tabs = defaultTabs.slice(0, 3);
    el.fullWidth = true;
    el.variant = 'pills';
    el.style.maxWidth = '400px';
    return el;
  },
};

export const WithDisabled = {
  render: () => {
    const el = document.createElement('pastis-tabs');
    el.tabs = [
      ...defaultTabs.slice(0, 2),
      { id: 'disabled', label: 'LOCKED', disabled: true, content: '' },
      defaultTabs[2],
    ];
    return el;
  },
};

import './pastis-dropdown.js';

const weaponOptions = [
  { value: 'laser', label: 'LASER CANNON', icon: '🔫' },
  { value: 'plasma', label: 'PLASMA BOLT', icon: '⚡' },
  { value: 'missile', label: 'HOMING MISSILE', icon: '🚀' },
  { value: 'shield', label: 'ENERGY SHIELD', icon: '🛡' },
  { value: 'blade', label: 'PIXEL BLADE', icon: '⚔' },
  { value: 'bomb', label: 'PIXEL BOMB', icon: '💣' },
];

const levelOptions = [
  { value: 'lv1', label: 'LEVEL 01' },
  { value: 'lv2', label: 'LEVEL 02' },
  { value: 'lv3', label: 'LEVEL 03' },
  { value: 'lv4', label: 'LEVEL 04' },
  { value: 'lv5', label: 'LEVEL 05' },
  { value: 'lv6', label: 'LEVEL 06' },
  { value: 'lv7', label: 'LEVEL 07' },
];

export default {
  title: 'Basics/Dropdown',
  component: 'pastis-dropdown',
  tags: ['autodocs'],
};

export const Default = {
  render: () => {
    const el = document.createElement('pastis-dropdown');
    el.label = 'SELECT WEAPON';
    el.placeholder = '> ENTER VALUE_';
    el.options = weaponOptions;
    el.style.maxWidth = '280px';
    el.style.display = 'block';
    return el;
  },
};

export const Searchable = {
  render: () => {
    const el = document.createElement('pastis-dropdown');
    el.label = 'SELECT LEVEL';
    el.placeholder = '> ENTER VALUE_';
    el.options = levelOptions;
    el.searchable = true;
    el.style.maxWidth = '280px';
    el.style.display = 'block';
    return el;
  },
};

export const Multiple = {
  render: () => {
    const el = document.createElement('pastis-dropdown');
    el.label = 'EQUIP LOADOUT';
    el.placeholder = '> ENTER VALUE_';
    el.options = weaponOptions;
    el.multiple = true;
    el.style.maxWidth = '280px';
    el.style.display = 'block';
    return el;
  },
};

export const WithError = {
  render: () => {
    const el = document.createElement('pastis-dropdown');
    el.label = 'MISSION CLASS';
    el.placeholder = '> ENTER VALUE_';
    el.options = levelOptions;
    el.error = 'SYSTEM ERROR: SELECTION REQUIRED.';
    el.style.maxWidth = '280px';
    el.style.display = 'block';
    return el;
  },
};

export const Disabled = {
  render: () => {
    const el = document.createElement('pastis-dropdown');
    el.label = 'LOCKED DROPDOWN';
    el.placeholder = 'ACCESS DENIED';
    el.options = weaponOptions;
    el.disabled = true;
    el.style.maxWidth = '280px';
    el.style.display = 'block';
    return el;
  },
};

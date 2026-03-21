import './pastis-breadcrumb.js';

const items = [
  { id: 'home', label: 'BASE CAMP', href: '/', icon: '🏠' },
  { id: 'products', label: 'ARMORY', href: '/products' },
  { id: 'category', label: 'TECH GEAR', href: '/products/electronics' },
  { id: 'item', label: 'PIXEL LAUNCHER X14' },
];

export default {
  title: 'Navigation/Breadcrumb',
  component: 'pastis-breadcrumb',
  tags: ['autodocs'],
};

export const Default = {
  render: () => {
    const el = document.createElement('pastis-breadcrumb');
    el.items = items;
    return el;
  },
};

export const CustomSeparator = {
  render: () => {
    const el = document.createElement('pastis-breadcrumb');
    el.items = items;
    el.separator = '›';
    return el;
  },
};

export const ArrowSeparator = {
  render: () => {
    const el = document.createElement('pastis-breadcrumb');
    el.items = items;
    el.separator = '→';
    return el;
  },
};

export const WithMaxItems = {
  render: () => {
    const el = document.createElement('pastis-breadcrumb');
    el.items = [
      { id: 'home', label: 'BASE CAMP', href: '/' },
      { id: 'store', label: 'ARMORY', href: '/store' },
      { id: 'category', label: 'TECH GEAR', href: '/store/electronics' },
      { id: 'subcategory', label: 'SYSTEMS', href: '/store/electronics/computers' },
      { id: 'brand', label: 'CORE-X', href: '/store/electronics/computers/core-x' },
      { id: 'product', label: 'PIXEL LAUNCHER X14' },
    ];
    el.maxItems = 3;
    return el;
  },
};

export const ShortPath = {
  render: () => {
    const el = document.createElement('pastis-breadcrumb');
    el.items = [
      { id: 'home', label: 'BASE CAMP', href: '/' },
      { id: 'page', label: 'MISSION LOG' },
    ];
    return el;
  },
};

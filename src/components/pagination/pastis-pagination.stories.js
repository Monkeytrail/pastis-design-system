import './pastis-pagination.js';

export default {
  title: 'Navigation/Pagination',
  component: 'pastis-pagination',
  tags: ['autodocs'],
  argTypes: {
    total: { control: 'number' },
    page: { control: 'number' },
    pageSize: { control: 'number' },
    variant: { control: 'select', options: ['default', 'pills', 'minimal'] },
    showInfo: { control: 'boolean' },
  },
  render: (args) => {
    const el = document.createElement('pastis-pagination');
    el.total = args.total || 100;
    el.page = args.page || 5;
    el.pageSize = args.pageSize || 10;
    el.variant = args.variant || 'default';
    el.showInfo = args.showInfo || false;
    return el;
  },
};

export const Default = { args: { total: 100, page: 5, pageSize: 10 } };
export const Pills = { args: { total: 100, page: 5, variant: 'pills' } };
export const Minimal = { args: { total: 100, page: 5, variant: 'minimal' } };
export const WithInfo = { args: { total: 100, page: 3, showInfo: true } };
export const FewPages = { args: { total: 30, page: 2, pageSize: 10 } };
export const ManyPages = { args: { total: 500, page: 15, pageSize: 10 } };

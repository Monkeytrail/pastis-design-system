import './pastis-filter-chip.js';

export default {
  title: 'Interactive/FilterChip',
  component: 'pastis-filter-chip',
  tags: ['autodocs'],
};

export const Default = {
  render: () => `<pastis-filter-chip label="All" value="all"></pastis-filter-chip>`,
};

export const Selected = {
  render: () => `<pastis-filter-chip label="Active" value="active" selected></pastis-filter-chip>`,
};

export const WithCount = {
  render: () => `<pastis-filter-chip label="Errors" value="errors" icon="✕" count="14"></pastis-filter-chip>`,
};

export const Removable = {
  render: () => `<pastis-filter-chip label="JavaScript" value="js" selected removable></pastis-filter-chip>`,
};

export const FilterBarExample = {
  render: () => {
    const el = document.createElement('pastis-filter-bar');
    el.label = 'Status';
    el.filters = [
      { label: 'All',      value: 'all',     count: 42 },
      { label: 'Active',   value: 'active',  count: 28, icon: '●' },
      { label: 'Pending',  value: 'pending', count: 9,  icon: '◐' },
      { label: 'Inactive', value: 'inactive',count: 5,  icon: '○' },
    ];
    return el;
  },
};

export const TechFilter = {
  render: () => {
    const el = document.createElement('pastis-filter-bar');
    el.label = 'Tech';
    el.filters = [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python',     value: 'py' },
      { label: 'Rust',       value: 'rs' },
      { label: 'Go',         value: 'go' },
    ];
    el.active = ['js', 'ts'];
    return el;
  },
};

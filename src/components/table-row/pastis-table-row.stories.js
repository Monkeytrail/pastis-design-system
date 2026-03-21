import './pastis-table-row.js';

export default {
  title: 'Data Display/Table',
  component: 'pastis-table',
  tags: ['autodocs'],
};

const columns = [
  { key: 'name',   label: 'Name' },
  { key: 'role',   label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'joined', label: 'Joined' },
];

const rows = [
  { id: '1', name: 'Ada Lovelace',  role: 'Engineer',  status: 'Active',    joined: '2022-01-15' },
  { id: '2', name: 'Alan Turing',   role: 'Researcher', status: 'Active',   joined: '2021-08-03' },
  { id: '3', name: 'Grace Hopper',  role: 'Admin',     status: 'Inactive',  joined: '2020-11-22' },
  { id: '4', name: 'Linus Torvalds',role: 'Engineer',  status: 'Active',    joined: '2023-03-07' },
];

export const Default = {
  render: () => {
    const el = document.createElement('pastis-table');
    el.columns = columns;
    el.rows = rows;
    return el;
  },
};

export const Striped = {
  render: () => {
    const el = document.createElement('pastis-table');
    el.columns = columns;
    el.rows = rows;
    el.striped = true;
    el.hoverable = true;
    return el;
  },
};

export const Selectable = {
  render: () => {
    const el = document.createElement('pastis-table');
    el.columns = columns;
    el.rows = rows;
    el.selectable = true;
    el.hoverable = true;
    return el;
  },
};

export const Loading = {
  render: () => {
    const el = document.createElement('pastis-table');
    el.columns = columns;
    el.rows = [];
    el.loading = true;
    return el;
  },
};

export const Empty = {
  render: () => {
    const el = document.createElement('pastis-table');
    el.columns = columns;
    el.rows = [];
    el.emptyText = 'No records found. Try adjusting your filters.';
    return el;
  },
};

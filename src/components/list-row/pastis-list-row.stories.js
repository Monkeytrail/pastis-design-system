import './pastis-list-row.js';
import '../button/pastis-button.js';

/** List rows in a grouped card: navigation rows, and entries with a trailing action. */
export default {
  title: 'Basics/ListRow',
  component: 'pastis-list-row',
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' } },
  render: () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <pastis-list-group role="list" aria-label="Smart lists">
        <pastis-list-row href="#today" icon="today" label="Today" count="3" link-label="Today, 3 open items"></pastis-list-row>
        <pastis-list-row href="#flagged" icon="flag" label="Flagged" count="1" link-label="Flagged, 1 open item"></pastis-list-row>
        <pastis-list-row href="#tag" marker="#" label="groceries" count="4" link-label="Tag groceries, 4 open items"></pastis-list-row>
      </pastis-list-group>`;
    wrap.addEventListener('pastis-navigate', e => e.preventDefault());
    return wrap;
  },
};

export const Navigation = {};

export const WithTrailingAction = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <pastis-list-group role="list" aria-label="Deleted">
        <pastis-list-row label="Oat milk" meta="in Groceries">
          <pastis-button slot="trailing" size="sm" variant="secondary" aria-label="Restore Oat milk">Restore</pastis-button>
        </pastis-list-row>
        <pastis-list-row label="Hardware store" meta="list">
          <pastis-button slot="trailing" size="sm" variant="secondary" aria-label="Restore Hardware store">Restore</pastis-button>
        </pastis-list-row>
      </pastis-list-group>`;
    return wrap;
  },
};

export const Empty = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<pastis-list-group role="list" aria-label="Lists"></pastis-list-group>`;
    return wrap;
  },
};

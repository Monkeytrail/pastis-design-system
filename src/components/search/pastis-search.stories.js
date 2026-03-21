import './pastis-search.js';

const targets = [
  { label: 'PIXEL APPLE', icon: '🍎', sub: 'FOOD ITEM' },
  { label: 'PIXEL BANANA', icon: '🍌', sub: 'FOOD ITEM' },
  { label: 'PIXEL CHERRY', icon: '🍒', sub: 'FOOD ITEM' },
  { label: 'PIXEL GRAPE', icon: '🍇', sub: 'FOOD ITEM' },
  { label: 'PIXEL MANGO', icon: '🥭', sub: 'TROPICAL ITEM' },
  { label: 'PIXEL ORANGE', icon: '🍊', sub: 'CITRUS ITEM' },
  { label: 'PIXEL PINEAPPLE', icon: '🍍', sub: 'TROPICAL ITEM' },
  { label: 'PIXEL STRAWBERRY', icon: '🍓', sub: 'BERRY ITEM' },
];

export default {
  title: 'Basics/Search',
  component: 'pastis-search',
  tags: ['autodocs'],
};

export const Default = {
  render: () => {
    const el = document.createElement('pastis-search');
    el.placeholder = '▷ SEARCH_';
    el.label = '▷ SEARCH_';
    el.style.maxWidth = '360px';
    el.style.display = 'block';

    el.addEventListener('pastis-search', (e) => {
      const query = e.detail.value.toLowerCase();
      el.suggestions = query ? targets.filter(f => f.label.toLowerCase().includes(query)) : targets;
    });

    el.addEventListener('focus', () => { el.suggestions = targets; }, true);
    return el;
  },
};

export const WithSuggestions = {
  render: () => {
    const el = document.createElement('pastis-search');
    el.placeholder = '▷ SEARCH_';
    el.suggestions = targets.slice(0, 5);
    el.open = true;
    el.value = 'a';
    el.style.maxWidth = '360px';
    el.style.display = 'block';
    return el;
  },
};

export const Loading = {
  render: () => {
    const el = document.createElement('pastis-search');
    el.placeholder = 'LOADING...';
    el.loading = true;
    el.value = 'mango';
    el.style.maxWidth = '360px';
    el.style.display = 'block';
    return el;
  },
};

export const NoResults = {
  render: () => {
    const el = document.createElement('pastis-search');
    el.placeholder = '▷ SEARCH_';
    el.suggestions = [];
    el.open = true;
    el.value = 'xyz';
    el.noResultsText = 'NO TARGETS FOUND MATCHING "XYZ"';
    el.style.maxWidth = '360px';
    el.style.display = 'block';
    return el;
  },
};

export const Sizes = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;max-width:360px;padding:24px;background:#000000;">
      <pastis-search size="sm" placeholder="▷ SMALL SEARCH_"></pastis-search>
      <pastis-search size="md" placeholder="▷ MEDIUM SEARCH_"></pastis-search>
      <pastis-search size="lg" placeholder="▷ LARGE SEARCH_"></pastis-search>
    </div>
  `,
};

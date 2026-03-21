import './pastis-empty-state.js';

export default {
  title: 'Feedback/EmptyState',
  component: 'pastis-empty-state',
  tags: ['autodocs'],
};

export const Default = {
  render: () => `
    <pastis-empty-state
      icon="📭"
      heading="Nothing here yet"
      body="Get started by creating your first item."
      cta="Create Item"
    ></pastis-empty-state>
  `,
};

export const SearchNoResults = {
  render: () => `
    <pastis-empty-state
      variant="search"
      heading="No results found"
      body="We couldn't find anything matching &quot;pixel art&quot;. Try a different search term."
      cta="Clear Search"
      cta-secondary="Browse All"
    ></pastis-empty-state>
  `,
};

export const Error = {
  render: () => `
    <pastis-empty-state
      variant="error"
      icon="💀"
      heading="Something went wrong"
      body="Failed to load data. Check your connection and try again."
      cta="Retry"
    ></pastis-empty-state>
  `,
};

export const NoActions = {
  render: () => `
    <pastis-empty-state
      icon="🔒"
      heading="Access restricted"
      body="You don't have permission to view this content. Contact your administrator."
    ></pastis-empty-state>
  `,
};

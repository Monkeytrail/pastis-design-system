import './pastis-token-swatch.js';

export default {
  title: 'Foundations/TokenSwatch',
  component: 'pastis-token-swatch',
  tags: ['autodocs'],
};

const tokens = [
  ['--bg-primary', 'Background'],
  ['--bg-card', 'Card'],
  ['--text-primary', 'Text'],
  ['--text-tertiary', 'Text muted'],
  ['--action-primary', 'Primary'],
  ['--action-secondary', 'Secondary'],
];

export const Palette = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;max-width:900px">
      ${tokens.map(([t, l]) => `<pastis-token-swatch token="${t}" label="${l}"></pastis-token-swatch>`).join('')}
    </div>
  `,
};

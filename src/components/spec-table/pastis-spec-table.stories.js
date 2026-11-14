import './pastis-spec-table.js';

export default {
  title: 'Foundations/SpecTable',
  component: 'pastis-spec-table',
  tags: ['autodocs'],
};

export const Type = {
  render: () => `<pastis-spec-table kind="type" caption="Type scale" tokens='["--font-size-statement-xl","--font-size-statement-lg","--font-size-statement-md","--font-size-h3","--font-size-body"]'></pastis-spec-table>`,
};

export const Space = {
  render: () => `<pastis-spec-table kind="space" caption="Spacing" tokens='["--space-xs","--space-sm","--space-md","--space-lg","--space-xl","--space-2xl","--space-3xl","--space-4xl"]'></pastis-spec-table>`,
};

export const Radius = {
  render: () => `<pastis-spec-table kind="radius" caption="Radius" tokens='["--radius-sm","--radius-md","--radius-xl","--radius-full"]'></pastis-spec-table>`,
};

export const Motion = {
  render: () => `<pastis-spec-table kind="motion" caption="Motion — hover a row" tokens='["--duration-fast","--duration-base","--duration-slow","--duration-reveal"]'></pastis-spec-table>`,
};
